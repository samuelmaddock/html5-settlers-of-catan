if(CLIENT) {
	CATAN.AssetManager.queue([
		"materials/models/tile/desert.png",
		"materials/models/tile/forest.png",
		"materials/models/tile/hills.png",
		"materials/models/tile/pastures.png",
		"materials/models/tile/field.png",
		"materials/models/tile/mountains.png",

		/*"materials/cards/yearofplenty.png",
		"materials/cards/roadbuilding.png",
		"materials/cards/monopoly.png",
		"materials/cards/knight.png",

		"materials/special/largestarmy.png",
		"materials/special/longestroad.png",*/

		"models/tile.js",
		"models/road.js",
		"models/settlement.js",
		"models/city.js",
		"models/robber.js"
	]);
}

var Classic = {};

Classic.Resources = [
	
	{
		name: "Desert",
		url: "models/tile.js",
		mat: "materials/models/tile/desert.png",
		color: 0xE8E67D
	},
	
	{
		name: "Lumber",
		url: "models/tile.js",
		mat: "materials/models/tile/forest.png",
		color: 0x7A6400
	},
	
	{
		name: "Brick",
		url: "models/tile.js",
		mat: "materials/models/tile/hills.png",
		color: 0xCC1B1B
	},
	
	{
		name: "Sheep",
		url: "models/tile.js",
		mat: "materials/models/tile/pastures.png",
		color: 0x55E076
	},
	
	{
		name: "Grain",
		url: "models/tile.js",
		mat: "materials/models/tile/field.png",
		color: 0xC2AF25
	},
	
	{
		name: "Ore",
		url: "models/tile.js",
		mat: "materials/models/tile/mountains.png",
		color: 0x878787
	}
		
];

Classic.Buildings = [
	
	{
		name: "Road",
		url: "models/road.js",
		cost: [ 0, 1, 1, 0, 0, 0 ] // use resource enums
	},
	
	{
		name: "Settlement",
		url: "models/settlement.js",
		cost: [ 0, 1, 1, 1, 1, 0 ]
	},
	
	{
		name: "City",
		url: "models/city.js",
		cost: [ 0, 0, 0, 0, 2, 3 ]
	}
	
];

Classic.Robber = {
	name: "Robber",
	url: "models/robber.js"
};

Classic.CardCost = [ 0, 0, 0, 1, 1, 1 ]
Classic.Cards = [
	
	{
		name: "Year of Plenty",
		url: "materials/cards/yearofplenty.png"
	},
	
	{
		name: "Road Building",
		url: "materials/cards/roadbuilding.png"
	},
	
	{
		name: "Monopoly",
		url: "materials/cards/monopoly.png"
	},
	
	{
		name: "Knight",
		url: "materials/cards/knight.png"
	}
	
];

Classic.Special = [
	
	{
		name: "Largest Army",
		url: "materials/special/largestarmy.png"
	},
	
	{
		name: "Longest Road",
		url: "materials/special/longestroad.png"
	}
	
];

if(SERVER) {

	Classic.MaxPlayers = 4;

	// Default Catan Board Arrangement
	// 0 = No tile
	// 1 = Resource
	// 2 = Dock?
	Classic.getGrid = function() {
		return [[0,1,1,1,0],
				[1,1,1,1,1],
				[1,1,1,1,1],
				[1,1,1,1,1],
				[0,0,1,0,0]]
	}

	Classic.getResources = function() {

		resources = [RESOURCE_DESERT];
		for(var i=0; i < 4; i++) {
			resources.push(RESOURCE_LUMBER);
			resources.push(RESOURCE_SHEEP);
			resources.push(RESOURCE_GRAIN);
		}
		for(var i=0; i < 3; i++) {
			resources.push(RESOURCE_BRICK);
			resources.push(RESOURCE_ORE);
		}

		return resources;

	}

	Classic.getNumberTokens = function() {
		return [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];
	}

	Classic.getColors = function() {
		return [
			0x2BB1CC, // blue 
			0x259C31, // green
			0xCC332B, // red
			0x912BCC // purple
		];
	}

	/* -----------------------------------------------
		Gametype Rules
	------------------------------------------------*/
	Classic.OnRoll = function(d1,d2) {

		var num = d1 + d2;

		if(num == 7) {
			this.OnRollSeven();
		};

	};

	Classic.OnRollSeven = function() {
		// enable move robber
	};

	Classic.OnPlayerScore = function(ply) {
		// check score for win
	};

	Classic.OnPlayerPurchase = function(ply, building) {

		// CanPlayerPurchase?
		var cost = this.Buildings[building];
		for(res in cost) {
			var amount = cost[res];
			if(ply.hasResources(res, amount)) {
				ply.removeResource(res, amount);
			} else {
				return; // not enough resources
			};
		};

	};

	Classic.OnPlayerSetBuilding = function(ply, building) {
		// check building type vs road distance
	};

	/*
		
		OnRoll(num)


	*/

}

CATAN.Schemas["Classic"] = Classic;