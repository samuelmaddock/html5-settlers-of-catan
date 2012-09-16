/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

/*
	Networking Methods
*/
CATAN.Player.prototype.getSocket = function() {
	return this.socket;
}

CATAN.Player.prototype.setSocket = function(socket) {
	this.id = socket.id;
	this.socket = socket;

	var self = this;
	this.on('disconnect', function() { self.disconnect() });
}

CATAN.Player.prototype.connect = function(game, socket) {

	// TODO: Remove socket initializing here
	this.id = socket.id;
	this.socket = socket;
	this.address = socket.handshake.address;

	// Set game name
	var self = this;
	socket.get('name', function(err, name) {
		self.name = (name !== null) ? name : "Settler";
	});

	// Make sure player is disconnected from previous game
	var socket = this.socket;
	socket.get('gameid', function(err, id) {
		var game = CATAN.Games.getById(id);
		if(typeof game !== 'undefined') {
			game.onPlayerDisconnect(socket);
		}
	});

	// Reference current game
	this.game = game;
	socket.set('gameid', game.id);

	// Assign random player color for now;
	this.setColor(game.getColor());

	this.setStatus(PLAYER_JOINING);

};

CATAN.Player.prototype.disconnect = function() {
	CATAN.Players.disconnect(this);

	// Disconnect isn't called on namespace
	var self = this;
	this.getSocket().get('gameid', function(err, id) {
		var game = CATAN.Games.getById(id);
		if(typeof game !== 'undefined') {
			game.onPlayerDisconnect(self);
		}
	});
}

CATAN.Player.prototype.on = function(name,func) {
	this.socket.on(name,func);
}

CATAN.Player.prototype.emit = function(name,data) {
	this.socket.emit(name,data);
};

CATAN.Player.prototype.getIP = function() {
	return this.socket.handshake.address.address +
	 ":" + this.socket.handshake.address.port;
}

CATAN.Player.prototype.getStatus = function() {
	return this.status;
}

CATAN.Player.prototype.setStatus = function(state) {
	this.status = state;
}

/*
	Game Methods
*/
CATAN.Player.prototype.isInGame = function() {
	return this.getStatus() == PLAYER_CONNECTED;
}

CATAN.Player.prototype.getBuildingsByType = function(type) {
	var ents = [];
	for(i in this.buildings) {
		if (this.buildings[i].Building == type) {
			ents.push(this.buildings[i]);
		};
	};
	return ents;
}