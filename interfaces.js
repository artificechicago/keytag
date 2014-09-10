var Interfaces = {
  create : function () {
    self = Object.create(this);
    self.modelTable = null;
    self.dbHandler = null;
    self.querySystem = null;

    return self;
  }

}

Interfaces.configure = function configure (modelTable, dbHandler, querySystem) {
  this.modelTable = modelTable;
  this.dbHandler = dbHandler;
  this.querySystem = querySystem;
  console.log(this.modelTable);
}

Interfaces.startUDPInterface = function startUDPInterface(port) {

  // UDP Interface
  var dgram = require("dgram");
  var server = dgram.createSocket("udp4");

  server.on("error", function (err) {
    console.log("Server error:\n" + err.stack);
    server.close();
  });

  server.on("message", function (msg, rinfo) {
    var parsed = JSON.parse(msg);
    console.log("TEST: Recieved " + JSON.stringify(parsed)
              + " on " + rinfo.address + ":" + rinfo.port);
    var date = new Date(parsed.TS * 1000);
    var hts = date.toLocaleDateString() + " " + date.toLocaleTimeString();
    var attendEntry = new modelTable.attendance({
      deviceType : parsed.DTY,
      deviceID : parsed.DID,
      version : parsed.VN,
      cardID : parsed.CID,
      unixTimestamp : parsed.TS,
      humanTimestamp : hts
    });
    attendEntry.save( function (err, attendEntry) {
      if (err) return console.error(err);
      console.log(attendEntry + " written to database.")});
  });

  server.bind(port);
}

Interfaces.startHTTPInterface = function startHTTPInterface(port) {

  // HTTP Interface
  var http = require("http");
  var modelTable = this.modelTable;
  var querySystem = this.querySystem;
  var standardHeader = {
    'Content-Type' : 'text/plain',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Headers' : 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  };

  http.createServer(function (req, res) {
    console.log(req.headers.authorization);
    var noAuthFlag = false;
    try {
      var authType = req.headers.authorization.split(" ")[0];
      var authVal = req.headers.authorization.split(" ")[1];
    }
    catch (e) {
    console.log(e)
    noAuthFlag = true;
    var authType = "none";
    var authVal = "none";
    }
    console.log("Authorization type: " + authType + "\nWith val: " + authVal);
    var testAuth = new Buffer("user:pass").toString('base64');
    if (!(authType == "Basic" && authVal == testAuth))
      noAuthFlag = true;
    if (req.method == "POST" && req.url == "/query") {
      // Query System Interface
      console.log("[200] " + req.method + " to " + req.url);
      var fullChunk = "";
      var parseErrorFlag = false;

      req.on('data', function(chunk) {
        console.log("Received body data:");
        try {
          //console.log(JSON.parse(chunk));
          fullChunk += chunk;
        }
        catch (e) {
          console.log("Chunk parse error");
          parseErrorFlag = true;
        }
      });

      req.on('end', function () {
        if (noAuthFlag) {
          res.writeHead(401, standardHeader);
          res.end("Invalid user credentials. \n");
        }
        if (!parseErrorFlag) {
          try {
            var inData = JSON.parse(fullChunk);
            //console.log(inData);
            //console.log(modelTable);
            var model = modelTable[inData.model];
            //console.log(model);
            //var queryResult = querySystem.applyJSONQuery(inData.query, model);
            var queryResult = model.find();
            res.writeHead(200, standardHeader);
            queryResult.exec(function (err, results) {
              console.log(results);
              res.end(JSON.stringify(results));
            });
            //res.end("You've asked for data!  But you got me instead...\n");
          }
          catch (e) {
            res.writeHead(404, standardHeader);
            res.end("Query not understood.\n");
          }
        } else {
          res.writeHead(400, standardHeader);
          res.end("ERROR: MALFORMED JSON REQUEST\n");
        }
      });
    } else {
      res.writeHead(200, standardHeader);
      res.end("No services here...\n");
    }
  }).listen(port);
  console.log('Server running at http://localhost:' + port + '/');
};


// WebSocket Interface

// Export Singleton

module.exports = exports = Interfaces.create();
