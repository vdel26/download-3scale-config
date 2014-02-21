var expect = require('chai').expect,
    app    = require('../index.js'),
    prompt = require('prompt'),
    fs     = require('fs'),
    path   = require('path'),
    rm     = require('rimraf'),
    nock   = require('nock');


describe('Nginx download app', function () {
  describe('#getInfo', function () {
    beforeEach(function (){
      prompt.override = {
        domain: 'dummydomain-admin.3scale.net',
        providerKey: '1234567890ABC',
        nginxPath: '/home/nginx-conf'
      };
    });

    afterEach(function () {
      // delete config.json created with user input
      fs.unlinkSync('.config.json');
    });

    it('should require three inputs', function (done) {
      app.getInfo(function (err, res) {
        expect(res).to.have.a.property('domain', 'dummydomain-admin.3scale.net');
        expect(res).to.have.a.property('providerKey', '1234567890ABC');
        expect(res).to.have.a.property('nginxPath', '/home/nginx-conf');
        expect(Object.keys(res).length).to.equal(3);
        done();
      });
    });

    it('should create a config.json file with expected properties', function (done) {
      app.getInfo(function (res) {
        var conf;
        try { conf = require('../.config.json'); } catch (e) {}
        expect(conf).to.exist;
        expect(conf).to.have.a.property('domain', 'dummydomain-admin.3scale.net');
        expect(conf).to.have.a.property('providerKey', '1234567890ABC');
        done();
      });
    });
  });


  describe('#requestZipBundle', function () {
    var extractPath = path.resolve(process.env.HOME, '3scale-nginx-conf');

    beforeEach(function () {
      nock('https://dummydomain-admin.3scale.net')
        .get('/admin/api/nginx.zip?provider_key=1234567890ABC')
        .reply(200, function (res) {
          return fs.createReadStream(__dirname + '/nginxtest.zip');
        });
    });

    afterEach(function (done) {
      // delete folder with unzipped files
      rm(extractPath, done);
    });

    it('should download nginxtest.zip and unzip it to /nginx-conf', function (done) {
      var opts = {
        hostname: 'dummydomain-admin.3scale.net',
        port: 443,
        path: '/admin/api/nginx.zip?provider_key=1234567890ABC',
        method: 'GET'
      };
      app.requestZipBundle(opts, extractPath, function (err) {
        expect(fs.existsSync(extractPath)).to.be.true;
        done();
      });
    });
  });
});