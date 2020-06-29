/*
Primary file for the API
*/

//Dependencies 
var server = require('./lib/server');
//var workers = require('./lib/workers');

var app = {};

// Initialize the app

app.init = function() {
    // start the server
    server.init();
    //start the workers
    //workers.init();
};

app.init();

module.exports = app;