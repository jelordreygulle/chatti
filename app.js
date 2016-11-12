var builder = require('botbuilder');
var express = require('express');


// Bot Setup

// Setup express server
var app = express();


// Create chat bot
var connector = new builder.ChatConnector({
    appId: "",
    appPassword: ""
});
var bot = new builder.UniversalBot(connector);

app.post('/api/messages', connector.listen());

var listner = app.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', app.name, listner.address().port); 
});


//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
    session.send("Hello World");
});