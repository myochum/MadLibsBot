var twit = require('twit');
var config = require('./config.js');
var rita = require('rita');

var Twitter = new twit(config);

var corpus = '';

var nouns = [];

var verbs = [];

var adjectives = [];

var adverbs = [];

Twitter.stream('user', { replies: 'all' })
    .on('connected', function(msg) {
        status = 'Mad libs is listen';
        console.log(status);
    })
    .on('message', function(msg) {
        if (msg.in_reply_to_screen_name === 'MadLibsBot2000') {
            console.log('Mad libs received the following message: ', msg.text);
            console.log('S/N: ', msg.entities.user_mentions[1].screen_name);

            //Take care of error if there isn't another user_mention.....
            var message = msg.text;

            //Grab the twitter user and make the corpus
            var username = msg.entities.user_mentions[1].screen_name;

            Twitter.get('search/tweets', { count: 100, q: 'from:' + username },
                function(err, data, response) {

                    for (var i = 0; i < data.statuses.length; i++) {
                        var tweet = processTweet(data.statuses[i].text);
                        corpus += tweet + ' ';
                    }

                    var posTags = rita.RiTa.getPosTags(corpus, true);
                    var wordArray = rita.RiTa.tokenize(corpus);
                    for (var i = 0; i < wordArray.length; i++) {
                        var word = wordArray[i];
                        switch (posTags[i]) {
                            case 'n':
                                nouns.push(word);
                                break;
                            case 'v':
                                verbs.push(word);
                                break;
                            case 'a':
                                adjectives.push(word);
                                break;
                            case 'r':
                                adverbs.push(word);
                                break;
                        }
                    }

                    //Make the mad lib.
                    var filledIn = message.replace(/(@[A-Za-z0-9]+)/g, '');
                    filledIn = filledIn.replace(/\(noun\)/, rita.RiTa.randomItem(nouns));
                    filledIn = filledIn.replace(/\(adjective\)/, rita.RiTa.randomItem(adjectives));
                    filledIn = filledIn.replace(/\(verb\)/, rita.RiTa.randomItem(verbs));
                    filledIn = filledIn.replace(/\(adverb\)/, rita.RiTa.randomItem(adverbs));

                    var tweet = filledIn + ' - @' + username;
                    console.log('Filled in text is: ', filledIn);
                    Twitter.post('statuses/update', { status: tweet }, function(err, data, response) {});
                });
        }
    });

//Returns text removing the mentions, hashtags, and urls.
var processTweet = function(x) {
    return x.replace(/(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)/g, "") + '.';
};
