
global._PORT = 17153;
global.SERVER = true;
global.CLIENT = false;

/*-------------------------------
  Catan
-------------------------------*/
require('./server/enums.js'); // can't use shared/enums.js since they don't use global
require('./shared/catan.js');
require('./server/catan.js');
require('./server/game.js');

/*-------------------------------
  Web Server
-------------------------------*/
var http = require('http').createServer(handle),
  io = require('socket.io').listen(http),
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
    servers.push({
      id: game.id,
      name: game.name,
      schema: game.schema,
      players: game.getPlayers().length,
      max: game.getMaxPlayers()
    });
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

function handle(req, res) {

  var uri = url.parse(req.url).pathname;
  if(uri == '/favicon.ico') return;

  var content = debugOutput();

  res.writeHead(404);
  res.end(content);

};

console.log('Server started');