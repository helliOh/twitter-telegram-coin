const express = require('express');
const bodyParser = require('body-parser');
const twitter = require('twitter');
const mysql = require('mysql');
const telegramBot = require('node-telegram-bot-api');
const request = require('request');
//const parser = require("js2xmlparser"); //JSON2XML parser
const app = express();

/* Objects*/
var client = new twitter({
  consumer_key: 'XiAjK8jqc6JXHlV1LcKUxZXGv',
  consumer_secret: 'KevZBMun1bIuPPeh0ElLFjeD1M6kqCZIlZEF2bgf6EMWh4LL2z',
  access_token_key: '943544665537617921-e4fXL0RGXJJKXETXafz74Xg8hRT31RO',
  access_token_secret: 'WlGFqEN8Qjy8zNs9ombn8yhtIJLxftiHuTcfhXywoG92D'
});

const bot = new telegramBot(
  '536174641:AAH1-wAG_qj5HLgXmbY1oVDUeA-EgaDhAg4',
  {polling: true}
);
/* /Objects */

/* routers */
app.set('views', './views');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000, () =>{
  console.log('Connected at port 3000');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  client.get('statuses/user_timeline', {screen_name: 'MobileGoToken', include_rts: false}, function(err, tweets, result) {
    if(!err){
      for(var i=0; i<tweets.length; i++){
        //console.log(i + " " + tweets[i].id + " : " + tweets[i].text);
        var tmp = {
          created_at : tweets[i].created_at,
          id : tweets[i].id,
          text : tweets[i].text
        };
        bot.sendMessage(chatId, tmp.text);
      }
    }
  })

});

/* /routers */

/* modules */
/* /modules */
