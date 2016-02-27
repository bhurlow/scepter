
var api_key = 'key-2gwy742rhbr3joka449gx9s95los4v73';
var domain = 'mg.brianhurlow.com';
var info = require('debug')('scepter:mail')
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

module.exports = function(msg) {
  mailgun.messages().send(msg, function (error, body) {
    if (error) {
      return console.error(error)
    }
    info(body.message)
  });
}

