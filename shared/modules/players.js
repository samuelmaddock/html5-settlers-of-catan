if(SERVER) {
	require('../player.js');
}

CATAN.Players = (function(CATAN) {

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

	module.getById = function(id) {
		var players = this.getAll();
		for(var i in players) {
			var ply = players[i];
			if(ply.getID() == id) {
				return ply;
			}
		}
	}

	module.getBySocket = function(socket) {
		return this.getById(socket.id);
	}

	module.getByName = function(name) {
		var players = this.getAll();
		for(var i in players) {
			var ply = players[i];
			if(ply.getName().indexOf(name) != -1) {
				return ply;
			}
		}
	}

	module.getListIndex = function(ply) {
		var players = this.getAll();
		for(var i in players) {
			if(ply.getID() == players[i].getID()) {
				return i;
			}
		}

		return -1;
	}

	module.getCount = function() {
		return this.list.length;
	}

	module.connect = function(data) {
		var ply = new CATAN.Player();
		this.list.push(ply);

		if(SERVER) {
			// Data is socket
			ply.setSocket(data, true);
		} else {
			ply.id = data.id;
			ply.setName(data.name);
			ply.setColor(data.color);

			if(ply.id == CATAN.server.socket.sessionid) {
				CATAN.LocalPlayer = ply;
			} else if(data.newply) {
				CATAN.chat.AddLine( T('PlayerConnect', ply.getName()) );
			}

			CATAN.Game.players.refresh();
		}

		return ply;
	}

	module.disconnect = function(ply) {
		var index = this.getListIndex(ply);
		if(index != -1) {
			this.list.splice(index,1);
		} else {
			console.log("[MAIN] ERROR DISCONNECTING PLAYER!");
		}

		if(CLIENT) {
			CATAN.Game.players.refresh();
		}
	}

	return module;

}(CATAN));