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
var data;
var has_data = true;

var data_amnt;
var init_cnt;

process.on('message', (msg) =>{//this will accept controller from twitter controller module
  if(msg.instance_type === 'run'){
    data = msg.data;
    init_cnt = msg.data_amnt;
    data_amnt = msg.data_amnt;
    var call_interval = msg.call_interval * 1000;//to ms
    process.send({
      'type' : 'signal',
      'signal' : 'report',
      'report_type' : 'init',
      'call_interval' : call_interval,
      'pid' : process.pid,
      'data_amnt' : msg.data_amnt
    });
    if(msg.data_status === 'not_loaded') has_data = false;
    if(!has_data){
      console.log(process.env.bearer_token);
      twitter_init();
      wait(call_interval);
    }
    setInterval(twitter_call, call_interval);
    //twitter_alarm_id = setInterval(()=>{console.log('twitter call')}, call_interval);
  }
});

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
        trim_user: true,
        include_rts: false},
        (err, tweets, result) =>{
          if(!err){
            if(tweets.length < 1){
              console.log(process.pid, '(', closed_id ,')' ,' got error from twitter API.');
              init_cnt--;
              return;
            }
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
                  'data_amnt' : data_amnt,
                  'data' : data,
                  'report_type' : 'init_done',
                  'pid' : process.pid});
                has_data = true;
            }
          }
          else{
            console.log(process.pid ,'(', closed_id, ')', ' ', err);
            init_cnt--;
            return;
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
        trim_user: true,
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
            if(err[0].code === 22){
              console.log(process.pid, ' rate limit exceeded');
            }
            else if(err[0].code === 34){
              console.log(process.pid, ' ', closed_id, ' has no original tweet');
              data[closed_id].id = '';
              data[closed_id].text = '';
            }
          }
        });
      //console.log(closed_id);
    })(id);
  }
}

/* /modules */

/*prototypes*/
/*/prototypes*/
