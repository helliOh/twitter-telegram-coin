const bodyParser = require('body-parser');
const mysql = require('mysql');
const client = require('cheerio-httpcli');
const app = express();

/* Objects*/
const conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'wpfktmwkddlsdjfms',
    database : 'crawler'
});
/* /Objects */

/* routers */

conn.connect();

/* /routers */

/* modules */

var sql = 'select id from controller';

var url = {
  'bithumb' : 'http://bithumb.cafe/notice',
  'upbit' : 'https://upbit.com/service_center/notice'
};

client.fetch(url.bithumb, (err, $, res) =>{//bithumb
  if (!err) {
    var sql = 'select id from bithumb';
    var preset = [];
    conn.query(sql, (err, rows, fields) =>{
      for(var i=0; i<rows.length; i++) preset.push(rows[i].id);
        //console.log(preset);
        var last_page = 0;
        $('div.pagination a.page-numbers').each(function(idx) {//get largest page number
          var page_num = parseInt($(this).text());
          if(page_num > last_page) last_page = page_num;
        });
        for(var i=1; i<last_page+1; i++){
          (function(curr_page){//fecth data from each page.
            var extended_url = url.bithumb + '/page/' + curr_page;
            //console.log(extended_url);
            client.fetch(extended_url, (err, $, res) =>{
              if(!err){
                $('article.category-post-alt1 .entry-title').each(function(idx) {//
                  var id = $(this).children('a').attr('href');
                  id = id.replace('http://bithumb.cafe/archives/','');
                  var title = $(this).text();
                  if(preset.indexOf(id) === -1){
                    var sql = 'insert into bithumb(id,title) values(?,?)';
                    conn.query(sql, [id,title], (err, result, fields) =>{//making log files
                      if(err){
                        //for now title is encoded in parameter
                        console.log(`
                          Error occurs in insert query
                          id = `+ id +`
                          title = ` + title + `
                          ERR from node-mysql
                          ` + err + `
                          `);

                      }
                      else{
                        console.log(result);
                      }
                    });
                  }
                  else{
                    console.log('Existing id =' + id);
                  }
                });

              }
              else{
                console.log(err);
              }
            });
          })(i)
        }
        //console.log(last_page);
    });
  }
  else {
    console.log(err);
  }
})

// client.fetch(url.bithumb, (err, $, res) =>{//upbit
//   if (!err) {
//     var sql = 'select id from upbit';
//     var preset = [];
//     conn.query(sql, (err, rows, fields) =>{
//       if(rows.length>0)
//         for(var i=0; i<rows.length; i++) preset.push(rows[i].id);
//
//         .lAlign a
//
//         //console.log(last_page);
//     });
//   }
//   else {
//     console.log(err);
//   }
// })

// client.fetch('https://upbit.com/home',(err, $, res) =>{//upbit, deprecated(Async page) and replaced to phantomjs
//   console.log($.html('body'));
// })

/* /modules */

/* proto type modules*/
// standard form => xxx.fetch(url, query(optional), callback(err, $, response, body))

// scraping urls
// client.fetch(url, (err, $, res) =>{
//   if (!err) {
//     var links = [];
//     $('a').each(function(idx) {
//       var text = $(this).text();
//       var href = $(this).attr('href');
//       if(href != '#')
//       links.push({
//         'text' : text,
//         'link' : href
//       });
//     });
//   console.log(links);
//   }
//  else {
//     console.log(err);
//   }
// })

//get page numbers
// client.fetch(url, (err, $, res) =>{
//   if (!err) {
//     var last_page = 0;
//     $('div.pagination a.page-numbers').each(function(idx, ele) {
//       var page_num = parseInt($(this).text());
//       if(page_num > last_page) last_page = page_num;
//     });
//     console.log(last_page);
//   }
//   else {
//     console.log(err);
//   }
// })

// get link and title from notice page
// client.fetch(url, (err, $, res) =>{
//   if (!err) {
//     var links = [];
//     $('article.category-post-alt1 .entry-title').each(function(idx, ele) {//
//       links[idx] = {
//         title : $(this).text(),
//         link : $(this).children('a').attr('href')
//       };
//     });
//   console.log(links);
//   }
//  else {
//     console.log(err);
//   }
// })

// client.fetch(url, (err, $, res) =>{//fetch all of urls in that page_bitthumb
//   if (!err) {
//     var last_page = 0;
//     $('div.pagination a.page-numbers').each(function(idx) {//get largest page number
//       var page_num = parseInt($(this).text());
//       if(page_num > last_page) last_page = page_num;
//     });
//     for(var i=1; i<last_page+1; i++){
//       (function(curr_page){//fecth data from each page.
//         var extended_url = url + '/page/' + curr_page;
//         //console.log(extended_url);
//         client.fetch(extended_url, (err, $, res) =>{
//           if(!err){
//             var links = [];
//             $('article.category-post-alt1 .entry-title').each(function(idx, ele) {//
//               links[idx] = {
//                 title : $(this).text(),
//                 link : $(this).children('a').attr('href')
//               };
//             });
//           console.log(links);
//           }
//           else{
//             console.log(err);
//           }
//         });
//       })(i)
//     }
//     //console.log(last_page);
//   }
//   else {
//     console.log(err);
//   }
// })

/* /proto type modules*/
