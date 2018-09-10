var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
const sgMail = require('@sendgrid/mail');
var fs = require('fs');
var URL = require('url').URL;
var json2xls = require('json2xls');
var winston = require('../config/winston');
var config = JSON.parse(fs.readFileSync("config/config.json"));
var POLICY_FAILURE_URL = JSON.parse(fs.readFileSync("config/URLS.json"));
var JS_REPORT_TEST = POLICY_FAILURE_URL.JS_REPORT_TEST;
var JS_REPORT = POLICY_FAILURE_URL.JS_REPORT;
var jsreportConfig =  JSON.parse(fs.readFileSync("config/jsreport.json"));
var user = jsreportConfig.user;
var password = jsreportConfig.password;
sgMail.setApiKey(config.API_KEY);

router.get('/', function (req, res) {

    res.render('firstPage', {title: "Missing products setup"})

});

router.post('/', function (req, res) {

    var startDate = req.body.from;
    var endDate = req.body.to;
    var email = req.body.Email;

    var myUrl = new URL(POLICY_FAILURE_URL.POLICY_FAILURE);

    myUrl.searchParams.set('fromTime', startDate);
    myUrl.searchParams.set('toTime', endDate);
//This is the monitor api
    const external = {
        method: 'GET',
        url: myUrl,
        json: true
    };
    var result = [];

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
                        for (var i = 0; i < response.content.length; i++) {
                            if (response.content[i].error.toString().includes("PRODUCT_NOT_FOUND") || response.content[i].error.toString().includes("Product:")) {
                                result.push(response.content[i]);
                            }
                        }
                        var finalResult = {"content": result};

                        var data = {
                            template: {
                                'shortid': 'BJ8POGsL7'
                            },
                            data: finalResult
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
                            .pipe(fs.createWriteStream('missing product setup in Atlas.xlsx')).on('finish', function () {
                            sendEmail(startDate, endDate, email);
                            res.render('finishPage', {status: ""});
                        })
                            .on('error', function (err) {
                                res.render('error', {error: err});
                                winston.error(err.message);
                            });


                        winston.info("finish write in file!!");

                    })
                    .catch(function (error) {
                        res.render('error', {error: error});
                        winston.error(error)
                    });
            } else {
                winston.info('jsreport server is down, using the normal excel generation instead');
                rp(external)
                    .then(function (response) {
                        for (var i = 0; i < response.content.length; i++) {
                            if (response.content[i].error.toString().includes("PRODUCT_NOT_FOUND") || response.content[i].error.toString().includes("Product:")) {
                                result.push(response.content[i]);
                            }
                        }
                        try {
                            var xls = json2xls(result, {fields: ['id', 'partnerId', 'error']});
                            fs.writeFileSync('missing product setup in Atlas.xlsx', xls, 'binary');
                        } catch (error) {
                            winston.error(error);
                            res.render('error');
                        }
                        sendEmail(startDate, endDate, email);
                        res.render('finishPage', {status: ""});

                        winston.info("finish write in file!!");

                    })
                    .catch(function (error) {
                        res.render('error', {error: error});
                        winston.error(error)
                    });
            }
        });
    testAPI.on('error', (e) => {
        winston.error('problem with request: ' + e.message);
        res.render('error');
    });
    testAPI.end();
});


function sendEmail(start, end, email) {
    var data = fs.readFileSync('./missing product setup in Atlas.xlsx');

    const msg = {
        to: email,
        from: 'report@tugo.com',
        subject: 'Missing product setup in Atlas from ' + start + ' to ' + end,
        html: '<p> Hi, thank you for using TuGo report generation.</p>' +
        '<p>' + 'The attachment contains missing products setup in Atlas from ' + start + ' to ' + end + '</p>' + "<p>Best regards,</p>",
        attachments: [
            {
                content: new Buffer(data).toString('base64'),
                filename: 'Missing product setup in Atlas from ' + start + ' to ' + end + '.xlsx',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                disposition: 'attachment'
            }
        ]
    };
    sgMail.send(msg, function (err) {
        if (err) {
            winston.error(err);
        }
        winston.info("Email sent")

    });

}

module.exports = router;