var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var should = chai.should();

chai.use(chaiHttp);

it('should return 200 when accessing the first page', function(done) {
    chai.request(app)
        .get('/missingProduct')
        .end(function(err, res){
            res.should.have.status(200);
            done();
        });
});

describe('Generate report',function () {
    it('should return 200', function (done) {
        this.timeout(25000);
        chai.request(app)
            .post('/missingProduct')
            .send({'Email':'testtest@tugo.com' , 'from': '2018-02-04' ,'to':'2018-02-06'})
            .end(function (err, res) {
                res.should.have.status(200);
                res.should.be.html;
                done();
            })
    });
});