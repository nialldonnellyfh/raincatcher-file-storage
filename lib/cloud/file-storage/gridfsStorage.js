var q = require('q');
var config;


function init(storageConfiguration){
  config = storageConfiguration;
  //TODO
}

function writeFile(namespace, fileName, fileLocation) {
  var deferred = q.defer();
  //TODO
  // deferred.resolve(fileMeta);
  // deferred.reject(error);
  return deferred.promise;
}

function streamFile(namespace, fileName) {
  var deferred = q.defer();
  //TODO
  // deferred.resolve(fileMeta);
  // deferred.reject(error);
  return deferred.promise;
}

module.exports = {
  init: init,
  writeFile: writeFile,
  streamFile: streamFile
}
