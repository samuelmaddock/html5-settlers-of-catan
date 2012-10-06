/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

if(SERVER) {
	THREE = require('../server/vector.js');

	// Require necessary entities
	require('./entities/BaseEntity.js');
	require('./entities/HexTile.js');
	require('./entities/HexCorner.js');
	require('./entities/HexEdge.js');
	require('./entities/Robber.js');
}

CATAN.Board = function(game) {
	
	CATAN.EntityCount = 0; // reset

	this.game = game;
	
	this.hexRadius = 64;

	this.seaTiles = [];
	this.hexTiles = [];
	this.hexCorners = [];
	this.hexEdges = [];
	this.docks = [];

	this.tiles = null;
	this.corners = null;
	this.edges = null;

	this.robber = CATAN.ents.create('Robber');

	this.setup();

}

/* -----------------------------------------------
	Catan Board Setup

	Below is unoptimized prototype code, this
	should be fixed up later.
------------------------------------------------*/
CATAN.Board.prototype = {

	setTile: function(x, y, value) {
		this.tiles[y][x] = value;
	},

	getTile: function(x, y) {
		if( (x < 0) || (y < 0) || (x > this.getGridWidth()-1) ||
			(y > this.getGridHeight()-1) ) {
			return undefined;
		}
		return this.tiles[y][x];
	},

	getCorner: function(x, y) {
		/*if( (x < 0) || (y < 0) || (x > this.getGridWidth()-1) ||
			(y > this.getGridHeight()-1) ) {
			return undefined;
		}*/
		return this.corners[y][x];
	},

	getGridWidth: function() {
		return this.tiles[0].length;
	},

	getGridHeight: function() {
		return this.tiles.length;
	},

	setup: function() {
		if(SERVER) {
			this.Schema = this.game.getSchema();
			this.tiles = this.game.getSchema().getGrid();
			this.resourceCount = this.Schema.getResources();
			this.numTokens = this.Schema.getNumberTokens();
		} else {
			this.Schema = CATAN.getSchema();
			this.tiles = CATAN.getSchema().getGrid();
		}

		// Setup hex grid tiles
		for (y = 0; y < this.getGridHeight(); y++) {
			for (x = 0; x < this.getGridWidth(); x++) {
			
				var tile = this.getTile(x, y);
				
				if (tile == TILE_LAND) { // Check if grid coordinate is valid
				
					tile = this.setupTile(x, y, TILE_LAND);
					this.hexTiles.push(tile);

					this.setTile(x, y, tile);

					if(SERVER) {
						this.setupResource(tile);
						this.setupNumberToken(tile);
						this.game.entities.push(tile);
					}

				} else if (tile == TILE_SEA) {

					tile = this.setupTile(x, y, TILE_SEA);
					this.seaTiles.push(tile);

					this.setTile(x, y, tile);

				}
				
			}
		}

		// Initialize vertex arrays
		this.corners = new Array( 2*this.getGridHeight() + 2 );
		for (var y = 0; y < this.corners.length; y++) {
			this.corners[y] = [];
		}

		if(SERVER) return;

		// Create corner entities
		for(var y = 0; y < this.getGridHeight(); y++) {
			for(var x = 0; x < this.getGridWidth(); x++) {
				var i = x;
				var j;
				if(x % 2 == 0) {
					j = 2*y;
				} else {
					j = (2*y) + 1;
				}

				this.setupCorner(i, j);
				this.setupCorner(i+1, j);
				this.setupCorner(i+1, j+1);
				this.setupCorner(i+1, j+2);
				this.setupCorner(i, j+2);
				this.setupCorner(i, j+1);
			}
		}

	},

	setupCorner: function(i, j) {
		if(this.corners[j][i] != undefined) {
			return;
		}
		var c = CATAN.ents.create('HexCorner');
		c.x = i;
		c.y = j;
		c.board = this;

		var r = this.hexRadius,		// radius
			w = r * 2,				// width
			h = r * Math.sqrt(3),	// height
			s = r * 3 / 2;			// side

		var vx = i * s,
			vz = j * (h/2)

		if( (i % 2 == 1) && (j % 2 == 1) ||
			(i % 2 == 0) && (j % 2 == 0) ) {
			vx += (w-s);
		}

		// Set corner position
		c.setPosition(
			vx,
			0,
			vz
		);

		this.hexCorners.push(c);
		this.corners[j][i] = c;
	},

	setupTile: function(x, y, type) {
		var tile = CATAN.ents.create('HexTile');
		tile.setTileType(type);

		tile.board = this;
		tile.x = x;
		tile.y = y;

		var r = this.hexRadius,		// radius
			w = r * 2,				// width
			h = r * Math.sqrt(3),	// height
			s = r * 3 / 2;			// side

		tile.setPosition(
			x * s,
			0,
			(y * h) + (x % 2) * (h / 2)
		);

		return tile;
	},

	setupResource: function(tile) {
		// Get random possible key
		var randResource = Math.floor( Math.random() * this.resourceCount.length )
		
		// Select resource
		tile.setResource( this.resourceCount[randResource] );
		this.resourceCount.splice(randResource,1); // remove resource

		// Setup robber if the resource is desert
		if (tile.getResource() == RESOURCE_DESERT) {
			this.robber.setTile(tile);
		}
	},

	setupNumberToken: function(tile) {
		if(tile.Resource == RESOURCE_DESERT) return; // Desert doesn't have a number token
		var randToken = Math.floor( Math.random() * this.numTokens.length )
		tile.NumberToken = this.numTokens[randToken];
		this.numTokens.splice(randToken,1); // remove resource
	},

	getWorldHexOffset: function() {
		var list = [];

		for(var i in this.hexTiles) {
			if(this.hexTiles[i].isLand()) {
				list.push(this.hexTiles[i].getPosition());
			}
		}

		var x = 0,
			y = 0,
			z = 0;

		for(var i in list) {
			x += list[i].x;
			y += list[i].y;
			z += list[i].z;
		}
		
		return new THREE.Vector3(
			x / list.length,
			y / list.length,
			z / list.length
		);
	},

	getTiles: function() {
		return this.hexTiles;
	},

	getCorners: function() {
		return this.hexCorners;
	},

	getEdges: function() {
		return this.hexEdges;
	},

	getDocks: function() {
		return this.docks;
	},

	getRobber: function() {
		return this.robber;
	}

}