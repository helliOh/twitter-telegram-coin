const request = require('request');
/* Objects*/

const KEY = '';
const SECRET = '';

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
/* /Objects */

/* routers */
/* /routers */

/* modules */
//one time modules start
function base64Encode(str){
  return new Buffer(str).toString('base64')
}

function getBearerCredentials(key,secret){
  return base64Encode(key + ':' + secret);
}

function getBearerToken(){
  var credentials = getBearerCredentials(KEY,SECRET);
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
      var data = JSON.parse(body);
      console.log(body);
    }
    else{
      console.log('fail to create bearer token');
    }
  });
}

getBearerToken();
//one time modules end

/* /modules */

/*prototypes*/
/*/prototypes*/
