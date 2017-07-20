module.exports = function (session) {
    session.send('How can I help you?');
    session.send('You know saying hi can go a long way..');
    session.sendTyping();
    session.send('So what can i do ?');
    session.send('I can search things');
    session.send('I can have a small chat');
    session.sendTyping();
    session.sendTyping();
    session.send('Im still learning so.. don\'t be angry if i made a mistake');
    session.endDialog();
};
