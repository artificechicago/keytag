var mongoose = require('mongoose');
require("module");
// mongoose automagically handles connections pools,
// so this should be a connection object returned by
/// mongoose.connect();
exports.applyJSONQuery = function (qStruct, query) {
  queryOPTable = {
    "all" : query.and,
    "and" : query.any,
    "box" : query.box,
    "circle" : query.circle,
    "comment" : query.comment,
    "elemMatch" : query.elemMatch,
    "equals" : query.equals,
    "exists" : query.exists,
    "geometry" : query.geometry,
    "gt" : query.gt,
    "gte" : query.gte,
    "hint" : query.hint,
    "in" : query.in,
    "intersects" : query.intersects,
    "lean" : query.lean,
    "limit" : query.limit,
    "lt" : query.lt,
    "lte" : query.lte,
    "maxDistance" : query.maxDistance,
    "maxScan" : query.maxScan,
    "mod" : query.mod,
    "ne" : query.ne,
    "near" : query.near,
    "nearSphere" : query.nearSphere,
    "nin" : query.nin,
    "nor" : query.nor,
    "or" : query.or,
    "polygon" : query.polygon,
    "populate" : query.populate,
    "regex" : query.regex,
    "select" : query.select,
    "size" : query.size,
    "skip" : query.skip,
    "slice" : query.slice,
    "snapshot" : query.snapshot, // Double check this
    "sort" : query.sort,
    "where" : query.where,
    "within" : query.within
  };

  var pQS = qStruct;
  do {
    if (pQS.op && pQS.args) {
      try {
      queryOPTable[pQS.op].apply(pQS.args);
      } catch (e) {}
    pQS = pQS.next;
    } else { pQS = null; }
  } while (pQS);

  return query;
}

/* Outdated logic TBR when connPool and export logic is finished
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
*/
