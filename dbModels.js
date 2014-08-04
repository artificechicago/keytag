(function () { // Module pattern
  var mongoose = require('mongoose');

  // extend mongoose Schema creation
  mongoose.Schema.create = function(o) {
      return new mongoose.Schema(o);
  }

  // Aadit Shah's Object extension approach
  // I'm not sure I like this, I think a prototype.js style
  // Class/Mixin approach might be more clear.
  // Either way, this is the wrong file for this.

  Object.prototype.extend = function (ext) {
      var hasOwnProperty = Object.hasOwnProperty;
      var obj = Object.create(this);

      for (var prop in ext) {
	      if (hasOwnProperty.call(ext, prop) ||
	        typeof obj[prop] === "undefined")
	          obj[prop] = ext[prop];
      }

      return obj;
  };

  // base database model object

   mod = {}

   var dModel = Object.extend({
      compileSchema : function() {
	      if (this.mongoData.schema) {
	        var s = mongoose.Schema.create(this.mongoData.schema);
	        return s;
    	  } // no schema condition?
      }
      compileModel : function() {
	      if (this.mongoData.schema && this.mongoData.name) {
	        var s = mongoose.Schema.create(this.mongoData.schema);
	        return mongoose.model(this.mongoData.name, s);
	      } // no monogoData condition?
      }
  });

  // Database Schemata and Models

  var databaseModels = [];

  mod.swipeEvent = dModel.extend({
      create : function(deviceType, deviceID, version, cardID, unixTimestamp) {
	      date = Object.create(unixTimestamp * 1000);

	      self = Object.create(this);

  	    self.deviceType = deviceType;
	      self.deviceID = deviceID;
	      self.version = version;
	      self.cardID = cardID;
	      self.unixTimestamp = unixTimestamp;
	      self.humanTimestamp = date.toLocaleDateString() + " "
	        + date.toLocaleTimeString();
      },

      mongoData : {
	      name : 'swipeEvent',
	      schema : {
	        deviceType: String,
	        deviceID: Number,
	        version: Number,
	        cardID: String,
	        unixTimestamp: Number,
	        humanTimestamp: String
	      }
      },

  });

  mod.program = dModel.extend({
      create : function(programName, sessionName, contactHours) {
	      self = Object.create(this);

    	  self.programName = programName;
	      self.sessionName = sessionName;
	      self.contactHours = contactHours;
        return self;
      },

      mongoData : {
    	  name : 'program',
	      schema : {
  	      programName : String,
	        sessionName : String,
  	      contactHours : Number
      	}
      }
  });

  mod.student = dModel.extend({
      create : function(firstName, middleName, lastName, birthday, gender, studentID, programsAttended) {
	      self = Object.create(this);
        self.name = {
          first: firstName,
          middle: middleName,
          last: lastName
        },
        self.birthday = birthday;
        self.gender = gender;
        self.studentID = studentID;
        self.programsAttended = programsAttended;

        return self;
      },

      mongoData : {
    	  name : 'student',
	      schema : {
          name : {
            first : String,
            middle : String,
            last : String
          },
	        birthday : Date, //?
	        gender : String,
	        studentID: String,
	        programsAttended : [program],
          medical : ObjectID
	      }
      }
  });

  return mod;

})();
