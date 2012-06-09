nodepath = process.env.NODE_PATH
if(nodepath === 'undefined') {
  console.log("NODE_PATH env variable undefined!")
  return;
}

global._PORT = 80;
global.SERVER = true;
global.CLIENT = false;

/*-------------------------------
  Catan
-------------------------------*/
require('./server/catan.js');

/*-------------------------------
  Web Server
-------------------------------*/
var http = require('http').createServer(handle),
  io = require(nodepath+'/node_modules/socket.io').listen(http),
  url = require('url'),
  fs = require('fs'),
  path = require('path');

io.set('log level', 1);
http.listen(_PORT);

CATAN.Server = io;

io.sockets.on('connection', function(socket) {
  
  console.log("[MAIN] Client connected");

  socket.on('createServer', function(data) {
    // TODO: Validate this
    var name = data.name.substr(0, 31),
      schema = data.schema.substr(0, 31);
    CATAN.setupGame(socket, name, schema, data.public);
  });

  socket.on('changeName', function(data) {
    socket.set('name', data.name);
    CATAN.Names[socket.handshake.address.address] = data.name;
  });

  socket.on('disconnect', function() {
    console.log("[MAIN] Client disconnected");

    // Disconnect isn't called on namespace
    socket.get('gameid', function(err, id) {
      var game = CATAN.getGameById(id);
      if(typeof game !== 'undefined') {
        game.onPlayerDisconnect(socket);
      }
    });

  });

  var saveName = CATAN.Names[socket.handshake.address.address];
  var name = (typeof saveName !== 'undefined') ? saveName : ('Unknown Player ' + (CATAN.ClientCount++));
  socket.set('name', name)

  // Send player list to new clients
  var servers = [];
  for(var i in CATAN.Games) {
    var game = CATAN.Games[i];
    if( (game.public == true) && (game.getState() == STATE_WAITING) ) {
      servers.push({
        id: game.id,
        name: game.name,
        schema: game.schema,
        players: game.getPlayers().length,
        max: game.getMaxPlayers()
      });
    }
  };

  socket.emit('loadServerList', { name: name, Servers: servers });

});

//process.setMaxListeners(0);

function debugOutput() {
  var content = '<h1>Settlers Of Catan v' + CATAN.VERSION + '</h1>';

  content += '<table>';
  content += '  <thead>';
  content += '    <tr><td>GUID</td><td>Name</td><td>Schema</td><td>Players</td></tr>';
  content += '  </thead>';
  content += '  <tbody>';

  content += CATAN.GameCount + ' servers running.<br /><br />';
  for(var i=0; i < CATAN.Games.length; i++) {
    var game = CATAN.Games[i];
    content += '<tr>';
    content += '<td>' + game.id + '</td>';
    content += '<td>' + game.name + '</td>';
    content += '<td>' + game.schema + '</td>';
    content += '<td>' + game.getPlayers().length + '/' + game.getMaxPlayers() + '</td>';
    content += '</tr>';
  }

  content += '  </tbody>';
  content += '</table>';

  content += '<br />Available game schemas:<br />';
  for(var k in CATAN.Schemas) {
    content += k + '<br />';
  }

  return content;
}

function handle(request, response) {

  var uri = url.parse(request.url).pathname;

  if(uri == '/debug') {
    var content = debugOutput();
    response.writeHead(404);
    response.end(content);
    return;
  }

  var filePath = uri;
  if (filePath == '/')
      filePath = '/index.html';

  var extname = path.extname(filePath);
  var contentType = 'text/html';
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
  }

  filePath = __dirname + filePath;

  path.exists(filePath, function(exists) {

      if(exists) {
          fs.readFile(filePath, function(error, content) {
              if (error) {
                  response.writeHead(500);
                  response.end();
              } else {
                  response.writeHead(200, { 'Content-Type': contentType });
                  response.end(content, 'utf-8');
              }
          });
      }
      else {
          response.writeHead(404);
          response.end();
      }

  });

};

console.log('Server started');