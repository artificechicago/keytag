var mongoose = require('mongoose');
var net = require('net');

var queryServerPort = 8124;

mongoose.connect('mongodb://localhost/test');

function parseJSONQuery (qStruct) {
  var q = new mongoose.Query;
  var pQS = qStruct;
  do {
    if (pQS.op && pQS.args) {
      try {
      q.queryOPTable[pQS.op].apply(pQS.args);
      } catch (e) {}
    pQS = q.next;
    } else { pQS = null; }
  } while (pQS);

  return q;
}

var qServer = net.createServer(function (conn) {
  console.log("Query Server started.");

  conn.on('end', function () {
    console.log("Query Server disconnected.");
  });

  conn.on('data', function (msg) {
    var query = JSON.parse(msg);
    var qObject = parseJSONQuery(query);
  })
});

qServer.listen(queryServerPort, function () {
  console.log("Query Server listening on port " + queryServerPort);
});
