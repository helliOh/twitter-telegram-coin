const express = require('express');
const bodyParser = require('body-parser');
const client = require('cheerio-httpcli');
const app = express();

/* Objects*/
/* /Objects */

/* routers */
app.set('views', './views');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }));

conn.connect();

/* /routers */

/* modules */

var url = 'http://bithumb.cafe/notice';

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

client.fetch(url, (err, $, res) =>{//fetch all of urls in page_bitthumb
  if (!err) {
    var last_page = 0;
    $('div.pagination a.page-numbers').each(function(idx) {//get largest page number
      var page_num = parseInt($(this).text());
      if(page_num > last_page) last_page = page_num;
    });
    for(var i=1; i<last_page+1; i++){
      (function(curr_page){//fecth data from each page.
        var extended_url = url + '/page/' + curr_page;
        //console.log(extended_url);
        client.fetch(extended_url, (err, $, res) =>{
          if(!err){
            var links = [];
            $('article.category-post-alt1 .entry-title').each(function(idx, ele) {//
              links[idx] = {
                title : $(this).text(),
                link : $(this).children('a').attr('href')
              };
            });
          console.log(links);
          }
          else{
            console.log(err);
          }
        });
      })(i)
    }
    //console.log(last_page);
  }
  else {
    console.log(err);
  }
})

/* /proto type modules*/
