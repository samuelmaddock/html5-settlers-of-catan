/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

CATAN.Player.prototype.connect = function(game, socket) {

	this.game = game;
	socket.set('gameid', game.id);

	this.id = socket.id;
	this.socket = socket;
	this.address = socket.handshake.address;

	// Set game name
	var self = this;
	socket.get('name', function(err, name) {
      self.name = name;
    });

	// Make sure player is disconnected from previous game
	var socket = this.socket;
    socket.get('gameid', function(err, id) {
      var game = CATAN.getGameById(id);
      if(typeof game !== 'undefined') {
        game.onPlayerDisconnect(socket);
      }
    });

	// Assign random player color for now;
	this.color = game.getColor();

};

CATAN.Player.prototype.emit = function(name,data) {
	this.socket.emit(name,data);
};

CATAN.Player.prototype.getBuildingsByType = function(type) {
	var ents = [];
	for(i in this.buildings) {
		if (this.buildings[i].Building == type) {
			ents.push(this.buildings[i]);
		};
	};
	return ents;
}