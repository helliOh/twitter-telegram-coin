const express = require('express');
const bodyParser = require('body-parser');
const twitter = require('twitter');
const mysql = require('mysql');
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
function timeLineTrack(target){//basic timeline tracking module
  var timeInterval = 3 * 1000;
  setInterval( function(){
    client.get('statuses/user_timeline', {screen_name: target, count:1, include_rts: false, trim_user: true}, function(err, tweets, result) {
      var d = new Date();
      var info = [];
      console.log(d.getTime());
      if(!err){
        for(var i=0; i<tweets.length; i++){
          //console.log(i + " " + tweets[i].id + " : " + tweets[i].text);
          var tmp = {
            created_at : tweets[i].created_at,
            id : tweets[i].id,
            text : tweets[i].text
          };
          console.log(i, " th tweets");
          console.log(tweets[i]);
          info.push(tmp);
        }
        //console.log(info);
        //if(isValuable(tweets[0].text)) console.log('good');
        //else console.log(tweets[0]);
      }
    })
  }, timeInterval);
}

//fetch the tweet id and compare it to previous one
timeLineTrack('Dashpay');
//OdysseyProtocol
/* /modules */

const filter = [
  'airdrop', 'big news', 'announcement', 'burn', 'launch',
  'listed', 'KRW', 'JPY', 'EUR', 'CNY',
  'mainnet', 'wallet', 'marketing'
];

var isValuable  = function(txt){
  for(var i=0; i<filter.length; i++)
    if( txt.indexOf(filter[i]) != -1 ) return true;
  return false;
}
