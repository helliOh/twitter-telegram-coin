const express = require('express');
const bodyParser = require('body-parser');
const twitter = require('twitter');
const mysql = require('mysql');
const telegramBot = require('node-telegram-bot-api');
const request = require('request');
//const parser = require("js2xmlparser"); //JSON2XML parser
const app = express();

/* Objects*/
const client = new twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACEESS_SECRET
});

const bot = new telegramBot(
  process.env.TELEGRAM_BOT_KEY,
  {polling: true}
);
const channelId = '-1001329053505';
/* /Objects */

/* routers */
app.set('views', './views');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000, () =>{
  console.log('Connected at port 3000');
});

app.get('/test/:key', (req, res) =>{
  var key = req.params.key;
  client.get('search/tweets', {q: key}, (err, tweets, result) =>{
     if(err) console.log(err);
     console.log(tweets);
     res.send(tweets);
  });
});

app.get('/test', (req,res) =>{
  res.render('test');
});

app.post('/test', (req,res) =>{
  var keyword = req.body.keyword;
  res.redirect('/test/'+keyword);
});

/* /routers */

/* modules */
var id_list = {
  'omise_go' : 0,
  'ethereumproject' : 0,
  'NxtCommunity' : 0
};

bot.on('message', (msg) => {// this bot would work by console command, /start.
  const chatId = msg.chat.id;

  for(var id in id_list)// closer
    (function(closed_id){
      client.get('statuses/user_timeline', {
        screen_name: closed_id,
        count: 1,
        include_rts: false}
      , (err, tweets, result) =>{
        if(!err){
          for(var i=0; i<tweets.length; i++){
            //console.log(i + " " + tweets[i].id + " : " + tweets[i].text);
            var tmp = {
              created_at : tweets[i].created_at,
              id : tweets[i].id,
              text : tweets[i].text
            };
            id_list[closed_id] += 1;
            //bot.sendMessage(chatId, closed_id);//send newest msg to usr
            //id_list[closed_id].push(tmp);
          }
          var cnt_msg = closed_id;
          cnt_msg += id_list[closed_id];
          id_list[closed_id] = 0;
          bot.sendMessage(channelId, cnt_msg);//send newest msg to usr
        }
      });
      //console.log(closed_id);
    })(id);
});

//fetch the tweet id and compare it to previous one
//getTimeline();
//setInterval(function(){console.log(id_list);}, 1 * 1000);
/* /modules */
