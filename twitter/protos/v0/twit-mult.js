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
var id_list = {
  'omise_go' : [],
  'ethereumproject' : [],
  'NxtCommunity' : []
};

function getTimeline(){//basic timeline tracking module
  for(var id in id_list)// closer
    (function(closed_id){
      client.get('statuses/user_timeline', {screen_name: closed_id, include_rts: false}
      , (err, tweets, result) =>{
        if(!err){
          for(var i=0; i<tweets.length; i++){
            //console.log(i + " " + tweets[i].id + " : " + tweets[i].text);
            var tmp = {
              created_at : tweets[i].created_at,
              id : tweets[i].id,
              text : tweets[i].text
            };
            id_list[closed_id].push(tmp);
          }
        }
      });
      //console.log(closed_id);
    })(id)
}

//fetch the tweet id and compare it to previous one
getTimeline();
setInterval(function(){console.log(id_list);}, 1 * 1000);
/* /modules */
