var app = require('express').createServer(handler)
  , io = require('socket.io').listen(app)
  , url = require('url')
  , fs = require('fs')

global.SERVER = true
global.CLIENT = false

app.listen(1337);

function handler (req, res) {

  //var uri = url.parse(req.url).pathname;  

  fs.readFile(__dirname + '/play.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading play.html');
    }

    res.writeHead(200);
    res.end(data);
  });

}

/*-------------------------------
  Catan
-------------------------------*/
require('./server/enums.js') // can't use shared/enums.js since they don't use global

var player = require('./server/player.js')

var BOARD = require('./shared/board.js')
BOARD.setupBoard()

console.log("Tiles: " + BOARD.hexTiles.length)
console.log("Corners: " + BOARD.hexCorners.length)
console.log("Edges: " + BOARD.hexEdges.length)

/*-------------------------------
  Sync board
-------------------------------*/
function SyncBoard(socket) {

  // Send resource types and number tokens
  var numTiles = BOARD.hexTiles.length
  var resources = new Array(numTiles)
  var numbertokens = new Array(numTiles)
  for(var i=0; i < numTiles; i++) {
    resources[i] = BOARD.hexTiles[i].Resource
    numbertokens[i] = BOARD.hexTiles[i].NumberToken
  }

  // Send player buildings
  var players = player.getAll();
  var buildings = [];
  for(var i=0; i < players.length; i++) {

    var ply = players[i]
    if(ply.getID() != socket.Id) { // Don't check for connecting client

      for(var j=0; j < ply.Buildings.length; j++) {
        var build = ply.Buildings[j]
        buildings.push({
          id: build.Id,
          building: build.Building,
          color: build.Color
        })
      }

    }

  }

  socket.emit('BoardCreated', {
    Resources: resources,
    NumberTokens: numbertokens,
    Buildings: buildings
  });

  console.log(buildings)

}

function SetupBuilding(data, plyid) {
    var building = BOARD.getBuildingByID(data.id, data.building)
    var ply = player.getByID(plyid)

    // check for existing building owner
    if(building.HasOwner()) {
      return;
    }

    // enough resources
    // adjacency check
    if(!building.CanBuild(ply)) {
      return;
    }

    // Set owner
    building.SetOwner(ply)
    BOARD.addOwnedBuilding(building)

    var msg = {
      id: data.id,
      building: data.building,
      color: ply.Color
    }

    io.sockets.emit('SetupBuilding', msg)
}

/*-------------------------------
  Connection
-------------------------------*/

io.sockets.on('connection', function (socket) {

  socket.on('disconnect', function (data) {
    player.Disconnect(socket.id, io)
  });

  socket.on('setupBuilding', function (data) {
    SetupBuilding(data,socket.id)
  });

  socket.on('chatSend', function (data) {
    player.OnChat(io,socket,data)
  });

  player.Connect(socket, io) // hooho

  SyncBoard(socket)

});