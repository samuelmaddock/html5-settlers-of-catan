/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
CATAN.Player = function(socket) {

	this.socket = socket;

	this.Id = socket.id;
	this.Address = socket.handshake.address;

	this.Name = "Player";

	this.Buildings = []

	/*this.Inventory = {
		Resources: new Array(NUM_RESOURCES),
		VP: 0
	}*/

};

CATAN.Player.prototype = {

	connect: function(game) {

		this.Game = game;

		// Make sure player is disconnected from previous game
		var socket = this.socket;
	    socket.get('gameid', function(err, id) {
	      var game = CATAN.getGameById(id);
	      if(typeof game !== 'undefined') {
	        game.onPlayerDisconnect(socket);
	      }
	    });

		socket.set('gameid', game.id)

	},

	getID: function() {
		return this.Id;
	},

	getName: function() {
		return this.Name;
	},
		
	getNumResource: function(RESOURCE_ENUM) {
		return ( this.Inventory.Resources[RESOURCE_ENUM] !== undefined ) ? this.Inventory.Resources[RESOURCE_ENUM] : 0;
	},

	hasResources: function(RESOURCE_ENUM, amount) {
		return this.getResource(RESOURCE_ENUM) >= amount;
	},

	giveResource: function(RESOURCE_ENUM, amount) {
		this.Inventory.Resources[RESOURCE_ENUM] += ( amount !== undefined ? amount : 1);
	},

	removeResource: function(RESOURCE_ENUM, amount) {
		this.Inventory.Resources[RESOURCE_ENUM] -= ( amount !== undefined ? amount : 1);
	},

	getBuildings: function() {
		return this.Buildings;
	},

	setOwnership: function(building) {
		building.Color = this.Color;
		this.Buildings.push(building);
	},

	hasOwnership: function(building) {
		for(i in this.Buildings) {
			var b = this.Buildings[i];
			if (b.Id == building.Id && b.Building == building.Building) {
				return true;
			};
		};
	}

}