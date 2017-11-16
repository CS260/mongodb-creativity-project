var mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://localhost/saltboxDB', { useMongoClient: true }); //Connects to a mongo database called "commentDB"

var Schema = mongoose.Schema;

var saltBoxSchema = new Schema({ //Defines the Schema for this database
	firstName: String,
	fullName: String,
	gender: String,
	age: Number,
	fitbitId: String,
	token: String, 
	refreshToken: String,
	sleepData:[
		{date: Date, duration: Number, totalDeepSleep: Number, totalLightSleep: Number, totalRemSleep: Number, totalWakeSleep: Number}
	]
});

var User = mongoose.model('Users', saltBoxSchema); //Makes an object from that schema as a model

var db = mongoose.connection; //Saves the connection as a variable to use
db.on('error', console.error.bind(console, 'connection error:')); //Checks for connection errors
db.once('open', function() { //Lets us know when we're connected
	console.log('Connected');
});

module.exports=User;