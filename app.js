var builder = require('botbuilder');
var express = require('express');


// Bot Setup

// Setup express server
var app = express();


// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || "",
    appPassword: process.env.MICROSOFT_APP_PASSWORD || ""
});
var bot = new builder.UniversalBot(connector);

app.post('/api/messages', connector.listen());

var listner = app.listen(process.env.port || process.env.PORT || 3000, function () {
   console.log('%s listening to %s', app.name, listner.address().port); 
});


//=========================================================
// Bots Dialogs
//=========================================================
String.prototype.contains = function(content){
  return this.indexOf(content) !== -1;
}

bot.dialog('/', function (session) {
    if(session.message.text.toLowerCase().contains('hello')){
			session.send(`Hey, How are you?`);
      }else if(session.message.text.toLowerCase().contains('help')){
			session.send('How can I help you?');
      }else{
			session.send('Sorry I don\'t understand you...');
      }
});