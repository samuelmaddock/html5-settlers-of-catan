/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
CATAN.Player = function() {

	this.name = "Settler";
	this.nameDup = 0;

	this.turn = false;
	this.buildings = [];
	this.vp = 0;

	this.Inventory = {
		Resources: [0,0,0,0,0,0]
	}

	if(SERVER) {

		this.status = PLAYER_LOBBY;
		this.hasRolledDice = false;
		this.mustMoveRobber = false;
		this.tempResources = [];

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
		if(SERVER) {
			this.hasRolledDice = false;
		}
	},

	isTurn: function() {
		return this.turn;
	},
	
	addVictoryPoint: function() {
		this.vp += 1;
	},
	
	getNumResource: function(resourceType) {
		return ( this.Inventory.Resources[resourceType] !== undefined ) ? this.Inventory.Resources[resourceType] : 0;
	},

	hasResources: function(resourceType, amount) {
		return this.getNumResource(resourceType) >= amount;
	},

	giveResource: function(resourceType, amount) {
		amount = (amount == undefined) ? 1 : Math.abs(amount);
		this.Inventory.Resources[resourceType] += amount;
	},

	removeResource: function(resourceType, amount) {
		amount = (amount == undefined) ? 1 : Math.abs(amount);
		this.Inventory.Resources[resourceType] -= ( amount !== undefined ? amount : 1);
	},

	getBuildings: function() {
		return this.buildings;
	},

	getNumBuildings: function(buildingType) {
		var buildings;
		if(buildingType == undefined) {
			buildings = this.getBuildings();
		} else {
			buildings = this.getBuildingsByType(buildingType);
		}

		return buildings.length;
	},

	getBuildingsByType: function(buildingType) {
		var list = [];
		var buildings = this.getBuildings();
		for(var i in buildings) {
			if(buildings[i].getType() == buildingType) {
				list.push(buildings[i]);
			}
		}
		return list;
	},

	getCorners: function() {
		var list = [];
		var buildings = this.getBuildings();
		for(var i in buildings) {
			if( (buildings[i].getType() == BUILDING_SETTLEMENT) ||
				(buildings[i].getType() == BUILDING_CITY) ) {
				list.push(buildings[i]);
			}
		}
		return list;
	},

	setOwnership: function(building) {
		this.buildings.push(building);
	},

	isOwner: function(ent) {
		return ( ent.hasOwner() && ent.getOwner() == this );
	}

}

if(SERVER) {
	require('../server/player.js');
}