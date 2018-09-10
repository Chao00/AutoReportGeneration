var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
const sgMail = require('@sendgrid/mail');
var fs = require('fs');
var URL = require('url').URL;
var json2xls = require('json2xls');
var config = JSON.parse(fs.readFileSync("config/config.json"));
var POLICY_FAILURE_URL = JSON.parse(fs.readFileSync("config/URLS.json"));
var JS_REPORT_TEST = POLICY_FAILURE_URL.JS_REPORT_TEST;
var JS_REPORT = POLICY_FAILURE_URL.JS_REPORT;
var winston = require('../config/winston');
var jsreportConfig =  JSON.parse(fs.readFileSync("config/jsreport.json"));
var user = jsreportConfig.user;
var password = jsreportConfig.password;
sgMail.setApiKey(config.API_KEY);
var side;

/* GET users listing. */
router.get('/', function (req, res) {

    res.render('firstPage', {title: "Policy transfer report"});

});


router.post('/', function (req, res) {

    var startDate = req.body.from;
    var endDate = req.body.to;
    var email = req.body.Email;
    var option = req.body.options;
    side = option;

    if (option === 'Send both if not specified') {
        option = ''
    }
    side = sideDetection(side);

    var myUrl = new URL(POLICY_FAILURE_URL.POLICY_FAILURE);

    myUrl.searchParams.set('fromTime', startDate);
    myUrl.searchParams.set('toTime', endDate);
    myUrl.searchParams.set('monitorType', option);
    winston.info(myUrl.href);

//This is the monitor api
    const external = {
        method: 'GET',
        url: myUrl,
        json: true
    };

    var http = require('http'),
        url = require('url'),
        options = {
            method: 'HEAD',
            host: url.parse(JS_REPORT_TEST).host,
            port: 80,
            path: url.parse(JS_REPORT_TEST).pathname
        },
        testAPI = http.request(options, function (r) {
            var jsReport = JSON.stringify(r.statusCode);
            if (jsReport === '200') {
                winston.info('jsreport server is up, using jsreport to generate excel');
                rp(external)
                    .then(function (response) {

                        var data = {
                            template: {
                                'shortid': 'Bk3UUzsUX'
                            },
                            data: response
                        };
                        var auth = new Buffer(user + ':' + password).toString('base64');
                        var options = {
                            url: JS_REPORT,
                            method: 'POST',
                            json: data,
                            headers: {
                                Authorization: 'Basic ' + auth,
                                'Content-Type': 'application/json'
                            }
                        };

                        request(options).on('error', function (error) {
                            res.render('error');
                            winston.error(error);
                        })
                            .pipe(fs.createWriteStream('policy failure.xlsx')).on('finish', function () {
                            sendEmail(startDate, endDate, email);
                            res.render('finishPage', {status: ""});
                        })
                            .on('error', function (err) {
                                res.render('error');
                                winston.error(err.message);
                            });

                        winston.info("finish write in file!!");

                    })
                    .catch(function (error) {
                        res.render('error', {error: error});
                        winston.error(error)
                    })

            } else {
                winston.info('jsreport server is down, using the normal excel generation instead');
                rp(external)
                    .then(function (response) {
                        winston.debug("finish calling external!!!");
                        try {
                            var xls = json2xls(response.content);
                            fs.writeFileSync('policy failure.xlsx', xls, 'binary');
                        } catch (error) {
                            winston.error(error);
                            res.render('error');
                        }

                        sendEmail(startDate, endDate, email);
                        res.render('finishPage', {status: ""});

                        winston.info("finish write in file!!");

                    })
                    .catch(function (error) {
                        res.render('error');
                        winston.error(error);
                    })
            }
        });

    testAPI.on('error', (e) => {
        winston.error('problem with request: ' + e.message);
        res.render('error');
    });
    testAPI.end();

});

function sendEmail(start, end, email) {
    var data = fs.readFileSync('./policy failure.xlsx');

    const msg = {
        to: email,
        from: 'report@tugo.com',
        subject: 'Policy transfer failure report from ' + start + ' to ' + end,
        html: '<p> Hi, thank you for using TuGo report generation.</p>' +
        '<p>' + 'The attachment contains policy transfer failures for ' + side + ' from ' + start + ' to ' + end + '.' + '</p>' + "<p>Best regards,</p>",
        attachments: [
            {
                content: new Buffer(data).toString('base64'),
                filename: 'Policy transfer failure ' + start + ' to ' + end + '.xlsx',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                disposition: 'attachment'
            }
        ]
    };
    sgMail.send(msg, function (err, res) {
        if (err) {
            winston.error(err);
            res.render('error')
        }
        winston.info("Email sent")
    });
}

function sideDetection(side) {
    if (side === 'P2V-POLICY-TRANSFER-STATUS') {
        side = 'P2V'
    } else if (side === 'V2P-POLICY-TRANSFER-STATUS') {
        side = 'V2P'
    } else {
        side = 'both sides'
    }
    return side;
}


module.exports = router;