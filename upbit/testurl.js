const request = require('request');

request.get({
  'url' : 'https://api.upbit.com/v1/candles/minutes/1',
  'qs' : { market: 'market' }
   }, (error, response, body) =>{
  console.log(body);
});
