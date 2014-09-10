var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/test/');

var queryService = require('./queryServer.js');
var interfaces = require('./interfaces.js');

// Demo code
// This will be replaced with full scale modelTables for production

var modelTable = {};

modelTable.attendance = mongoose.model('Attendance',
                                      (new mongoose.Schema({
                                        deviceType: String,
                                        deviceID: Number,
                                        version: Number,
                                        cardID: String,
                                        unixTimestamp: Number,
                                        humanTimestamp: String,
                                      })));

modelTable.student = mongoose.model('Student',
                                   (new mongoose.Schema({
                                     name : {
                                       first : String,
                                       last : String,
                                     },
                                     cardID : String,
                                   })));

dbHandle = {}; // Placeholder for DBWriter service

interfaces.configure(modelTable, dbHandle, queryService);
interfaces.startUDPInterface(8080);
interfaces.startHTTPInterface(8081);
