require('../shared/board.js');
require('./player.js');

CATAN.Game = function(schema) {

	this.name = (typeof name !== 'undefined') ? name : "Settlers Of Catan";

	this.id = this._createId();
	this.schema = (schema !== undefined) ? schema : "Classic";	// Default schema to Classic

	this.players = [];

	this.board = new CATAN.Board(this);

	// Setup server
	this.namespace = '/' + this.id;
	this.sockets = CATAN.Server.of(this.namespace);

	// Setup socket hooks
	this.sockets.on( 'connection',		this.onPlayerConnection );
	this.sockets.on( 'disconnect',		this.onPlayerDisconnect );
	this.sockets.on( 'chatSend',		this.onPlayerChat );
	this.sockets.on( 'setupBuilding',	this.onPlayerBuild );

	console.log( '[' + this.id + '] Server initialized...');
	CATAN.GameCount++;

};

CATAN.Game.prototype = {

	constructor: CATAN.Game,

	_createId: function(uri) {

		// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
		return 'xxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});

	},

	_shutdown: function() {
		for(var i in CATAN.Games) {
			if(CATAN.Games[i].id === this.id) {
				// get rid of reference, let garbage collection do the rest
				CATAN.Games.splice(i,1);
				CATAN.GameCount--;
			}
		}
	},

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

		var self = CATAN.getGameByNamespace(socket.namespace.name);
		if(typeof self === 'undefined') return;

		// Check schema max players
		if(self.getMaxPlayers() <= self.getPlayers().length) {
			return;
		};

		var ply = new CATAN.Player(socket);

		ply.connect(self);

		ply.Index = self.players.push(ply);
		ply.Name += " " + (self.getPlayers().length + 1);
		ply.Color = Math.round( 0xffffff * Math.random() );

		// Don't send the address later on, this could be exploited
		self.sockets.emit('PlayerJoin', { Name: ply.Name, Id: ply.Id, Address: ply.Address });

		//self.syncBoard(ply);

		console.log('[' + self.id + '] Player connected');

	},
	
	onPlayerDisconnect: function(socket) {

		var self = this;

		var ply = self.getByID(socket.id);
		if(!self.isValidPlayer(ply)) return;

		// Remove building ownership
		for(i in ply.Buildings) {
			var building = ply.Buildings[i];
			building.Owner = -1;
			self.sockets.emit('BuildingReset', { id: building.Id, building: building.Building });

			delete building;
		}

		self.sockets.emit('PlayerLeave', { Name: ply.Name, Id: ply.Id });

		self.players.splice(ply.Index-1,1);

		console.log('[' + self.id + '] Player disconnected');

		if(self.getPlayers().length < 1) {
			console.log('[' + self.id + '] Terminating server...');
			this._shutdown();
		}

	},
	
	onPlayerChat: function(socket) {

		var self = CATAN.getGameByNamespace(socket.namespace.name);
		if(typeof self === 'undefined') return;

		var ply = self.getByID(socket.id);
		if(!self.isValidPlayer(ply)) return;

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
		var numTiles = board.hexTiles.length,
			resources = new Array(numTiles),
			numbertokens = new Array(numTiles);

		for(var i=0; i < numTiles; i++) {
			resources[i] = board.hexTiles[i].Resource;
			numbertokens[i] = board.hexTiles[i].NumberToken;
		};

		// Send player buildings
		var players = game.getPlayers(),
			buildings = [];

		for(var i=0; i < players.length; i++) {

			var pl = players[i];
			if(pl.getID() != ply.getID()) { // Don't check for connecting client

				for(var j=0; j < pl.Buildings.length; j++) {

					var build = pl.Buildings[j];
					buildings.push({
						id: build.Id,
						building: build.Building,
						color: build.Color
					});

				};

			};

		};

		ply.socket.emit('BoardCreated', {
			Resources: resources,
			NumberTokens: numbertokens,
			Buildings: buildings
		});

	}

};

CATAN.GameCount = 0;