
global._PORT = 17153;
global.SERVER = true;
global.CLIENT = false;

/*-------------------------------
  Catan
-------------------------------*/
require('./server/enums.js'); // can't use shared/enums.js since they don't use global
require('./shared/catan.js');
require('./server/game.js');

/*-------------------------------
  Web Server
-------------------------------*/
var http = require('http').createServer(handle),
  io = require('socket.io').listen(http),
  url = require('url');

http.listen(_PORT);

CATAN.Server = io;

function handle(req, res) {

  var uri = url.parse(req.url).pathname;
  if(uri == '/favicon.ico') return;

  CATAN.setupGame(uri, "Classic");

  var content = '<h1>Settlers Of Catan v' + CATAN.VERSION + '</h1><br />';
  content += CATAN.GameCount + ' servers running.<br /><br />';
  for(var i=0; i < CATAN.GameCount; i++) {
    content += CATAN.Games[i].namespace + '<br />';
  }

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(content);

};
console.log('Server started');