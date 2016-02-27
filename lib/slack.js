
var SlackBot = require('slackbots');
var fmt = require('./fmt');
var info = require('debug')('specter:slack')

var bot = new SlackBot({
  token: process.env.SLACK_TOKEN, // Add a bot https://my.slack.com/services/new/bot and put the token 
  name: 'Ops Bot'
});


module.exports = function(event) {
  bot.on('start', function() {
    var params = {
        icon_emoji: ':cat:'
    };
    bot.postMessageToChannel('notifications', fmt(event), params, function(data) {
      info(data)
    })
});
}

