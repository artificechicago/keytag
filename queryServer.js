var mongoose = require('mongoose');
var net = require('net');

var queryServerPort = 8124;

mongoose.connect('mongodb://localhost/test');

function deserialize (msg) {
  return 0;
}

function runQuery (query) {
  return 0;
}


var qServer = net.createServer(function (conn) {
  console.log("Query Server started.");

  conn.on('end', function () {
    console.log("Query Server disconnected.");
  });

  conn.on('data', function (msg) {
    var query = deserialize(msg);
    runQuery(query)
  })
});

qServer.listen(queryServerPort, function () {
  console.log("Query Server listening on port " + queryServerPort);
});