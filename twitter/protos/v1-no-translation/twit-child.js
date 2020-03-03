const twitter = require('twitter');
/* Objects*/
var client = new twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  bearer_token: process.env.bearer_token
});

/* /Objects */

/* routers */
/* /routers */

/* modules */
var running_time;;
var waiting_time;

var runtime_timer_id;
var twitter_timer_id;
var twitter_alarm_id;

var data;
var has_data = true;

var init_cnt;

process.on('message', (msg) =>{//this will accept controller from twitter controller module
  if(msg.instance_type === 'run'){
    data = msg.data;
    init_cnt = msg.data_amnt;
    running_time = msg.running_time * 1000;//to ms
    waiting_time = msg.waiting_time * 1000;//to ms
    var call_interval = msg.call_interval * 1000;//to ms
    process.send({
      'type' : 'signal',
      'signal' : 'report',
      'report_type' : 'init',
      'running_time' : running_time,
      'call_interval' : call_interval,
      'pid' : process.pid
    });
    if(msg.data_status === 'not_loaded') has_data = false;
    if(!has_data){
      twitter_init();
      wait(call_interval);
    }
    running_timer_id = setInterval(timer, running_time);
    twitter_timer_id = setInterval(twitter_call, call_interval);
    twitter_alarm_id = setInterval(()=>{console.log('twitter call')}, call_interval);
  }
});

var timer = function(){
  process.send({
    'type' : 'signal',
    'signal' : 'block_req',
    'data' : process.pid});
  clearInterval(runtime_timer_id);
  clearInterval(twitter_timer_id);
  clearInterval(twitter_alarm_id);
  wait(waiting_time);
};

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
  //data is global variable inited with parent process

function twitter_init(){
  for(var id in data)
    (function(closed_id){
      client.get('statuses/user_timeline', {
        screen_name: closed_id,
        count: 1,
        include_rts: false},
        (err, tweets, result) =>{
          if(!err){
            if(tweets.length < 1) return;
            for(var i=0; i<tweets.length; i++){
              process.send({
                'type' : 'signal',
                'signal' : 'load',
                'screen_name' : closed_id,
                'id' : tweets[i].id,
                'text' : tweets[i].text});
              data[closed_id].id = tweets[i].id;
              data[closed_id].text = tweets[i].text;
            }
            init_cnt--;

            if(init_cnt === 0){
              process.send({
                'type' : 'signal',
                'signal' : 'report',
                'report_type' : 'init_done'});
              has_data = true;
              console.log('report init_done sent');
            }
          }
          else{
            console.log(process.pid, closed_id +' ERR ----- ----- ----- -----');
            console.log(err);
          }
      });
      //console.log(closed_id);
    })(id);
}

function twitter_call(){//handling data once it loaded data
  for(var id in data){
    (function(closed_id){
      client.get('statuses/user_timeline', {
        screen_name: closed_id,
        count: 1,
        include_rts: false}
      , (err, tweets, result) =>{
          if(!err){
            if(tweets.length < 1) return;
            for(var i=0; i<tweets.length; i++){
              if(data[closed_id].id != tweets[i].id)
                process.send({
                  'type' : 'signal',
                  'signal' : 'update',
                  'screen_name' : closed_id,
                  'id' : tweets[i].id,
                  'text' : tweets[i].text});
                data[closed_id].id = tweets[i].id;
                data[closed_id].text = tweets[i].text;
            }
          }
          else{
            console.log(process.pid, closed_id +' ERR ----- ----- ----- -----');
            console.log(err);
          }
        });
      //console.log(closed_id);
    })(id);
  }
}

/* /modules */

/*prototypes*/
// process.on('message', (m) =>{
//   var a = m.a;
//   var b = m.b;
//   var c = m.c;
//   var k = m.k;
//   console.log('a: ', a, 'b: ', b, 'c: ', c, 'k: ', k);
//   process.send({'code': a+b+c+k});
//   process.disconnect();
// })
//
// process.on('exit', () =>{
//   console.log('CHILD DIED!');
// })
/*/prototypes*/
