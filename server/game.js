require('../shared/board.js');
require('./player.js');

CATAN.Game = function(namespace,schema) {

	this.id = ++ CATAN.GameCount;
	this.schema = (schema !== undefined) ? schema : "Classic";	// Default schema to Classic

	this.players = [];

	this.board = new CATAN.Board(this);

	// Setup server
	this.namespace = (namespace != undefined) ? namespace : "/";
	this.sockets = CATAN.Server.of(this.namespace);

	// Setup socket hooks
	this.sockets.on( 'connection',		this.onPlayerConnection );
	this.sockets.on( 'disconnect',		this.onPlayerDisconnect );
	this.sockets.on( 'chatSend',		this.onPlayerChat );
	this.sockets.on( 'setupBuilding',	this.onPlayerBuild );

	console.log("STARTED CATAN SERVER " + this.id + ": " + this.namespace);

};

CATAN.Game.prototype = {

	constructor: CATAN.Game,

	/* --------------------------------------------
		Schema
	-------------------------------------------- */
	setSchema: function(schema) {

		this.schema = (schema !== undefined) ? schema : "Classic";

	},

	getSchema: function(schema) {

		return CATAN.Schemas[this.schema];

	},

	getMaxPlayers: function(schema) {

		return this.getSchema().MaxPlayers;

	},

	/* --------------------------------------------
		Players
	-------------------------------------------- */
	isValidPlayer: function(ply) {
		return typeof ply != 'undefined';
	},

	getPlayers: function(schema) {

		return this.players;

	},

	getByID: function(id) {
		for(i in this.players) {
			var ply = this.players[i];
			if (ply.getID() == id) {
				return ply;
			};
		};
	},

	getByName: function(name) {
		for(i in this.players) {
			var ply = this.players[i];
			if (ply.getName() == name) {
				return ply;
			};
		};
	},

	/* --------------------------------------------
		Socket Hooks
		TODO: Clean these up
	-------------------------------------------- */
	onPlayerConnection: function(socket) {

		console.log("PLAYER CONNECTION");

		var self = CATAN.getGameByURI(socket.namespace.name);
		if(typeof self === 'undefined') return;

		if(self.getMaxPlayers() <= self.getPlayers().length) {
			// server is full
			return;
		};

		var ply = new CATAN.Player();

		ply.socket = socket; // TEST
		ply.Id = socket.id;
		ply.Address = socket.handshake.address;

		ply.Game = self;

		ply.Name += " " + (self.getPlayers().length + 1);
		ply.Color = Math.round( 0xffffff * Math.random() );

		// Don't send the address later on, this could be exploited
		socket.broadcast.emit('PlayerJoin', { Name: ply.Name, Id: ply.Id, Address: ply.Address });

		ply.Index = self.players.push(ply);

		self.syncBoard(ply);

	},
	
	onPlayerDisconnect: function(socket) {

		var self = CATAN.getGameByURI(socket.namespace.name);
		if(typeof self === 'undefined') return;

		var ply = self.getPlayerByID(id);
		if(typeof ply == 'undefined') return;

		// Remove building ownership
		for(i in ply.Buildings) {
			var building = ply.Buildings[i];
			building.Owner = -1;
			self.sockets.emit('BuildingReset', { id: building.Id, building: building.Building });

			delete building;
		}

		self.sockets.emit('PlayerLeave', { Name: ply.Name, Id: ply.Id });

		self.players.splice(ply.Index-1,1);

	},
	
	onPlayerChat: function(socket) {

		var self = CATAN.getGameByURI(socket.namespace.name);
		if(typeof self === 'undefined') return;

		var ply = self.getByID(socket.id);
		if(!self.IsValidPlayer(ply)) return;

		var name = ply.getName(),
		text = data.text.substr(0, 127),
		col = ply.Color.toString(16);

	    self.sockets.emit('ChatReceive', { Name: name, Text: text, Color: col });

	},

	onPlayerBuild: function(socket) {
		console.log("***onPlayerBuild***");
		console.log(socket);
	},

	syncBoard: function(ply) {

		var game = ply.Game,
			board = game.board;

		// Send resource types and number tokens
		var numTiles = board.hexTiles.length;
		var resources = new Array(numTiles);
		var numbertokens = new Array(numTiles);
		for(var i=0; i < numTiles; i++) {
			resources[i] = board.hexTiles[i].Resource;
			numbertokens[i] = board.hexTiles[i].NumberToken;
		};

		// Send player buildings
		var players = game.getPlayers();
		var buildings = [];
		for(var i=0; i < players.length; i++) {

			var pl = players[i]
			if(pl.getID() != ply.getID()) { // Don't check for connecting client

			  for(var j=0; j < pl.Buildings.length; j++) {
			    var build = pl.Buildings[j]
			    buildings.push({
			      id: build.Id,
			      building: build.Building,
			      color: build.Color
			    })
			  }

			}

		}

		ply.socket.emit('BoardCreated', {
			Resources: resources,
			NumberTokens: numbertokens,
			Buildings: buildings
		});

	}

};

CATAN.GameCount = 0;