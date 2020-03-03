const node_process = require('child_process');

var cmd = 'gcloud auth print-access-token';
node_process.exec(cmd, (err, stdout, stderr)=>{
  if(!err){
    console.log(stdout);
  }
  else console.log(err);
})
