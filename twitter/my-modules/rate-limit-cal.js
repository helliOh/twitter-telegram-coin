var data_amnt = 224;
var process_amnt = 3;

const rate_limit = 1500;
const reset_time = 15;

var cal = function(){
  var dpp =  Math.floor(data_amnt / process_amnt);//data per process
  var tmp = (data_amnt / process_amnt) - dpp;
  tmp *= process_amnt;

  var extra_dpp = dpp + Math.floor(tmp);//adjustment for natural number division
  console.log('each process gets ', dpp, 'data.');
  console.log('last process gets ', extra_dpp, 'data.');

  tmp = Math.floor(rate_limit / dpp); //call_limit per process
  var tmp2 = Math.floor(rate_limit / extra_dpp);

  var cpm =  tmp / reset_time;//call limit per a minute
  var extra_cpm = tmp2 / reset_time;

  var tpc = Math.ceil( (1 / cpm) * 60 ); //time(seconds) per a call
  var extra_tpc = Math.ceil( (1 / extra_cpm) * 60);

  console.log('each process call API in every ', tpc, 'seconds');
  console.log('last process call API in every ', extra_tpc, 'seconds');
}
var p, l;
