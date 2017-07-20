var builder = require('botbuilder');
var express = require('express');

// Load the core build.
var _ = require('lodash');

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
   log.info('%s listening to %s', app.name, listner.address().port);
});

/**
 * make a log directory, just in case it isn't there.
 */
try {
  require('fs').mkdirSync('./log');
} catch (e) {
  if (e.code != 'EEXIST') {
    console.error("Could not set up log directory, error was: ", e);
    process.exit(1);
  }
}

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure('./config/log4js.json');
var log = log4js.getLogger("bot");

//=========================================================
// Bots Dialogs
//=========================================================
String.prototype.contains = function(content){
  return this.indexOf(content) !== -1;
}

bot.dialog('/', function (session) {
     //setting default values
     if (session.userData.name === undefined){
          session.userData.name = session.message.user.name
     }
     const Spinner = require('node-spintax');
    console.log(session.message.user.name + ' -> ' +session.message.text.toLowerCase());
      if(/^(hello|^hi|greetings)/i.test(session.message.text)){
          
          var spinner = new Spinner('{Hi|Hello|Hi there|Hiya} '+ session.userData.name +' {How|how} {are you|ru} doing today {?|??|???}');
          session.send(spinner.unspinRandom(1));

      }else if((m = /^(I'\m|I am|im) (?:doing)?[ ]?(good|ok|well|alright|fine|great)/i.exec(session.message.text)) !== null){
        var spinner = new Spinner('{Awesome|cool|'+m[1]+' also doing '+ m[2]+'}');
        session.send(spinner.unspinRandom(1));

      }else if((m = /^\good (morning|evening|night)/i.exec(session.message.text)) !== null){
        greets = Array('Good day to you too',
		       'Wish you the same', 
		       'hmm',
		       'Good '+ m[1]);
        session.send(_.sample(greets));

      }else if ((m = /^change (?:my)?[ ]?(name|search)/i.exec(session.message.text)) !== null){
       
          if (m[1] == 'name'){
                session.beginDialog('changeName');
          }else if (m[1] == 'search'){
                session.beginDialog('changeSearch');
          }else{
                session.send('Sorry, I do not understand that yet..');
          }

      } else if ((m = /^\I (love|like) (.*)/i.exec(session.message.text)) !== null) {
		replies = Array('I '+ m[1] +' you too', 
				'(blush)', 
				'Thanks I '+ m[1] +' you a lot too',
				'I '+ m[1]+' to make new friends.',
				'i ' + m[1]  + ' you too '+ session.userData.name);
        session.send(_.sample(replies));

      } else if ((m = /^\who (is|are) (you|chatti)/i.exec(session.message.text)) !== null) {

	      replies = Array('I am chatti the bot',
		                  'I\'m chatti');
              session.send(_.sample(replies));

      } else if ((m = /^\how are (you|chatti)/i.exec(session.message.text)) !== null) {
		replies = Array('I am doing good, how are you ?',
				'I\'m doing good',
		                'So far so good');
            session.send(_.sample(replies));

      } else if ((m = /^(?:Tell|say) (?:something)?[ ]?(interesting|fact)/i.exec(session.message.text)) !== null) {
            request = require('request');
            session.sendTyping();
            request(`http://numbersapi.com/random/trivia`, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    session.send(body);
                }
            });

      }else if(session.message.text.toLowerCase().contains('status')){
              session.send('My status telling....');
	      session.send("Your name is " + session.userData.name);

      }else if(session.message.text.toLowerCase().contains('thank')){
			  session.send('You are welcome');
      }else{
          log.info(" -> " + session.message.text);
	      replies = Array('Sorry I don\'t understand you...',
			       'what do you mean ?',
			       'Sorry, I do not understand that yet..',
			       'I do not understand that yet..',
			       'Can you ask something else ?',		      
			       ':|');
        session.send(_.sample(replies));
      }
});

bot.dialog('changeName', [
    function (session, next) {
        session.dialogData.NewName = " ";
        builder.Prompts.text(session, "Well that's new. What do you want me to call you?");
    },
    function (session, results) {
        session.dialogData.NewName = results.response;
        builder.Prompts.choice(session, "Are you sure you want me to call you " + session.dialogData.NewName + "?", ["Yes", "No"]);
    },
    function (session, results) {
        if (results.response.entity == "Yes") {
            session.userData.name = session.dialogData.NewName;
            session.endDialog("Alright " + session.userData.name + "!!!");
        }
        else {
            session.endDialog("Phew! I am anyways not good at remembering names.");
        }
    }
]);

bot.dialog('changeSearch', [
    function (session, next) {
        session.dialogData.NewSearch = " ";
        builder.Prompts.choice(session, "What do you want me to use to search results?", ["Bing", "Google", "DuckDuckGo"]);
    },
    function (session, results) {
        session.dialogData.NewSearch = results.response.entity;
        builder.Prompts.choice(session, "Are you sure you want me use " + session.dialogData.NewSearch + "?", ["Yes", "No"]);
    },
    function (session, results) {
        if (results.response.entity == "Yes") {
            session.userData.search = session.dialogData.NewSearch;
            session.endDialog("Alright from now on in using " + session.userData.search + "!!!");
        }
        else {
            session.endDialog("Phew! I am not that good at remembering options.");
        }
    }
]);

// search dialog
bot.dialog('search', require('./dialogs/search'))
    .triggerAction({
        matches: /^(?:(?:what (?:is|is a|are))|search) (.*)/i }
);//regex pattern matching

bot.dialog('HelpDialog', require('./dialogs/support'))
    .triggerAction({ 
      matches: [/help/i, /support/i, /problem/i] 
});

// reset bot dialog
bot.dialog('reset', function (session) {
    delete session.userData.name
    session.endDialog('Ups... I\'m suffering from a memory loss...');
}).triggerAction({ matches: /^reset/i });
