const node_process = require('child_process');
const mysql = require('mysql');
const telegramBot = require('node-telegram-bot-api');

/* Objects*/
var child = [];

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

var controller = {};

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
  'key' : { consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            bearer_token: process.env.TWITTER_BEARER_TOKEN },
  'now' : 0,
  'next' : 1,
  'roll' : function(){
    if(this.next > 2) this.next = 0;
    this.key.consumer_key = this.keys[this.next].consumer_key;
    this.key.consumer_secret = this.keys[this.next].consumer_secret;
    this.key.bearer_token = this.keys[this.next].bearer_token;
    this.now = this.next;
    this.next++;
  }
}

const rate_limit = 1500;
const curr_time_alloc = 5;
/* /Objects */

/* routers */
/* /routers */

/* modules */
var init_list = function(){//init_list : load screen names to the controller
  return new Promise((resolve, reject) =>{
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
                        resolve();
                      }
                    });
                  });
}
/* /modules */
/*main flow*/

init_list().then(
  (resolve) =>{//then() : load the recentest tweet data in certain timeline to the controller
  console.log('fetch success');
  var data_amnt = (Object.keys(controller).length);
  var call_per_process = Math.floor(rate_limit / data_amnt);
  var time_per_process = 5 * 60;// 5 min
  var time_per_call = time_per_process / call_per_process;
  console.log('Fetched rows : ' + data_amnt.toString());

  bot.on('message', (bot_msg) =>{
    console.log('Now bot is on');
    var bot_loopback = bot_msg.chat.id;
    for(var i=0; i<3; i++)
      (function(closed_i){
        /*
        this loop will fork 3 process with different API key
        each child process runs for 5 min then wait for 10 min
        running child process calls API for each 30 sec
        then if there is difference between original data
        it will signal data data set to current process
        and this process will push the data to telegram.
        */

        child[closed_i] = node_process.fork(`./twit-child.js`, [], {'env' : key_chain.key});
        if( closed_i === 1 )
          child[closed_i].send({
            'instance_type' : 'run',
            'data' : controller,
            'data_status' : 'not_loaded',
            'running_time' : time_per_process,
            'waiting_time' : time_per_process * 2,
            'call_interval' : time_per_call,
            'data_amnt' : data_amnt
          });
        else child[closed_i].send({'instance_type' : 'wait'});
        key_chain.roll();

        child[closed_i].on('message', (msg) =>{
          if(msg.type === 'signal'){
            if(msg.signal === 'block_req'){
              var next = (closed_i+1) % 3;
              child[closed_i].send({'instance_type' : 'wait'});
              child[next].send({
                'instance_type' : 'run',
                'data' : controller,
                'data_status' : 'loaded',
                'running_time' : time_per_process,
                'waiting_time' : time_per_process * 2,
                'call_interval' : time_per_call
              });
            }
            else if(msg.signal === 'load'){
              controller[msg.screen_name].id = msg.id;
              controller[msg.screen_name].text = msg.text;
            }
            else if(msg.signal === 'update'){
              var trg = msg.screen_name;
              if(controller[trg].id < msg.id){//check the id if it is newest
                controller[trg].id = msg.id;
                controller[trg].text = msg.text;
                var message = `[ ${controller[trg].symbol} ]
                                 ${controller[trg].text}`;
                bot.sendMessage(channelId, message);
              }
            }
            else if(msg.signal === 'report'){
              if(msg.report_type === 'init'){
                var message = `process ${msg.pid} start running, running time : ${msg.running_time}ms, interval : ${msg.call_interval}ms`;
                bot.sendMessage(bot_loopback, message);
              }
              else if(msg.report_type === 'init_done'){
                //console.log(controller);
                bot.sendMessage(bot_loopback, 'init_done');
              }
            }
          }
        });
      })(i);
  });

},
  (reject) =>{
    console.log('fetch failed');
    console.log(reject);
}).catch((err) =>{
  console.log(err);
});




/*/main flow*/

/*prototypes*/
// child.on('message', (m) =>{
//   var k = m.code;
//   if(k === 115){
//     console.log('a+b+c+k = ', k);
//   }
// });
//
// child.on('exit', (m)=>{
//   console.log('Now I know, my child is dead');
// });
//
// child.send({k : 2, a : 4, b : 10, c : 99});
/*/prototypes*/
