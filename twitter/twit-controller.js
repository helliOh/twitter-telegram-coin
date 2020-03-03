process.env.NTBA_FIX_319 = 1;// To prevent promise error on TELEGRAM_BOT_KEY

const telegramBot = require('node-telegram-bot-api');
const node_process = require('child_process');
const mysql = require('mysql');
const request = require('request');
const translate = require('google-translate-api');

/* Objects*/
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
//max id 적용하기 , url 내용 이전 파싱후 번역하기, url 따로 나타나게 하기 리트윗 끄기
var google_key;//will be inited in process

var controller = {};
var child = [];
const process_amnt = 5;

var key_chain = {
  'keys' : [{ consumer_key: process.env.TWITTER_CONSUMER_KEY,
              consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
              bearer_token: process.env.TWITTER_BEARER_TOKEN },
            { consumer_key: process.env.SPARE_CON_KEY1,
              consumer_secret: process.env.SPARE_CON_SECRET1,
              bearer_token: process.env.SPARE_BEARER1 },
            { consumer_key: process.env.SPARE_CON_KEY2,
              consumer_secret: process.env.SPARE_CON_SECRET2,
              bearer_token: process.env.SPARE_BEARER2 },
            { consumer_key: process.env.SPARE_CON_KEY3,
              consumer_secret: process.env.SPARE_CON_SECRET3,
              bearer_token: process.env.SPARE_BEARER3 },
            { consumer_key: process.env.SPARE_CON_KEY4,
              consumer_secret: process.env.SPARE_CON_SECRET4,
              bearer_token: process.env.SPARE_BEARER4 }],
  'key' : { consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            bearer_token: process.env.TWITTER_BEARER_TOKEN },
  'now' : 0,
  'next' : 1,
  'roll' : function(){
    if(this.next > 4) this.next = 0;
    this.key.consumer_key = this.keys[this.next].consumer_key;
    this.key.consumer_secret = this.keys[this.next].consumer_secret;
    this.key.bearer_token = this.keys[this.next].bearer_token;
    this.now = this.next;
    this.next++;
  }
}

const rate_limit = 1500;
const reset_time = 15;
// const filter = [
//   'airdrop', 'big news', 'announcement', 'burn', 'launch',
//   'listed', 'KRW', 'JPY', 'EUR', 'CNY',
//   'mainnet', 'wallet'
// ];
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



// var isValuable  = function(txt){
//   for(var i=0; i<filter.length; i++)
//     if( txt.indexOf(filter[i]) != -1 ) return true;
//   return false;
// }

var data_amnt;

var data_offset_per_process,
    last_data_offset_per_process;

var process_time,
    last_process_time;

var calculate_time = function(){
  var dpp =  Math.floor(data_amnt / process_amnt);//data per process
  var tmp = (data_amnt / process_amnt) - dpp;
  tmp *= process_amnt;

  var extra_dpp = dpp + Math.floor(tmp);//adjustment for natural number division

  data_offset_per_process = dpp;
  last_data_offset_per_process = extra_dpp;
  //console.log('each process gets ', dpp, 'data.');
  //console.log('last process gets ', extra_dpp, 'data.');

  tmp = Math.floor(rate_limit / dpp); //call_limit per process
  var tmp2 = Math.floor(rate_limit / extra_dpp);

  var cpm =  tmp / reset_time;//call limit per a minute
  var extra_cpm = tmp2 / reset_time;

  var tpc = Math.ceil( (1 / cpm) * 60 ); //time(seconds) per a call
  var extra_tpc = Math.ceil( (1 / extra_cpm) * 60);

  //console.log('each process call API in every ', tpc, 'seconds');
  //console.log('last process call API in every ', extra_tpc, 'seconds');
  process_time = tpc;
  last_process_time = extra_tpc;
}
/* /modules */
/*main flow*/

