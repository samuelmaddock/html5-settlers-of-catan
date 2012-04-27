require('../shared/board.js');
require('./player.js');

CATAN.Game = function(socket,name,schema,public) {

	this.id = this._createId();

	this.owner = socket.id;

	this.name = (typeof name !== 'undefined') ? name : "Settlers Of Catan";
	this.schema = (typeof schema !== 'undefined') ? schema : "Classic";	// Default schema to Classic
	this.public = (typeof public !== undefined) ? public : true;


	this.players = [];

	this.board = new CATAN.Board(this);

	// Setup server
	this.namespace = '/' + this.id;
	this.sockets = CATAN.Server.of(this.namespace);

	// Setup socket hooks
	this.sockets.on( 'connection',		this.onPlayerConnection );

	console.log( '[' + this.id + '] Server initialized...');
	CATAN.GameCount++;

	socket.emit('serverReady', { id: this.id })

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

	isOwner: function(ply) {
		return ply.getID() == this.owner;
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

	// doesn't check duplicate names yet (ply.NameDup)
	getByName: function(name) {
		for(i in this.players) {
			var ply = this.players[i];
			if (ply.getName() == name) {
				return ply;
			};
		};
	},

	/* --------------------------------------------
		Misc
	-------------------------------------------- */
	getColor: function() {
		return Math.round( 0xffffff * Math.random() );
	},

	/* --------------------------------------------
		Socket Hooks
	-------------------------------------------- */
	onPlayerConnection: function(socket) {

		var self = CATAN.getGameByNamespace(socket.namespace.name);
		if(typeof self === 'undefined') return;

		// Check max players
		if(self.getMaxPlayers() <= self.getPlayers().length) {

			socket.emit('connectionStatus', {
				success: false,
				message: 'Server is full'
			});

			return;

		};

		// Create new player
		var ply = new CATAN.Player(socket);
		ply.connect(self, socket);

		// check for duplicate names
		var players = self.getPlayers();
		for(var i in players) {
			if((players[i].Name == ply.Name) && (players[i].NameDup == ply.NameDup)) {
				ply.NameDup++
			}
		}

		self.players.push(ply); // add to player list

		// Inform user of connection
		ply.socket.emit('connectionStatus', { success: true });

		console.log('[' + self.id + '] Player connected');

		socket.on( 'playerReady',		function(data) { self.onPlayerJoin(socket,data) } );
		//socket.on( 'disconnect',		function(data) { self.onPlayerDisconnect(socket,data) } );
		socket.on( 'chatSend',			function(data) { self.onPlayerChat(socket,data) } );
		socket.on( 'setupBuilding',		function(data) { self.onPlayerBuild(socket,data) } );

	},
	
	onPlayerJoin: function(socket) {

		var ply = this.getByID(socket.id);
		if(!this.isValidPlayer(ply)) return;

		this.syncBoard(ply);

		this.sockets.emit('PlayerJoin', { Name: ply.getName(), Id: ply.Id, Address: ply.Address });

	},

	onPlayerDisconnect: function(socket) {

		var ply = this.getByID(socket.id);

		if(!this.isValidPlayer(ply)) return;

		// Remove player buildings
		for(var i in ply.Buildings) {
			var building = ply.Buildings[i];
			building.Owner = -1;
			this.sockets.emit('BuildingReset', { id: building.Id, building: building.Building });

			delete building;
		}

		this.sockets.emit('PlayerLeave', { Name: ply.getName(), Id: ply.Id });

		// Remove from player list
		var players = this.getPlayers();
		for(i in players) {
			var pl = players[i];
			if (pl.getID() == ply.getID()) {
				this.players.splice(i,1);
			}
		};

		console.log('[' + this.id + '] Player disconnected');

		// End server if empty
		if(this.getPlayers().length < 1) {
			console.log('[' + this.id + '] Terminating server...');
			this._shutdown();
		}

	},
	
	onPlayerChat: function(socket,data) {

		var ply = this.getByID(socket.id);
		if(!this.isValidPlayer(ply)) return;

		var name = ply.getName(),
			text = data.text.substr(0, 127),
			col = ply.Color.toString(16);

	    this.sockets.emit('ChatReceive', { Name: name, Text: text, Color: col });

	},

	onPlayerBuild: function(socket) {

		console.log("***onPlayerBuild***");
		console.log(socket);

	},

	syncBoard: function(ply) {

		var game = ply.Game,
			board = game.board;

		// Send tile data
		var tiles = [];
		for(var i=0; i < board.hexTiles.length; i++) {

			var tile = board.hexTiles[i];

			tiles.push({
				pos: tile.getPosition(),
				resource: tile.getResource(),
				token: tile.getToken()
			});

		};

		ply.socket.emit('boardTiles', { tiles: tiles });

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

		ply.socket.emit('boardBuildings', { Buildings: buildings });

	}

};

CATAN.GameCount = 0;