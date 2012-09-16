/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
CATAN.Player = function() {

	this.name = "Settler";
	this.nameDup = 0;

	this.turn = false;
	this.buildings = [];

	if(SERVER) {

		this.status = PLAYER_LOBBY;

		this.Inventory = {
			Resources: []
		}

	}

};

CATAN.Player.prototype = {

	getID: function() {
		return this.id;
	},

	setName: function(name) {
		// Cleanse name
		this.name = name.substr(0, 31);
		if(SERVER) {
			this.socket.set('name', this.name);
		}
	},

	getName: function() {
		return (this.nameDup > 0) ? this.name + '('+this.nameDup+')' : this.name;
	},

	setColor: function(color) {
		this.color = color;
	},

	getColor: function() {
		return this.color;
	},

	getColorHex: function() {
		var x=this.color.toString(16);
		var y=(6-x.length);
		var z="000000";
		var z1 = z.substring(0,y);
		return "#" + z1 + x;
	},

	setTurn: function(bTurn) {
		this.turn = bTurn;
	},

	isTurn: function() {
		return this.turn;
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
		return this.buildings;
	},

	setOwnership: function(building) {
		building.Color = this.Color;
		this.buildings.push(building);
	},

	isOwner: function(ent) {
		return ( ent.hasOwner() && ent.getOwner() == this.getID() );
		/*for(i in this.buildings) {
			var b = this.buildings[i];
			if (b.getEntId() == building.getEntId() && b.Building == building.Building) {
				return true;
			};
		};*/
	}

}

if(SERVER) {
	require('../server/player.js');
}