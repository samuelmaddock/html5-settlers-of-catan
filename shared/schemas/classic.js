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

var GAMEMODE = {};

GAMEMODE.Resources = [
	
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
		name: "Wool",
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

GAMEMODE.Buildings = [
	
	/*
		name		Building name
		url			Model path
		pieces		Maximum amount of pieces per player
		cost		Resource cost according to order in enums
	*/

	{
		name: "Road",
		url: "models/road.js",
		pieces: 15,
		cost: [ 0, 1, 1, 0, 0, 0 ] // use resource enums
	},
	
	{
		name: "Settlement",
		url: "models/settlement.js",
		pieces: 5,
		cost: [ 0, 1, 1, 1, 1, 0 ]
	},
	
	{
		name: "City",
		url: "models/settlement.js",
		pieces: 4,
		cost: [ 0, 0, 0, 0, 2, 3 ]
	}
	
];

GAMEMODE.Robber = {
	name: "Robber",
	url: "models/robber.js"
};

GAMEMODE.DevCardCost = [ 0, 0, 0, 1, 1, 1 ]
GAMEMODE.DevCards = [
	
	// Year of Plenty
	{
		url: "materials/cards/yearofplenty.png"
	},
	
	// Road Building
	{
		url: "materials/cards/roadbuilding.png"
	},
	
	// Monopoly
	{
		url: "materials/cards/monopoly.png"
	},
	
	// Knight
	{
		url: "materials/cards/knight.png",
		count: 14
	}
	
];

GAMEMODE.SpecialCards = [
	
	// Largest Army
	{
		url: "materials/special/largestarmy.png"
	},
	
	// Longest Road
	{
		url: "materials/special/longestroad.png"
	}
	
];

GAMEMODE.getGridWidth = function() {
	return 7;
}

GAMEMODE.getGridHeight = function() {
	return 7;
}

if(SERVER) {

	GAMEMODE.MaxPlayers = 4;

	/* -----------------------------------------------
		Board
	------------------------------------------------*/

	GAMEMODE.NumDocks = 9;

	// 0 = Invalid
	// 1 = Land (resources)
	// 2 = Sea
	GAMEMODE.Grid = [
		[0,0,0,2,0,0,0],
		[0,2,2,1,2,2,0],
		[2,1,1,1,1,1,2],
		[2,1,1,1,1,1,2],
		[2,1,1,1,1,1,2],
		[2,2,1,1,1,2,2],
		[0,0,2,2,2,0,0]
	];

	// [x,y] coordinates for docks
	GAMEMODE.DockConfigs = [
		[
			[3,0], [1,1], [5,1],
			[0,3], [6,3], [0,5],
			[6,5], [2,6], [4,6]
		],
		[
			[2,1], [4,1], [0,2],
			[6,2], [0,4], [6,4],
			[1,5], [5,5], [3,6]
		]
	];

	GAMEMODE.configureBoard = function(board) {
		board.resources = this.getResources();
		board.tokens = this.getNumberTokens();

		// Setup hex grid tiles
		for (y = 0; y < board.getGridHeight(); y++) {
			for (x = 0; x < board.getGridWidth(); x++) {
			
				var tile = board.getTile(x, y);
				var gridTile = this.Grid[y][x];

				if (gridTile == TILE_LAND) {
				
					tile.setTileType(TILE_LAND);

					// Setup resource
					var randResource = Math.floor( Math.random() * board.resources.length )
					tile.setResource( board.resources[randResource] );
					board.resources.splice(randResource,1); // remove resource

					// Setup number token
					if(tile.getResource() != RESOURCE_DESERT) {
						var randToken = Math.floor( Math.random() * board.tokens.length )
						tile.setToken( board.tokens[randToken] );
						board.tokens.splice(randToken,1); // remove resource
					} else {
						// Setup robber if the resource is desert
						board.robber.setTile(tile);
					}

					board.game.entities.push(tile);

				} else if (gridTile == TILE_SEA) {

					tile.setTileType(TILE_SEA);
					board.seaTiles.push(tile);

				}
				
			}
		}

		delete board.resources;
		delete board.tokens;

		// Setup docks
		var dockConfig = this.DockConfigs[Math.floor(Math.random()*this.DockConfigs.length)]
		for(var i in dockConfig) {
			var xy = dockConfig[i];
			var tile = board.getTile(xy[0], xy[1]);
			var adjTiles = tile.getAdjacentTiles();
			for(var j in adjTiles) {
				var adjTile = adjTiles[j];
				if(adjTile.isLand()) {
					tile.setDock(adjTile);
					board.docks.push(tile);
					break;
				}
			}
		}
	}

	GAMEMODE.getResources = function() {

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

	GAMEMODE.getNumberTokens = function() {
		return [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];
	}

	GAMEMODE.getColors = function() {
		return [
			0x2BB1CC,	// blue 
			0x259C31,	// green
			0xCC332B,	// red
			0x912BCC	// purple
		];
	}

	/* -----------------------------------------------
		Development Cards
	------------------------------------------------*/
	GAMEMODE.getDevCard = function() {
		return this.DevCards[Math.floor(Math.random()*this.DevCards.length)];
	}

	/* -----------------------------------------------
		Gamemode Rules
	------------------------------------------------*/
	GAMEMODE.canPlayerPurchaseBuilding = function(ply, ent) {
		var type = ent.getType();
		if(ent.hasOwner()) {
			if(ent.getOwner() != ply) return false;

			// Change requested type to city
			if((ent.getOwner() == ply) && ent.isSettlement()) {
				type = BUILDING_CITY;
			}
		}

		var building = this.Buildings[type];

		// Do they have the necessary resources?
		var cost = building.cost;
		for(res in cost) {
			var amount = cost[res];
			if(!ply.hasResources(res, amount)) {
				ply.notify('InsufficientResources');
				return false;
			};
		};

		// Do they have too many of that structure?
		var pieces = building.pieces;
		if(ply.getNumBuildings(type) >= pieces) {
			ply.notify('InsufficientPieces'+type);
			return false;
		}

		return true;
	}

	GAMEMODE.canPlayerPurchaseDevCard = function(ply) {
		var cost = this.DevCardCost;
		for(res in cost) {
			var amount = cost[res];
			if(!ply.hasResources(res, amount)) {
				ply.notify('InsufficientResources');
				return false;
			};
		};

		return true;
	}

	GAMEMODE.canPlayerTrade = function(ply, ply2) {
		if(!ply.isTurn()) {
			ply.notify("TradeNotTurn");
		}
	}

	GAMEMODE.onPlayerRoll = function(ply, d1, d2) {
		var n = d1 + d2;

		if(n == 7) {
			this.onPlayerRollSeven(ply);
		};
	};

	GAMEMODE.onPlayerRollSeven = function(ply) {
		// TODO: Each player who owns more than
		// 7 Resource Cards must return half of
		// his cards to the supply stacks. If
		// someone has an uneven number of cards,
		// it is previously rounded down
		
		// enable move robber
		ply.mustMoveRobber = true;
	};

	GAMEMODE.onPlayerScore = function(ply) {
		if (ply.getVictoryPoints() >= 10) {
			if (ply.isTurn()) {
				ply.game.endGame(ply);
			} else {
				ply.notify("TenVPNotTurn");
			}
		}
	};

	// Player has built structure
	GAMEMODE.onPlayerBuild = function(ply, ent, bSetup) {
		// Only remove resources in playing state
		if(!bSetup) {
			var cost = this.Buildings[ent.getType()].cost;
			for(i in cost) {
				ply.removeResource(i, cost[i]);
			};
		}
		
		if (ent.isRoad()) {

			// Only check for longest road if the player
			// has the minimum amount of roads
			// if(ply.getRoads().length < 7) return;

			// check longest road
			// var roads = this.checkLongestRoad(ply, ent, []);

		} else if (ent.isSettlement() || ent.isCity()) {

			ply.addVictoryPoint();
			this.onPlayerScore(ply);

		}
	};

	// Player has built structure
	GAMEMODE.onPlayerGetDevCard = function(ply) {
		var cost = this.DevCardCost;
		for(i in cost) {
			ply.removeResource(i, cost[i]);
		};
	};

	GAMEMODE.checkLongestRoad = function(ply, road, traversed) {

		// Road's owner must be ply
		if(!road.getOwner()) return;
		if(road.getOwner() != ply) return;

		// Make sure we haven't already traversed this road
		if(traversed.indexOf(road.getEntId()) != -1) return;

		// Keep track of traversed roads
		traversed.push(road.getEntId());

		// Recursively walk all neighboring roads
		var adjRoads = road.getAdjacentEdges();
		for(var i in adjRoads) {
			var newCount = this.checkLongestRoad(ply, adjRoads[i], a);
			count = (newCount > count) ? newCount : count;
		}

		return count;

	}

}

CATAN.Schemas.register("Classic", GAMEMODE);