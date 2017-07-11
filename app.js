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

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

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
    console.log(session.message.user.name + ' -> ' +session.message.text.toLowerCase());
    if(session.message.text.toLowerCase().contains('hello') || session.message.text.toLowerCase().contains('hi')){
			session.send('Hey, '+ session.message.user.name +' How are you?');
      //}else if(session.message.text.toLowerCase().contains('help')){
	//		session.send('How can I help you?');
      }else if(session.message.text.toLowerCase().contains('good morning')){
			session.send('Good morning');
      }else if(session.message.text.toLowerCase().contains('thank')){
			session.send('You are welcome');
      }else{
			session.send('Sorry I don\'t understand you...');
      }
});

bot.dialog('HelpDialog', function (session) {
    var card = new builder.HeroCard(session)
        .title('help_title')
        .buttons([
            builder.CardAction.imBack(session, 'roll dice', 'Help Text'),
            builder.CardAction.imBack(session, 'play', 'Play Text')
        ]);
    var msg = new builder.Message(session)
        .speak(speak(session, 'help_ssml'))
        .addAttachment(card)
        .inputHint(builder.InputHint.acceptingInput);
    session.send(msg).endDialog();
}).triggerAction({ matches: [/help/i, /support/i, /problem/i] });
