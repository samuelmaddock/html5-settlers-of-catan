var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

global.SERVER = true
global.CLIENT = false

app.listen(1337);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

/*-------------------------------
  Catan
-------------------------------*/
var player = require('./server/player.js')
require('./server/enums.js')
var BOARD = require('./shared/board.js')

BOARD.setupBoard()

console.log("Tiles: " + BOARD.hexTiles.length)
console.log("Corners: " + BOARD.hexCorners.length)
console.log("Edges: " + BOARD.hexEdges.length)

/*-------------------------------
  Sync board
-------------------------------*/
function SetupBoard(socket) {

  var numTiles = BOARD.hexTiles.length
  var resources = new Array(numTiles)
  var numbertokens = new Array(numTiles)
  for(var i=0; i < numTiles; i++) {
    resources[i] = BOARD.hexTiles[i].Resource
    numbertokens[i] = BOARD.hexTiles[i].NumberToken
  }

  // FIXME: BUILDINGS DON'T SEND
  var buildings = [];
  for(var i=0; i < player.List.length; i++) {

    var ply = player.List[i]

    for(var j=0; j < ply.Buildings; j++) {
      var build = ply.Buildings[j]
      buildings.push({
        id: build.Id,
        building: build.Building,
        color: build.Color
      })
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

  socket.on('setupBuilding', function (data) {
    SetupBuilding(data,socket.id)
  });

  socket.on('disconnect', function (data) {
    player.Disconnect(socket.id, io)
  });

  player.Connect(socket, io) // hooho

  SetupBoard(socket)

});