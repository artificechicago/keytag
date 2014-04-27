
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

// Build and start server
var dgram = require("dgram");
var server = dgram.createSocket("udp4");

server.on("error", function (err) {
    console.log("Server error:\n" + err.stack);
    server.close();
});

server.on("message", function (msg, rinfo) {
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

server.once("listening", function () {
    var address = server.address();
    console.log("Server listening on " + address.address 
		+ ":" + address.port);
});

server.bind(8080);


// Express 

// _ -> JSON object
function get_last_login () {
    var query = Attendance.find().sort('-unixTimestamp');
    return query.select('cardID');
}

var express = require('express');
var app = express();

app.get('/', function (req, res) {
    get_last_login().exec(function (err, data) {
	console.log(data);
	res.send(data[0].cardID);
    });
});

app.listen(8000);
