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
});


// HTTP Interface
var http = require("http");

http.createServer(function (req, res) {
  if (req.method == "POST" && req.url == "/query") {
    console.log("[200] " + req.method + " to " + req.url);

    req.on('data', function(chunk) {
      console.log("Received body data:");
      console.log(JSON.stringify(JSON.parse(chunk)));
    });

    req.on('end', function () {
      res.writeHead(200, {'Content-Type' : 'text/plain'});
      res.end("You've asked for data!  But you got me instead...\n");
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("No services here...\n");
  }
}).listen(3000);
console.log('Server running at http://localhost:3000/');


// WebSocket Interface
  // For future