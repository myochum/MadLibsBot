var twit = require('twit');
var config = require('./config.js');

var Twitter = new twit(config);


Twitter.stream('user', { replies: 'all' })
    .on('connected', function(msg) {
        status = 'Mad libs is listen';
        console.log(status);
    })
    .on('message', function(msg) {
        // If the @reply screen name is to robomapper...
        if (msg.in_reply_to_screen_name === 'MadLibsBot2000') {
            console.log('Mad libs received the following message: ', msg.text);

            // Save the text of the message and subtract the username
            var locationQuery = msg.text;


        }
    });
