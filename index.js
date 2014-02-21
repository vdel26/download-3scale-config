var nconf  = require('nconf'),
    unzip  = require('unzip'),
    https  = require('https'),
    fs     = require('fs'),
    path   = require('path'),
    prompt = require('prompt');


/**
 * Get user info from previous config
 * if exists, otherwise from user input
 * @param  {Function} cb - callback
 */
function getInfo (cb) {
  if (fs.existsSync('.config.json')) {
    // use existing configuration
    nconf.file('.config.json');
    return cb(null, nconf.get());
  }
  else {
    // ask the user
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
        description: 'Provider key '.magenta,
        required: true
      },
      nginxPath: {
        description: 'Choose a location to download the files. default: '.magenta,
        required: true,
        default: process.env.HOME,
        message: 'Path does not exist or has wrong format',
        conform: function (input) {
          return fs.existsSync(path.dirname(input));
        },
        before: function (input) {
          return path.resolve(path.normalize(input), '3scale-nginx-conf');
        }
      }
    }
  },
  function (err, response) {
    if (err) return cb(err);
    saveInfo({
      domain: response.domain,
      providerKey: response.providerKey,
      nginxPath: response.nginxPath
    }, cb)
  });
}


function saveInfo (userInput, cb) {
  // save user info to 'config.json'
  nconf.file('.config.json');

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
 * @param  {String}   extractPath - path for extracted files
 * @param  {Function} cb   - callback
 */
function requestZipBundle (opts, extractPath, cb) {
  var req = https.request(opts, function (response) {
    unpackZipResponse(response, extractPath, cb);
  });
  req.on('error', function (err) {
    return cb(err);
  });
  req.end();
}


function unpackZipResponse (response, extractPath, cb) {
  response
    .pipe(unzip.Extract({ path: extractPath }))
    .on('close', function () {
      return cb(null);
    })
    .on('error', function (err) {
      return cb(err);
    });
}

/**
 * public interface
 */
exports.getInfo = getInfo;
exports.requestZipBundle = requestZipBundle;