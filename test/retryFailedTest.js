var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var should = chai.should();

chai.use(chaiHttp);

it('should return 200 when accessing the first page', function(done) {
    chai.request(app)
        .get('/retryFailed')
        .end(function(err, res){
            res.should.have.status(200);
            done();
        });
});

describe('Generate report',function () {
    it('V2P should return 200', function (done) {
        this.timeout(25000);
        chai.request(app)
            .post('/retryFailed')
            .send({'Email':'testtest@tugo.com' , 'from': '2018-02-04' ,'to':'2018-02-05','options':'V2P-POLICY-TRANSFER-STATUS'})
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.html;
                done();
            })
    });
    it('both sides should return 200', function (done) {
        this.timeout(25000);
        chai.request(app)
            .post('/retryFailed')
            .send({'Email':'testtest@tugo.com' , 'from': '2018-02-04' ,'to':'2018-02-05','options':'Send both if not specified'})
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.html;
                done();
            })
    });
});