
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
          var title = $('.auto-style7').html();
          var prediction = $('.auto-style6').html();
          parsedResults=title+"<br><br>"+prediction;
          var metadata ={
              prediction:prediction
          };
        });
        res.send(parsedResults);
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

//var urls = ["http://hpcr.cs.odu.edu/c3scorpion/c3scorpion_results.php?userid=230","http://hpcr.cs.odu.edu/c3scorpion/c3scorpion_results.php?userid=231"];
var urls =[];
var offset = parseInt(req.query.page) || 0;
console.log(req.query.page);
_.times(25, function(n) {
var link = "http://hpcr.cs.odu.edu/c3scorpion/c3scorpion_results.php?userid="+(n+offset);
urls.push(link); });

var html = '';
__request(urls, function(responses) {

	var url, response;
	for (url in responses) {
		// reference to the response object
		response = responses[url];

		// find errors
		if (response.error) {
			console.log("Error", url, response.error);
			return;
		}
		if (response.body) {
     html = html +  "<h2>"+url+"</h2>"+response.body ;
		}
	}
  //create a next and last button
  // '/multi?
  //<br><br>
  var controls = '';
  var makeLink = function (arg){
    return "<a href='/multi?page=" + parseInt(arg) +"'>NextPage</a>";
  };
  controls =  controls+ makeLink(offset+25);
  controls = "<div id='controls'>" + controls + "</div>";
res.send(html+controls);
});

});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