init_list().then(
  (resolve) =>{//then() : load the recentest tweet data in certain timeline to the controller
  console.log('fetch success');
  data_amnt = Object.keys(controller).length;
  calculate_time();//this will initiate the time, data values per proccess in global var.
  console.log('Fetched rows : ' + data_amnt.toString());

  bot.on('message', (bot_msg) =>{
    var cmd = bot_msg.text;
    var bot_loopback = bot_msg.chat.id;

    if(cmd === '/start'){
      var present_index = 0;
      var index_marked = 0;

      var key_arr = Object.keys(controller);
      for(var i=0; i<process_amnt; i++)
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
          var loaded_data_amnt;
          var time_interval;
          if(closed_i != process_amnt-1){
            loaded_data_amnt = data_offset_per_process;
            index_marked += data_offset_per_process;
            time_interval = process_time;
          }
          else{
            loaded_data_amnt = last_data_offset_per_process;
            index_marked += last_data_offset_per_process;
            time_interval = last_process_time;
          }
          console.log(present_index, index_marked);

          var data_for_each_process = {};
          for(var i=present_index; i<index_marked; i++){
            var idx = key_arr[i];
            data_for_each_process[idx] = controller[idx];
          }

          present_index = index_marked;

          child[closed_i].send({
            'instance_type' : 'run',
            'data' : data_for_each_process,
            'data_status' : 'not_loaded',
            'call_interval' : time_interval,
            'data_amnt' : loaded_data_amnt
          });
          key_chain.roll();

          child[closed_i].on('message', (msg) =>{
            if(msg.type === 'signal'){
              if(msg.signal === 'load'){
                controller[msg.screen_name].id = msg.id;
              }
              else if(msg.signal === 'update'){
                if(controller[msg.screen_name].id < msg.id){//check the id if it is newest
                  translate(msg.text, {from : 'en', to : 'ko'}).then(res => {
                    var symbol = '[' + controller[msg.screen_name].symbol + ']\n\r';
                    var text = msg.text;
                    var url = msg.url + '\n\r\n\r';
                    var translation = symbol + url + res.text;
                    bot.sendMessage(channelId, translation);
                  }).catch(err => {
                      console.error(err);
                  });

                  controller[msg.screen_name].id = msg.id;
                }
              }
              else if(msg.signal === 'report'){
                if(msg.report_type === 'init'){
                  var message = `process ${msg.pid} start running, interval : ${msg.call_interval}ms with ${msg.data_amnt}`;
                  bot.sendMessage(bot_loopback, message);
                }
                else if(msg.report_type === 'init_done'){
                  bot.sendMessage(bot_loopback, 'init_done');
                }
                else if(msg.report_type === 'not_inited'){
                  console.log(msg.pid, ' have failed to init, check out the data below');
                  console.log(msg.data);
                }
              }
            }
          });
        })(i);
    }
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

// var sendTranslation = async function(message){
//   if(google_key === undefined)
//     await get_ggl_token().catch((reason)=>{console.log(reason);});
//
//   var opts = {
//     url : 'https://translation.googleapis.com/language/translate/v2',
//     method : 'POST',
//     headers : {
//       "Content-Type" : "application/json",
//       "Authorization" : "Bearer " + google_key
//     },
//     json : {
//       'q' : message.text,
//       'source' : 'en',
//       'target' : 'ko',
//       'format' : 'text'
//     }
//   }
//
//   request.post(opts, (err, res, result)=>{
//     if(!err){
//       if(result === undefined) console.log('result.err : ', result);
//       else{
//         var data = result.data;
//         if(data === undefined) console.log('data.err : ', result);
//         if(result.hasOwnProperty('error')) console.log(result.error.errors);
//         var translation = data.translations[0].translatedText;
//         translation = message.symbol + message.url + translation;
//         bot.sendMessage(channelId, translation);
//       }
//     }
//     else console.log(err);
//   });
// }

// var get_ggl_token = function(){
//   return new Promise((resolve, reject) =>{
//     var cmd = 'gcloud auth print-access-token';
//     node_process.exec(cmd, (err, stdout, stderr)=>{
//       if(!err){
//         google_key = stdout.trim();
//         resolve();
//       }
//       else reject(err);
//     })
//   })
// }

/*/prototypes*/
