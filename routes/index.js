var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); //Adds mongoose as a usable dependency
var ClientOAuth2 = require('client-oauth2');  //source: https://www.npmjs.com/package/client-oauth2
var request = require('request');
var async = require("async");
var User = require('../models/users');	//Schema for MongoDB saltbox

var fitbitAuth = new ClientOAuth2({
  clientId: '22CKJP',
  clientSecret: 'fe2699041edf37293117a98d25d5cf0a',
  accessTokenUri: 'https://api.fitbit.com/oauth2/token',
  authorizationUri: 'https://www.fitbit.com/oauth2/authorize',
  redirectUri: 'http://ec2-18-221-58-194.us-east-2.compute.amazonaws.com:3000/auth/fitbit/callback',
  scopes: ['sleep', 'profile','heartrate']
})

// Can also just pass the raw `data` object in place of an argument. 
var token = fitbitAuth.createToken('access token', 'optional refresh token', 'optional token type', { data: 'raw user data' })
 
// Set the token TTL. 
token.expiresIn(604800) // Seconds. 
token.expiresIn(new Date('2016-11-08')) // Date. 
 
// Refresh the users credentials and save the new access token and info. 
// token.refresh().then(storeNewToken)
 
// Sign a standard HTTP request object, updating the URL with the access token 
// or adding authorization headers, depending on token type. 
token.sign({
  method: 'get',
  url: 'https://api.fitbit.com'
}) //=> { method, url, headers, ... } 


//Oauth2 authentication begins when client clicks "API Call" button
router.get('/auth/fitbit', function (req, res) {
  var uri = fitbitAuth.code.getUri()
  console.log("inside auth/github");
 	console.log(uri);
  res.redirect(uri)
})

//Oauth2 redirect from Fitbit. Parse token, userid, etc. Then add user and sleep data to database. 
router.get('/auth/fitbit/callback', function (req, res) {
  fitbitAuth.code.getToken(req.originalUrl)
    .then(function (user) {

	  User.find({fitbitId : user.data.user_id}).exec(function(err, docs) {
	    if (docs.length){
	      console.log("User already exists");
	    } else {

	    //GET user info(Name, age, sex)
	    request({
		  url: 'https://api.fitbit.com/1/user/'+user.data.user_id+'/profile.json',
		  auth: {
		    'bearer': user.accessToken
		  }
		},function(err, res) {
			if (err) return console.error(err);
			else{
				var json = JSON.parse(res.body);
				console.log("GET profile request to Fitbit successful:")
				console.log(json);
				
				var tmpUser = User({
					firstName: json.user.firstName,
					fullName: json.user.fullName,
					gender: json.user.gender,
					age: json.user.age,
					fitbitId: user.data.user_id,
					token: user.accessToken, 
					refreshToken: user.data.refresh_token,
					sleepData:[]
				});

				//Save user to database
				tmpUser.save(function(err) { //[4]
					  if (err) return console.error(err);
					  console.log("User added to DB");
				}).then(function (user) {

					request({
					  url: 'https://api.fitbit.com/1.2/user/'+user.fitbitId+'/sleep/date/2017-09-01/'+todaysDate+'.json',
					  auth: {
					    'bearer': user.token
					  }
					},function(err, res) {
						if (err) return console.error(err);
						else{
							var json = JSON.parse(res.body);
							console.log("GET Sleep request to Fitbit successful:")
							parseSleepJson(json, user.fitbitId);
						}	
					});

				})
			}	
		});

		 }

	  });


	  // Refresh the current users access token. 
      user.refresh().then(function (updatedUser) {
        console.log(updatedUser !== user) //=> true 
        console.log(updatedUser.accessToken)
      })
 
      // Sign API requests on behalf of the current user. 
      user.sign({
        method: 'get',
        url: 'http://example.com'
      })


      //Redirect user to mainpage
      return res.redirect('/');
    })
})


