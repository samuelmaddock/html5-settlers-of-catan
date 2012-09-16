// Load schemas
require("fs").readdirSync("./html5-settlers-of-catan/shared/schemas").forEach(function(file) {
	require("../../shared/schemas/" + file);
});

require('../game.js');

CATAN.Games = (function(CATAN) {

	var module = {}

	/**
	 * Module Fields
	 */

	module.list = [];

	/**
	 * Module Methods
	 */

	module.getAll = function() {
		return this.list;
	}

	module.getVisible = function () {
		var list = [];
		var games = this.getAll();
		for(var i in games) {
			var game = games[i];
			if( (game.public == true) && (game.getState() == STATE_WAITING) ) {
				list.push( game.getStatus() );
			}
		}
		return list;
	}

	module.getById = function(id) {
		var games = this.getAll();
		for(var i in games) {
			var game = games[i];
			if(game.getID() == id) {
				return game;
			}
		}
	}

	module.getByName = function(name) {
		var games = this.getAll();
		for(var i in games) {
			var game = games[i];
			if(game.getName().indexOf(name) != -1) {
				return game;
			}
		}
	}

	module.getByNamespace = function(uri) {
		var games = this.getAll();
		for(var i in games) {
			var game = games[i];
			if(game.namespace === uri) {
				return game;
			}
		}
	}

	module.getListIndex = function(game) {
		var games = this.getAll();
		for(var i in games) {
			if(game.getID() == games[i].getID()) {
				return i;
			}
		}

		return -1;
	}

	module.getCount = function() {
		return this.list.length;
	}

	module.setup = function(ply, data) {
		var name = data.name.substr(0, 31),
			schema = data.schema.substr(0, 31);

		name = (name.length > 2) ? name : "Catan Server";

		// Create new game instance
		var game = new CATAN.Game(ply, name, schema, data.public);
		this.list.push(game);

		// Log in console
		console.log( '['+game.getID()+'][#'+this.getCount()+'] Server initialized...');

		// Alert server creater that the server is ready
		data.socket.emit('serverReady', { id: game.getID() });

		// Send lobby sockets info about new server
		if(game.isPublic()) {
			CATAN.Lobby.emit( 'serverStatus', { status: 'start', info: game.getStatus() } );
		}
	}

	module.shutdown = function(game) {
		console.log('[' + game.getID() + '] Terminating server...');

		if(game.isPublic()) {
			CATAN.Lobby.emit( 'serverStatus', { status: 'shutdown', info: { id: game.getID() } } );
		}

		var index = this.getListIndex(game);
		if(index != -1) {
			this.list.splice(index,1);
		} else {
			console.log("ERROR TERMINATING GAME!");
			delete game;
		}
	}

	return module;

}(CATAN));