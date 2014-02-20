var nconf  = require('nconf'),
    unzip  = require('unzip'),
    https  = require('https'),
    fs     = require('fs'),
    prompt = require('prompt');


/**
 * Get user info from previous config or
 * otherwise prompt him
 * @param  {Function} cb - callback
 */
function getInfo (cb) {
  nconf.file('config.json');

  if (fs.existsSync('config.json')) {
    return cb(null, nconf.get());
  }
  else {
    return getUserInfo(cb);
  }
}


function getUserInfo (cb) {
  prompt.start();

  prompt.message = '';
  prompt.delimiter = '';

  prompt.get({
    properties: {
      domain: {
        description: '3scale admin domain '.magenta,
        required: true,
        pattern: /\w+-admin\.3scale\.net/,
        message: 'Wrong format (e.g. mycompany-admin.3scale.net)'
      },
      providerKey: {
        description: 'provider key '.magenta,
        required: true
      }
    }
  }, function (err, response) {
    if (err) return cb(err);
    saveInfo({
      domain: response.domain,
      providerKey: response.providerKey
    }, cb)
  });
}


function saveInfo (userInput, cb) {
  // save user info to 'config.json'
  nconf.file('config.json');

  for (var param in userInput) {
    if (userInput.hasOwnProperty(param))
      nconf.set(param, userInput[param]);
  }
  nconf.save(function (err) {
    if (err) return cb(err);
    return cb(null, userInput);
  });
}


/**
 * Request zip file and unzip it to disk
 * @param  {Object}   opts - request options
 * @param  {Function} cb   - callback
 */
function requestZipBundle (opts, cb) {
  var req = https.request(opts, function (response) {
    unpackZipResponse(response, cb);
  });
  req.on('error', function (err) {
    return cb(err);
  });
  req.end();
}


function unpackZipResponse (response, cb) {
  response
    .pipe(unzip.Extract({ path: __dirname + '/nginx-conf' }))
    .on('close', function () {
      return cb(null);
    })
    .on('error', function (err) {
      return cb(err);
    });
}


exports.getInfo = getInfo;
exports.getUserInfo = getUserInfo;
exports.requestZipBundle = requestZipBundle;