var testKip = User({
	firstName: 'Kip',
	fullName: 'Kip Hacking',
	gender: 'MALE',
	age: 25,
	fitbitId: 'test2',
	token: 'adsfadafew23243234', 
	refreshToken: 'safdfsafas23423423f43f',
	sleepData:[
		{date: 11-07-2017, duration: 200, totalDeepSleep: 300, totalLightSleep: 400, totalRemSleep: 500, totalWakeSleep: 600}
	]
});



function parseSleepJson(json, idSearch){

	var i = 0;
	// 1st para in async.each() is the array of items
	async.each(json.sleep,
	  // 2nd param is the function that each item is passed to
	  function(record, callback){
	    // Call an asynchronous function, often a save() to DB
	    User.findOne({fitbitId: idSearch}).then(function (record){
	      // Async call is done, alert via callback
	      if(json.sleep[i].levels.summary.hasOwnProperty('deep')){
	       	record.sleepData.push({date: json.sleep[i].dateOfSleep, duration: json.sleep[i].minutesAsleep, 
	       		totalDeepSleep: json.sleep[i].levels.summary.deep.minutes, totalLightSleep: json.sleep[i].levels.summary.light.minutes, 
	       		totalRemSleep: json.sleep[i].levels.summary.rem.minutes, totalWakeSleep: json.sleep[i].levels.summary.wake.minutes});
			record.save()
			}
			i++;
	      callback();
	    });
	  },
	  // 3rd param is the function to call when everything's done
	  function(err){
	    // All tasks are done now
	    console.log("done parsing sleep data...");
	  }
	);
};

function returnYearMonthDay(){

	var d = new Date();
	var currentDate = d.getDate();
	var currentMonth = d.getMonth() + 1;
	var currentYear = d.getFullYear();

	return currentYear+"-"+currentMonth+"-"+currentDate;
}

var todaysDate = returnYearMonthDay();


/* GET Sleep data from database and return to client*/
router.post('/getFitbitSleep', function(req, res, next) {
	console.log("In the GET sleep data route");

	var sleepDate = req.body.date; //[3]
	console.log('Sleep Date: '+sleepDate); //[3]
	
	User.find({firstName: sleepDate}, '-_id -fullName -firstName -gender -age -fitbitId -token -refreshToken', function(err, docs) {
	    if (!err){ 
	        // console.log('%j', docs);
	        console.log("Return sleep data: "+docs);
	        res.json(docs); 

	    } else {throw err;}
	});

	// .project({ token: 0, fullName : 0, gender : 0, age: 0, fitbitId: 0, refreshToken : 0, _id : 0 });


	// res.json(sleepDate); 
	// res.sendStatus(200);


});


router.get('/getUserNames', function(req, res, next) {
	console.log("In the GET names route");
	
	User.find({}, '-_id -fullName -sleepData -gender -age -fitbitId -token -refreshToken -__v', function(err, docs) {
	    if (!err){ 
	        // console.log('%j', docs);
	        console.log("Return names: "+docs);
	        res.json(docs); 

	    } else {throw err;}
	});

	// .project({ token: 0, fullName : 0, gender : 0, age: 0, fitbitId: 0, refreshToken : 0, _id : 0 });


	// res.json(sleepDate); 
	// res.sendStatus(200);


});


//Example GET and POST:

// /* GET comments from database */
// router.get('/comment', function(req, res, next) {
// 	console.log("In the GET route?");

// 	User.find({ fitbitId: userId}, function(err, user) {
//   		if (err) throw err;
//   		var i = 1;
//   		console.log("User's sleep data: ")
//   		console.log(user.age);
// 	});

// });

// /* POST comments to database */
// router.post('/comment', function(req, res, next) {
// 	console.log("POST comment route"); //[1]
// 	console.log(req.body); //[2]
// 	// res.sendStatus(200);
// 	var newcomment = new Comment(req.body); //[3]
// 	console.log(newcomment); //[3]
// 	newcomment.save(function(err, post) { //[4]
// 	  if (err) return console.error(err);
// 	  console.log(post);
// 	  res.sendStatus(200);
// 	});
// });

module.exports = router;
