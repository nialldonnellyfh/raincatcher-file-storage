var q = require('q');
var fs = require('fs');
var mongo = require('mongodb');
var Grid = require('gridfs-stream');
var MongoClient = require('mongodb').MongoClient

var gfs;

function init(storageConfiguration) {
  var config = storageConfiguration;
  if (!config || !config.mongoUrl) {
    throw Error("Missing mongoUrl parameter for GridFs storage");
  }
  MongoClient.connect(config.mongoUrl, function(err, connection) {
    if (err) {
      return console.log("Cannot connect to mongodb server. Gridfs storage will be disabled");
    }
    console.log("Connected successfully to storage server");
    gfs = Grid(connection, mongo);
  });
}

function writeFile(namespace, fileName, fileLocation) {
  if (!gfs) {
    console.log("Gridfs not initialized");
    return;
  }
  var deferred = q.defer();
  var options = {
    filename: fileName
  };
  if (namespace) {
    options.root = namespace;
  }
  var writeStream = gfs.createWriteStream(options);
  writeStream.on('error', function(err) {
    console.log('An error occurred!', err);
    deferred.reject(err);
  });
  
  writeStream.on('close', function(file) {
    deferred.resolve(file);
  });
  fs.createReadStream(fileLocation).pipe(writeStream);
  return deferred.promise;
}

function streamFile(namespace, fileName) {
  if (!gfs) {
    console.log("Gridfs not initialized");
    return;
  }
  var deferred = q.defer();
  var options = {
    filename: fileName
  };
  if (namespace) {
    options.root = namespace;
  }
  
  var readstream = gfs.createReadStream(options);
  readstream.on('error', function(err) {
    console.log('An error occurred when reading file from gridfs!', err);
  });
  deferred.resolve(readstream);
  return deferred.promise;
}

module.exports = {
  init: init,
  writeFile: writeFile,
  streamFile: streamFile
};