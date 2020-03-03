const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const request = require('request');
const telegramBot = require('node-telegram-bot-api');
//const parser = require("js2xmlparser"); //JSON2XML parser
const app = express();

/* Objects*/
const bot = new telegramBot(
  '536174641:AAH1-wAG_qj5HLgXmbY1oVDUeA-EgaDhAg4',
  {polling: true}
);
/* /Objects */

/* routers */
app.set('views', './views');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000, () =>{
  console.log('Connected at port 3000');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'go harder');
});
/* /routers */

/* modules */
/* /modules */
