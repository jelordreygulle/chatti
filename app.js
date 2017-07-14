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
     //setting default values
     if (session.userData.name === undefined){
          session.userData.name = session.message.user.name
     }

    console.log(session.message.user.name + ' -> ' +session.message.text.toLowerCase());
    if(session.message.text.toLowerCase().contains('hello') || session.message.text.toLowerCase().contains('hi')){
        session.send('Hey, '+ session.userData.name +' How are you?');

      }else if((m = /^\good (morning|evening|night)/i.exec(session.message.text)) !== null){
        greets = Array('Good day to you too',
		       'Wish you the same', 
		       'hmm',
		       'Good '+ m[1]);
        session.send(greets[Math.floor(Math.random()*greets.length)]);

      }else if ((m = /^change (?:my)?[ ]?(name|search)/i.exec(session.message.text)) !== null){
        session.send('changeing name.....' + session.message.text + "...");
       
          if (m[1] == 'name'){
                session.beginDialog('changeName');
          }else if (m[1] == 'search'){
              session.send("change search,,,,,,");
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
        session.send(replies[Math.floor(Math.random() * replies.length)]);

      } else if ((m = /^\who (is|are) (you|chatti)/i.exec(session.message.text)) !== null) {
        replies = Array('I am chatti the bot',
		                'I\'m chatti');
        session.send(replies[Math.floor(Math.random() * replies.length)]);
	  } else if ((m = /^\how are (you|chatti)/i.exec(session.message.text)) !== null) {
        replies = Array('I am doing good, how are you ?',
                        'I\'m doing good',
		                'So far so good');
        session.send(replies[Math.floor(Math.random() * replies.length)]);
	
      }else if(session.message.text.toLowerCase().contains('status')){
			  session.send('My status telling....');
      }else if(session.message.text.toLowerCase().contains('thank')){
			  session.send('You are welcome');
      }else{
	      replies = Array('Sorry I don\'t understand you...',
		       'what do you mean ?',
		        'Sorry, I do not understand that yet..',
			 'I do not understand that yet..',
 			'Can you ask something else ?',		      
			':|');
        session.send(replies[Math.floor(Math.random() * replies.length)]);
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
bot.dialog('search', function (session, args, next) {
    // perform search
    if (session.userData.search === undefined){
          session.userData.search = 'DuckDuckGo'
     }
    // console.log(args.intent.matched[1].trim());
    var messageText = args.intent.matched[1].trim();
    // session.send('%s, wait a few seconds. Searching for \'%s\' ...', session.message.user.name, messageText);
    if (session.userData.search === 'DuckDuckGo'){
        
        request = require('request'); 
        var url = "https://api.duckduckgo.com/?q="+encodeURIComponent(messageText)+"&format=json&pretty=1";

        request(url, function(err, response, body){
                if (err) console.log(err);
                if (response.statusCode == 200) {
                    body = JSON.parse(body)
                        session.sendTyping();
                        console.log(body);
                        if (body.AbstractText !== ""){
                            session.send(body.AbstractText);    
                        }else if (body.RelatedTopics[0].Text !== ""){
                            session.send(body.RelatedTopics[0].Text);
                        }else{
                            session.send('https://duckduckgo.com/?q=%s', encodeURIComponent(messageText));
                        }

                } else if (response.statusCode == 500) {
                    session.send("error: server error");
                    
                } else {
                    session.send("error: problem with request code: "+response.statusCode)
                    
                }
        });
        session.send('searching '+ messageText);

    }else if (session.userData.search === 'Google'){
        session.send('https://www.google.com/search?q=%s', encodeURIComponent(messageText));

    }else if (session.userData.search === 'Bing'){
            session.send('https://www.bing.com/search?q=%s', encodeURIComponent(messageText));
            // session.endDialog();
    }else{
        session.send('I dont know from where should i search '+ messageText);
    }
   session.endDialog();
    
}).triggerAction({ matches: /^(?:(?:what (?:is|is a|are))|search) (.*)/i });//regex pattern matching

bot.dialog('HelpDialog', require('./support'))
    .triggerAction({ 
      matches: [/help/i, /support/i, /problem/i] 
});

// reset bot dialog
bot.dialog('reset', function (session) {
    delete session.userData.name
    session.endDialog('Ups... I\'m suffering from a memory loss...');
}).triggerAction({ matches: /^reset/i });
