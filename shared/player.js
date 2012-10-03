/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
CATAN.Player = function() {

	this.name = "Settler";
	this.nameDup = 0;

	this.turn = false;
	this.buildings = [];
	this.victoryPoints = 0;

	this.resources = [0,0,0,0,0,0];
	this.devCards = [];

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

	/*
		Name
	*/
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

	/*
		Color
	*/
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

	/*
		Turn
	*/
	setTurn: function(bTurn) {
		this.turn = bTurn;
		if(SERVER) {
			this.hasRolledDice = false;
		}
	},

	isTurn: function() {
		return this.turn;
	},
	
	/*
		Victory Points
	*/
	addVictoryPoint: function() {
		this.victoryPoints += 1;
	},

	getVictoryPoints: function() {
		return this.victoryPoints;
	},
	
	/*
		Resources
	*/
	getNumResource: function(resourceType) {
		return ( this.resources[resourceType] !== undefined ) ? this.resources[resourceType] : 0;
	},

	hasResources: function(resourceType, amount) {
		return this.getNumResource(resourceType) >= amount;
	},

	giveResource: function(resourceType, amount) {
		amount = (amount == undefined) ? 1 : Math.abs(amount);
		this.resources[resourceType] += amount;
	},

	removeResource: function(resourceType, amount) {
		amount = (amount == undefined) ? 1 : Math.abs(amount);
		this.resources[resourceType] -= ( amount !== undefined ? amount : 1);
	},

	/*
		Development Cards
	*/
	addDevCard: function(cardType) {
		if(this.getDevCards(cardType) == undefined) {
			this.devCards[cardType] = 1;
		} else {
			this.devCards[cardType] += 1;
		}

		if(SERVER) {
			this.emit('CDevCardGet', {
				type: cardType
			});
		}
	},

	getDevCards: function(cardType) {
		return this.devCards[cardType];
	},

	hasDevCard: function(cardType) {
		if(this.getDevCards(cardType) == undefined) {
			return false;
		}
		return this.getDevCards(cardType) > 0;
	},

	useDevCard: function(cardType) {
		if(!this.hasDevCard(cardType)) return;
		this.devCards[cardType] -= 1;

		if(SERVER) {
			this.emit('CDevCardUse', {
				type: cardType
			});
		}
	},

	/*
		Buildings
	*/
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
	},

	isInSetup: function() {
		return this.getCorners().length < 2;
	}

}

if(SERVER) {
	require('../server/player.js');
}