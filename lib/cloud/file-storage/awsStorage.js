var q = require('q');
var s3 = require('s3');
var path = require('path');

var config;
var awsClient;

function init(storageConfiguration) {
  config = storageConfiguration;
  validateConfig();
  awsClient = s3.createClient(config);
}

function writeFile(namespace, fileName, fileLocation) {
  var file;
  if (namespace) {
    file = path.join(namespace, fileName);
  } else {
    file = fileName;
  }
  
  var params = {
    localFile: fileLocation,
    ACL: 'authenticated-read',
    s3Params: {
      Bucket: config.bucket,
      Key: file
    }
  };
  
  var deferred = q.defer();
  var uploader = awsClient.uploadFile(params);
  uploader.on('error', function(err) {
    console.log(err);
    deferred.reject(err.stack);
  });
  uploader.on('progress', function() {
  });
  uploader.on('end', function() {
    deferred.resolve(fileName);
  });
  return deferred.promise;
}

function streamFile(namespace, fileName) {
  var file;
  if (namespace) {
    file = path.join(namespace, fileName);
  } else {
    file = fileName;
  }
  var deferred = q.defer();
  var paramsStream = {
    Bucket: config.bucket,
    Key: file
  };
  try {
    var buffer = awsClient.downloadStream(paramsStream);
    deferred.resolve(buffer);
  } catch (error) {
    console.log(error);
    deferred.reject(error);
  }
  return deferred.promise;
}

function validateConfig() {
  if (!config.s3Options) {
    throw Error("Invalid configuration for s3 storage");
  }
  if (!config.s3Options.accessKeyId) {
    throw Error("Invalid configuration for s3 storage: Access Key missing");
  }
  if (!config.s3Options.secretAccessKey) {
    throw Error("Invalid configuration for s3 storage: secretAccessKeymissing");
  }
  if (!config.s3Options.region) {
    throw Error("Invalid configuration for s3 storage: region missing");
  }
}

/**
 * Implements storage interface for AWS S3 storage
 *
 * @type {{init: function, writeFile: function, streamFile: function}}
 */
module.exports = {
  init: init,
  writeFile: writeFile,
  streamFile: streamFile
}
