var mongoose = require('mongoose');
var net = require('net');

var queryServerPort = 8124;

mongoose.connect('mongodb://localhost/test');

function parseJSONQuery (qStruct) {
  var q = Object.create(mongoose.Query);
  q.queryOPTable = {
    "all" : this.and,
    "and" : this.any,
    "box" : this.box,
    "circle" : this.circle,
    "comment" : this.comment,
    "elemMatch" : this.elemMatch,
    "equals" : this.equals,
    "exists" : this.exists,
    "geometry" : this.geometry,
    "gt" : this.gt,
    "gte" : this.gte,
    "hint" : this.hint,
    "in" : this.in,
    "intersects" : this.intersects,
    "lean" : this.lean,
    "limit" : this.limit,
    "lt" : this.lt,
    "lte" : this.lte,
    "maxDistance" : this.maxDistance,
    "maxScan" : this.maxScan,
    "mod" : this.mod,
    "ne" : this.ne,
    "near" : this.near,
    "nearSphere" : this.nearSphere,
    "nin" : this.nin,
    "nor" : this.nor,
    "or" : this.or,
    "polygon" : this.polygon,
    "populate" : this.populate,
    "regex" : this.regex,
    "select" : this.select,
    "size" : this.size,
    "skip" : this.skip,
    "slice" : this.slice,
    "snapshot" : this.snapshot, // Double check this
    "sort" : this.sort,
    "where" : this.where,
    "within" : this.within
  };

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
