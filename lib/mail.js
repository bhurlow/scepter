
var api_key = 'key-2gwy742rhbr3joka449gx9s95los4v73';
var domain = 'mg.brianhurlow.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

module.exports = function(msg) {
  mailgun.messages().send(data, function (error, body) {
    console.log('MAILGUN SEND')
    console.log(error)
    console.log(body);
  });
}

