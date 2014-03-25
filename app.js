
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var _       = require('lodash');
var app = express();
var passport = require('passport');
var OpenIDStrategy = require('passport-openid').Strategy;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/info', function(req,res){
    request('http://hpcr.cs.odu.edu/c3scorpion/c3scorpion_results.php?userid=231', function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var parsedResults;
        $('.auto-style28').parent().each(function(i, element){
          //console.log($(this).text());
          //console.log($(this).html());

          var title = $('.auto-style7').html();
          var prediction = $('.auto-style6').html();
          parsedResults=title+"<br><br>"+prediction;
          //parsedResults=$(this).html();
          var metadata ={
              prediction:prediction
          };
          //parsedResults.push(JSON.stringify($(this)));
          // Select the previous element
          //var a = $(this).prev();
          // Get the rank by parsing the element two levels above the "a" element
          //var rank = a.parent().parent().text();
          // Parse the link title
          //var title = a.text();
          // Parse the href attribute from the "a" element
          //var url = a.attr('href');
          // Get the subtext children from the next row in the HTML table.
          //var subtext = a.parent().parent().next().children('.subtext').children();
          // Extract the relevant data from the children
          //var points = $(subtext).eq(0).text();
          //var username = $(subtext).eq(1).text();
          //var comments = $(subtext).eq(2).text();
          // Our parsed meta data object
          /*var metadata = {
            rank: parseInt(rank),
            title: title,
            url: url,
            points: parseInt(points),
            username: username,
            comments: parseInt(comments)
          };
          */
          // Push meta-data into parsedResults array
          //parsedResults.push(metadata);
        });
        // Log our finished parse results in the terminal
        res.send(parsedResults);
        //console.log(parsedResults);
      }
    });

});
/**
 * Handle multiple requests at once
 * @param urls [array]
 * @param callback [function]
 * @requires request module for node ( https://github.com/mikeal/request )
 */
var __request = function (urls, callback) {

	'use strict';

	var results = {}, t = urls.length, c = 0,
		handler = function (error, response, body) {

			var url = response.request.uri.href;

			results[url] = { error: error, response: response, body: body };

			if (++c === urls.length) { callback(results); }

		};

	while (t--) { request(urls[t], handler); }
};

app.get('/multi',function(req,res){
// create an array of URLs
//var urls = ["http://www.example.com/firts", "http://www.example.com/second", "http://www.example.com/third"];
  //maybe generate a bunch for a test
  //base url http://hpcr.cs.odu.edu/c3scorpion/c3scorpion_results.php?userid=


//var urls = ["http://hpcr.cs.odu.edu/c3scorpion/c3scorpion_results.php?userid=230","http://hpcr.cs.odu.edu/c3scorpion/c3scorpion_results.php?userid=231"];
var urls =[];
var offset=140;
_.times(25, function(n) {
var link = "http://hpcr.cs.odu.edu/c3scorpion/c3scorpion_results.php?userid="+(n+offset);
console.log(link);
urls.push(link); });

var html;
// execute the request
// and assign a callback
__request(urls, function(responses) {

	// When all the requests are ready
	// this callback will be called
	// you will get an argument, is
	// a map with all the responses
	// of the request you made,
	// something like this:
	/*
		responses = {
			"http://www.example.com/firts": {
				error: [object Object],
				response: [object Object],
				body: [object Object]
			},
			"http://www.example.com/second": {
				error: [object Object],
				response: [object Object],
				body: [object Object]
			},
			"http://www.example.com/third": {
				error: [object Object],
				response: [object Object],
				body: [object Object]
			}
		}
	*/


	// Acces to a response:

	// direct reference
	//var first_response = responses["http://www.google.com"];
		// check for errors of the first response
		//console.log(first_response.error);
		// access to the body of the first response
		//console.log(first_response.body);

	// also you can reuse the reference on the original array
//	var first_response = response[urls[0]];


	// Iterate responses:

	// You can simply iterate all responses
	// to find errors or process the response
	var url, response;
	for (url in responses) {
		// reference to the response object
		response = responses[url];

		// find errors
		if (response.error) {
			console.log("Error", url, response.error);
			return;
		}

		// render body
    //gives the body do some cheerio magic

		if (response.body) {
			//console.log("Render", url, response.body);
     html =html +  "<h2>"+url+"</h2>"+response.body ;
     //console.log(html);
		}
	}
res.send(html);
});

});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
