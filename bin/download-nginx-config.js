#!/usr/bin/env node
var mod = require('../index.js');

var defaults = {
  port: 443,
  path: '/admin/api/nginx.zip?provider_key=',
  method: 'GET'
};

function main () {
  mod.getUserInfo(function (err, userInput) {
    if (err) throw new Error(err);
    var opts = defaults;
    opts.hostname = userInput.domain;
    opts.path = opts.path + userInput.providerKey;

    mod.requestZipBundle(opts, function (err) {
      if (err) throw new Error(err);
      console.log('files downloaded! woohoo!');
    });
  });
}

if (require.main === module) {
  main();
}