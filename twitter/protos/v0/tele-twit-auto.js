const twitter = require('twitter');
const mysql = require('mysql');
const telegramBot = require('node-telegram-bot-api');
const request = require('request');
/* Objects*/

var key_chain = {
  'keys' : [{ consumer_key: process.env.TWITTER_CONSUMER_KEY,
              consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
              bearer_token: process.env.TWITTER_BEARER_TOKEN },
            { consumer_key: process.env.SPARE_CON_KEY1,
              consumer_secret: process.env.SPARE_CON_SECRET1,
              bearer_token: process.env.SPARE_BEARER1 },
            { consumer_key: process.env.SPARE_CON_KEY2,
              consumer_secret: process.env.SPARE_CON_SECRET2,
              bearer_token: process.env.SPARE_BEARER2 }],
  'now' : 0,
  'next' : 1,
  'roll' : function(){
    if(this.next > 2) this.next = 0;
    client.options.consumer_key = this.keys[this.next].consumer_key;
    client.options.consumer_secret = this.keys[this.next].consumer_secret;
    client.options.bearer_token = this.keys[this.next].bearer_token;
    client.options.request_options.headers.Authorization = client.options.bearer_token;
    this.now = this.next;
    this.next++;
    console.log(client.options);
  }
}
//debugging line
// console.log(client.options);
// console.log('----------------------------------------------------------');
//key_chain.roll();
// console.log('----------------------------------------------------------');
// key_chain.roll();
// console.log('----------------------------------------------------------');
// key_chain.roll();

var client = new twitter({
  consumer_key: process.env.SPARE_CON_KEY1,
  consumer_secret: process.env.SPARE_CON_SECRET1,
  bearer_token: process.env.SPARE_BEARER1
});

const channelId = '-1001329053505';
const bot = new telegramBot(
  process.env.TELEGRAM_BOT_KEY,
  {polling: true}
);

const conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'wpfktmwkddlsdjfms',
    database : 'twitter'
});

var controller = {
  'is_inited' : false
};
/* /Objects */

/* routers */
/* /routers */

/* modules */
//fetch the tweet id and compare it to previous one

//console.log(client.options.consumer_key + ':' + client.options.consumer_secret);

//one time modules start
function base64Encode(str){
  return new Buffer(str).toString('base64')
}

function getBearerCredentials(key,secret){
  return base64Encode(key + ':' + secret);
}

function getBearerToken(){
  var credentials = getBearerCredentials('KEY','SECRET');
  var options = {
    url : 'https://api.twitter.com/oauth2/token',
    method : 'POST',
    headers: {
      'Authorization' : 'Basic ' + credentials,
      "Content-Type" : "application/x-www-form-urlencoded;charset=UTF-8"
    },
    body: 'grant_type=client_credentials'
  };

  request.post(options, (err, response, body)=>{
    if(!err){
      console.log(client);
      var data = JSON.parse(body);
      console.log(body);
    }
    else{
      console.log('fail to create bearer token');
    }
  });
}
//one time modules end

var init_list = function(){//init_list : load screen names to the controller
  return new Promise((resolve, reject) =>{
                    if(controller.is_inited) console.log('already inited');
                    var sql = 'select * from twitter_id';
                    conn.query(sql, (err, rows, fields) =>{
                      if(err) reject(err);
                      else{
                        for(var i=0; i<rows.length; i++){
                          var data = rows[i];
                          controller[data.screen_name] = {
                            'symbol' : data.coin_symbol
                          };
                        }
                        controller.is_inited = true;

                        resolve();
                      }
                    });
                  });
}

var delay = function (delay_t) {
	return new Promise(function (resolve, reject) {
		setTimeout(function(){
			resolve();
		}, delay_t);
	});
};

bot.on('message', (msg) => {
  init_list().then((val) =>{//then() : load the recentest tweet data in certain timeline to the controller
    console.log('DB fetch success');
    console.log('Fetched rows : ' + (Object.keys(controller).length-1).toString());
    return new Promise((resolve, reject) =>{
      for(var id in controller){
        if(id === 'is_inited') continue;
        var cnt = Object.keys(controller).length - 1;
        (function(closed_id){
          client.get('statuses/user_timeline',
          { screen_name: closed_id,
            count: 1,
            include_rts: true },
            (err, tweets, result) =>{
            if(!err){
              for(var i=0; i<tweets.length; i++){
                controller[closed_id].id = tweets[i].id;
                controller[closed_id].text = tweets[i].text;
              }
              //console.log(cnt.toString() + " " + closed_id);
              cnt--;
              if(cnt === 0) resolve();
            }
            else{
              reject(err);
            }
          });
        })(id);
      }// closer
    })
  }).then((val) =>{
    console.log('twitter success');
    //console.log(controller)
    var cnt = 0;
    var delay_t = 34;// 34ms * 30 === 1020 ms
    //telegram bot has send() rate limit, 30/sec
    for(id in controller){
      cnt++;
      if(id === 'is_inited') continue;
      (function(closed_id){
        var tweet =  '['+ controller[closed_id].symbol + ']' + controller[closed_id].text;
        delay(cnt * delay_t).then(function(){
          console.log(closed_id);
          bot.sendMessage(channelId, tweet);
        });//34 * 30 = 1020
      })(id);
    }
  }).catch((reason)=>{
    console.log('process failed');
    console.log(reason);
  });
});
/* /modules */

/*prototypes*/
// init_list.then((val) =>{
//   console.log('DB fetch ' + val);
//
//   bot.on('message', (msg) => {// this bot would work by console command, /start.
//     const chatId = msg.chat.id;//msg limited in 20 so change the process
//     console.log(controller);
//       for(var id in controller)// closer
//         (function(closed_id){
//           client.get('statuses/user_timeline', {
//             screen_name: closed_id,
//             count: 1,
//             include_rts: false}
//           , (err, tweets, result) =>{
//             if(!err){
//               for(var i=0; i<tweets.length; i++){
//                 //console.log(i + " " + tweets[i].id + " : " + tweets[i].text);
//                 var tmp = {
//                   created_at : tweets[i].created_at,
//                   id : tweets[i].id,
//                   text : tweets[i].text
//                 };
//                 controller[closed_id] += 1;
//                 //console.log(tmp);
//                 //bot.sendMessage(chatId, closed_id);//send newest msg to usr
//                 //controller[closed_id].push(tmp);
//               }
//             }
//           });
//         })(id);
//   });
// });
/*/prototypes*/
