const request = require('request');
const node_process = require('child_process');

var google_key;

var get_ggl_token = function(){
  return new Promise((resolve, reject) =>{
    var cmd = 'gcloud auth print-access-token';
    node_process.exec(cmd, (err, stdout, stderr)=>{
      if(!err){
        google_key = stdout.trim();
        resolve();
      }
      else reject(err);
    })
  })
}

var sendTranslation = async function(text){
  if(google_key === undefined)
    await get_ggl_token().catch((reason)=>{console.log(reason);});

  var opts = {
    url : 'https://translation.googleapis.com/language/translate/v2',
    method : 'POST',
    headers : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + google_key
    },
    json : {
      'q' : text,
      'source' : 'en',
      'target' : 'ko',
      'format' : 'text'
    }
  }

  request.post(opts, (err, res, result)=>{
    if(!err){
      if(result.hasOwnProperty('error')){
        console.log(data.error.errors);
      }
      else{
        var data = result.data;
        for(var _each in data.translations){
          var translation = data.translations[_each].translatedText;
          console.log(translation);
        }
      }
    }
    else console.log(err);
  })
}

sendTranslation('Dark souls2 is the best game I have ever played');
