require('../shared/player.js');
require('./board.js');
require('./turnmanager.js');

CATAN.Game = function(socket,name,schema,public) {

	this.id = this._createId();
	this.owner = null; // set on first player connection

	this.name = (typeof name !== 'undefined') ? name : "Settlers Of Catan";
	this.schema = (typeof schema !== 'undefined') ? schema : "Classic";	// Default schema to Classic
	this.public = (typeof public !== undefined) ? public : true;

	this.state = STATE_WAITING;
	this.players = [];
	this.entities = [];
	this.board = new CATAN.Board(this);
	this.turnManager = new CATAN.TurnManager(this);

	// Setup sockets
	this.namespace = '/' + this.id;
	this.sockets = CATAN.Server.of(this.namespace);
	this.sockets.on( 'connection', this.onPlayerConnection );

	this.started = Date.now();

	/*var self = this;
	setTimeout( function() {
		if(typeof self == 'undefined') return;
		if(!self._isValid()) { console.log("no ply"); self._shutdown(); };
		console.log(self);
	}, 1000 * 10);*/

	socket.emit('serverReady', { id: this.id });

	CATAN.GameCount++;
	console.log( '['+this.id+'][#'+CATAN.GameCount+'] Server initialized...');

    CATAN.Server.sockets.emit( 'serverStatus', { status: 'start', info: this.getStatus() } )

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
    	CATAN.Server.sockets.emit( 'serverStatus', { status: 'shutdown', info: { id: this.id } } );
		for(var i in CATAN.Games) {
			if(CATAN.Games[i].id === this.id) {
				// get rid of reference, let garbage collection do the rest
				CATAN.Games.splice(i,1);
				CATAN.GameCount--;
			}
		}
	},

	_isValid: function() {
		return (this.getPlayers().length > 0);
	},

	getStatus: function() {
		return {
			id: this.id,
			name: this.name,
			schema: this.schema,
			players: this.getNumPlayers(),
			max: this.getMaxPlayers()
		}
	},

	emit: function(name,data) {
		this.sockets.emit(name,data);
	},

	isValidEntity: function(ent) {
		return typeof ent != 'undefined';
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

	getPlayers: function() {
		return this.players;
	},

	getNumPlayers: function() {
		return this.players.length;
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
	getEntById: function(id) {
		for(var i in this.entities) {
			if(this.entities[i].getEntId() == id) {
				return this.entities[i];
			}
		}
	},

	getColor: function() {
		//return Math.round( 0xffffff * Math.random() );
		if(!this.colors) {
			this.colors = this.getSchema().getColors();
		}
		var rand = Math.random() * this.colors.length
		return this.colors.splice(rand,1)[0];;
	},

	getOwner: function() {
		return this.owner;
	},

	setOwner: function(ply) {
		this.owner = ply.getID();
		// TODO: inform players of new ownership
	},

	hasValidOwner: function() {
		for(i in this.players) {
			var ply = this.players[i];
			if (ply.getID() == this.owner) {
				return true;
			};
		};
		return false;
	},

	getState: function() {
		return this.state;
	},

	setState: function(state) {

		var messages = [
			"",
			"Setup has begun",
			"Game is now in-progress",
			"Game has ended"
		];

		this.emit('GameUpdate', {
			message: messages[state]
		});

		this.state = state;
	},

	/* --------------------------------------------
		Player Hooks
	-------------------------------------------- */
	onPlayerConnection: function(socket) {

		var self = CATAN.getGameByNamespace(socket.namespace.name);
		if(typeof self === 'undefined') return;

		// Check max players
		if(self.getMaxPlayers() <= self.getPlayers().length) {
			socket.emit('connectionStatus', {
				success: false,
				message: 'Server is full.'
			});
			return;
		};

		// Check state
		if(self.getState() != STATE_WAITING) {
			socket.emit('connectionStatus', {
				success: false,
				message: 'Game is already in-progress.'
			});
			return;
		};

		// Create new player
		var ply = new CATAN.Player();
		ply.connect(self, socket);

		self.players.push(ply); // add to player list

		// First player connection is owner
		if(!self.hasValidOwner()) {
			self.setOwner(ply);
		}

		// Setup player hooks
		socket.on( 'playerReady',		function(data) { self.onPlayerJoin(socket,data) } );
		socket.on( 'playerChat',		function(data) { self.onPlayerChat(socket,data) } );
		socket.on( 'playerBuild',		function(data) { self.onPlayerBuild(socket,data) } );
		socket.on( 'startGame',			function(data) { self.onStartGame(socket,data) } );

		// Inform user of successful connection
		ply.emit('connectionStatus', { success: true });
		console.log('[' + self.id + '] Player connected (' + self.getNumPlayers() + '/' + self.getMaxPlayers() + ')');

	},
	
	onPlayerJoin: function(socket,data) {

		var ply = this.getByID(socket.id);
		if(!this.isValidPlayer(ply)) return;
		if(ply.Joined == true) return;

		ply.name = data.name.substring(0,31);
		ply.Joined = true;

		// Check for duplicate names
		var players = this.getPlayers();
		for(var i in players) {
			var pl = players[i]
			if((pl.getID() != ply.getID()) && (pl.name == ply.name) && (pl.nameDup == ply.nameDup)) {
				ply.nameDup++
			}
		}

		// Send hex tiles, etc.
		this.syncGame(ply);

		// Announce player join in chat
		this.emit('PlayerJoin', {
			id: ply.getID(),
			name: ply.getName(),
			color: ply.getColor(),
			address: ply.address
		});

	},

	onPlayerDisconnect: function(socket) {

		var ply = this.getByID(socket.id);
		if(!this.isValidPlayer(ply)) return;

		// Remove player buildings
		for(var i in ply.Buildings) {
			var building = ply.Buildings[i];
			building.Owner = -1;
			this.emit('BuildingReset', { id: building.Id, building: building.Building });

			delete building;
		}

		// Remove from player list
		var players = this.getPlayers();
		for(i in players) {
			var pl = players[i];
			if (pl.getID() == ply.getID()) {
				this.players.splice(i,1);
			}
		};

		// End server if empty
		if(!this._isValid()) {
			console.log('[' + this.id + '] Terminating server...');
			return this._shutdown();
		}

		// Announce player disconnect in chat
		this.emit('PlayerLeave', { id: ply.getID() });
		console.log('[' + this.id + '] Player disconnected');

		// Reassign owner in the case that the owner disconnects
		if(!this.hasValidOwner()) {
			this.setOwner(this.getPlayers()[0]);
		}

		// TODO: check if player held turn

		// Re-add color to available list
		this.colors.push(ply.getColor())

	},

	onPlayerChat: function(socket,data) {

		var ply = this.getByID(socket.id);
		if(!this.isValidPlayer(ply)) return;

		var text = data.text.substr(0, 127);

	    this.emit('PlayerChat', { id: ply.getID(), Text: text });
	    console.log('['+this.id+'] '+ply.getName()+': '+text);

	},

	onPlayerBuild: function(socket,data) {

		var ply = this.getByID(socket.id);
		if(!this.isValidPlayer(ply)) return;

		if((this.getState() != STATE_SETUP) && (this.getState() != STATE_PLAYING)) return;
		if(!ply.isTurn()) return;

		var ent = this.getEntById(data.id);
		if(!this.isValidEntity(ent)) return;
		if(!ent.canBuild(ply)) return;

		if(this.getState() == STATE_SETUP) {
			this.turnManager.handleSetupRequest(ply, ent);
		}

		if(this.getState() == STATE_PLAYING) {

			if(ent.hasOwner()) return;

		}

	},


	/* --------------------------------------------
		Game Hooks
	-------------------------------------------- */	
	onStartGame: function(socket,data) {

		if(this.getState() != STATE_WAITING) return;

		// Valid player and player is owner
		var ply = this.getByID(socket.id);
		if( (!this.isValidPlayer(ply)) || (this.getOwner() != ply.getID()) ) return;

		// Check if we have at least 2 players
		if(this.getNumPlayers() < 2) {
			ply.emit('GameUpdate', {
				error: true,
				message: "There must be 2 players in the game to start."
			});
			return;
		}

		this.turnManager.start();

	},

	onPlayerRequestAction: function(socket,data) {

		

	},

	syncGame: function(ply) {

		var game = ply.game,
			board = game.board;

		// Send tiles
		var tiles = [];
		for(var i=0; i < board.hexTiles.length; i++) {
			var tile = board.hexTiles[i];
			tiles.push({
				id: tile.getEntId(),
				pos: tile.getPosition(),
				resource: tile.getResource(),
				token: tile.getToken(),
				robber: tile.hasRobber()
			});
		};
		ply.emit('boardEntities', { name: 'HexTile', ents: tiles });

		// Send corners
		var corners = [];
		for(var i=0; i < board.hexCorners.length; i++) {
			var corner = board.hexCorners[i];
			corners.push({
				id: corner.getEntId(),
				pos: corner.getPosition()
			});
		};
		ply.emit('boardEntities', { name: 'HexCorner', ents: corners });

		// Send edges
		var edges = [];
		for(var i=0; i < board.hexEdges.length; i++) {
			var edge = board.hexEdges[i];
			edges.push({
				id: edge.getEntId(),
				pos: edge.getPosition(),
				ang: edge.getAngle()
			});
		};
		ply.emit('boardEntities', { name: 'HexEdge', ents: edges });

		// Send players
		var players = game.getPlayers();
		for(var i in players) {
			var pl = players[i];
			if(pl.getID() != ply.getID()) {
				ply.emit('syncPlayer', {
					id: pl.getID(),
					name: pl.getName(),
					color: pl.getColor(),
					address: pl.address
				});
			}
		}

	}

};

CATAN.GameCount = 0;