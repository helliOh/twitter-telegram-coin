const express = require('express');
const bodyParser = require('body-parser');
const client = require('cheerio-httpcli');
// const mongo = require('mongodb').MongoClient;
// const assert = require('assert');
//const parser = require("js2xmlparser"); //JSON2XML parser
const app = express();

/* Objects*/
// const DB = mysql.createConnection({
//     host : 'localhost',
//     user : 'root',
//     password : 'wpfktmwkddlsdjfms',
//     database : 'helli'
// });
/* /Objects */


/* routers */
app.set('views', './views');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000, () =>{
  console.log('Connected at port 3000');
});

app.get('/test', (req,res) =>{
  res.render('test');
});

app.post('/test', (req,res) =>{
  var keyword = req.body.keyword;
  res.redirect('/test/'+keyword);
});

/* /routers */

/* modules */
var url = "http://bearpot.net";
var param = {};
var word =    ' node.js ' ;

client . fetch ( ' http://www.google.com/search ' ,    { q : word } ,    function    ( err ,    $ ,    res ,    body )    {
  // See Response Header
  console . log ( res . headers ) ;

  console . log ( $ ( ' title ' ) . text ( ) ) ;

} ) ;
/* /modules */
