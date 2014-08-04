
// Set up database

var mongoose = require('mongoose');
var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function () {
    console.log("DB Access bound");
    var attendanceSchema = new mongoose.Schema({
	    deviceType: String,
	    deviceID: Number,
	    version: Number,
	    cardID: String,
	    unixTimestamp: Number,
	    humanTimestamp: String
    });
    Attendance = mongoose.model('Attendance', attendanceSchema);
});

//var Attendance = mongoose.model('Attendance', attendanceSchema);

mongoose.connect('mongodb://localhost/test');

function runQuery(query,lim,sorter,sel) {
	var q = Attendance.find(query).sort(sorter).limit(lim);
  return q.select(sel);
}

// Build and start UDP Server
// Handles incoming SwipeEvents from hardware login systems
var dgram = require("dgram");
var dserver = dgram.createSocket("udp4");

dserver.on("error", function (err) {
    console.log("Server error:\n" + err.stack);
    dserver.close();
});

dserver.on("message", function (msg, rinfo) {
    var parsed = JSON.parse(msg);
    var date = new Date(parsed.TS * 1000);
    var hts = date.toLocaleDateString() + " " + date.toLocaleTimeString();
    var attend = new Attendance({
	    deviceType: parsed.DTY,
	    deviceID: parsed.DID,
	    version: parsed.VN,
	    cardID: parsed.CID,
	    unixTimestamp: parsed.TS,
	    humanTimestamp: hts
	});
    attend.save(function (err, attend) {
	    if (err) return console.error(err);
	    console.log("I'm writing: \n " + attend + "\n to the database.");
	});

});

dserver.once("listening", function () {
    var address = dserver.address();
    console.log("Server listening on " + address.address
		+ ":" + address.port);
});

dserver.bind(8080);

var net = require('net');
var qserver = net.createServer(function(c) { //'connection' listener
  console.log('server connected');
  c.on('end', function() {
    console.log('server disconnected');
  });
  c.on('data', function(msg) {
    var queryReq = JSON.parse(msg);
		runQuery(queryReq.query,queryReq.lim,queryReq.sorter,queryReq.sel).exec(function (err, data) {
    	c.write(JSON.stringify(data));
		});
  });
});
qserver.listen(8124, function() { //'listening' listener
  console.log('server bound');
});

