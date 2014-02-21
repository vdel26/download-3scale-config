#!/usr/bin/env node
var mod   = require('../index.js'),
    fs    = require('fs'),
    path  = require('path');

var dirPath = path.resolve(__dirname, '..');

var defaults = {
  port: 443,
  path: '/admin/api/nginx.zip?provider_key=',
  method: 'GET'
};

function main () {
  mod.getInfo(function (err, userInput) {
    if (err) {
      console.log('ERROR: ' + err.message);
      return process.exit(1);
    }
    var opts = defaults;
    opts.hostname = userInput.domain;
    opts.path = opts.path + userInput.providerKey;

    mod.requestZipBundle(opts, userInput.nginxPath, function (err) {
      if (err) {
        console.log('ERROR: ' + err.message);
        fs.unlinkSync('config.json');
        return process.exit(1);
      }
      console.log('Nginx configuration were downloaded to ' + userInput.nginxPath);
    });
  });
}

if (require.main === module) {
  // call with --reset option to delete existing configuration
  if (process.argv[2] === '--reset' && fs.existsSync('config.json')) {
    fs.unlinkSync('config.json')
  }
  main();
}