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

	this.cellWidth = 5;
	this.cellHeight = 5;
	
	this.hexRadius = 64;

	this.hexTiles = [];
	this.hexCorners = [];
	this.hexEdges = [];

	this.robber = CATAN.ents.create('Robber');

	this.setup();

}

/* -----------------------------------------------
	Catan Board Setup

	Below is unoptimized prototype code, this
	should be fixed up later.
------------------------------------------------*/
CATAN.Board.prototype = {

	setup: function() {
		if(SERVER) {
			this.Schema = this.game.getSchema();
			this.Grid = this.game.getSchema().getGrid();
			this.resourceCount = this.Schema.getResources();
			this.numTokens = this.Schema.getNumberTokens();
		} else {
			this.Schema = CATAN.getSchema();
			this.Grid = CATAN.getSchema().getGrid();
		}

		// Update later for possible expansions?
		this.cellHeight = this.Grid.length;
		this.cellWidth = this.Grid[0].length;

		// Setup hex grid tiles
		for (y = 0; y < this.cellHeight; y++) {
			for (x = 0; x < this.cellWidth; x++) {
			
				var tile = this.Grid[y][x];
				
				if (tile != 0) { // Check if grid coordinate is valid
				
					tile = this.setupHexTile(x,y);
					this.hexTiles.push( tile );

					this.Grid[y][x] = tile;
					
				}
				
			}
		}

		// Create corner and edge entities
		var corners = [];
		var edges = [];
		for(var i in this.hexTiles) {
			
			var tile = this.hexTiles[i];
			
			// Get corner positions
			var positions = [
				tile.getCornerPosition(CORNER_L),
				tile.getCornerPosition(CORNER_TL),
				tile.getCornerPosition(CORNER_TR),
				tile.getCornerPosition(CORNER_R),
				tile.getCornerPosition(CORNER_BR),
				tile.getCornerPosition(CORNER_BL)
			];

			for(var j in positions) {
				
				var pos = positions[j]; // get corner vector
				var posStr = Math.floor(pos.x) + "," + Math.floor(pos.Y) + "," + Math.floor(pos.z); // hash string
				
				var corner;
				if (!corners[posStr]) { // create new corner entity
				
					corner = CATAN.ents.create('HexCorner');
					corner.setPosition(positions[j]);
					
					corners[posStr] = corner; // set reference for later
					
					this.hexCorners.push(corner);

					if(SERVER) {
						this.game.entities.push(corner);
					}
					
				} else { // duplicate corner
				
					corner = corners[posStr];
				
				}
				
				tile.AdjacentCorners.push(corner);
				corner.AdjacentTiles.push(tile);
				
			}

			// Get edge orientations
			var orientations = [
				tile.getEdgePosAng(EDGE_T),
				tile.getEdgePosAng(EDGE_TR),
				tile.getEdgePosAng(EDGE_BR),
				tile.getEdgePosAng(EDGE_B),
				tile.getEdgePosAng(EDGE_BL),
				tile.getEdgePosAng(EDGE_TL)
			];
			
			for(var j in orientations) {
				
				var pos = orientations[j].pos; // get edge vector
				var ang = orientations[j].ang; // get edge vector

				var posStr = Math.floor(pos.x) + "," + Math.floor(pos.Y) + "," + Math.floor(pos.z); // hash string
				
				var edge;
				if (!edges[posStr]) { // create new edge entity
				
					edge = CATAN.ents.create('HexEdge');
					edge.setPosition(orientations[j].pos);
					edge.setAngle(orientations[j].ang);
					
					edges[posStr] = edge; // set reference for later
					
					this.hexEdges.push(edge);

					if(SERVER) {
						this.game.entities.push(edge);
					}
					
				} else { // duplicate edge
				
					edge = edges[posStr];
				
				}
				
				tile.AdjacentEdges.push(edge);
				edge.AdjacentTiles.push(tile);
				
			}
			
		}
		delete corners;
		delete edges;

		// Establish adjacencies
		this.findAdjacentCorners()
		this.findAdjacentEdges()


		// Create docks

	},

	setupHexTile: function(x, y) {
		var offset = this.getWorldHexOffset()
		var tile = CATAN.ents.create('HexTile');
		tile.setGridIndex(x, y, this.hexRadius, offset);
		
		if(SERVER) {
			this.setupResource(tile);
			this.setupNumberToken(tile);
			this.game.entities.push(tile);
		}
		
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

	/* -----------------------------------------------
		CATAN.Board.prototype.setupNumberToken( HexTile )

		Desc: Assign number token to hex tile
	------------------------------------------------*/
	setupNumberToken: function(tile) {
		if(tile.Resource == RESOURCE_DESERT) return; // Desert doesn't have a number token
		var randToken = Math.floor( Math.random() * this.numTokens.length )
		tile.NumberToken = this.numTokens[randToken];
		this.numTokens.splice(randToken,1); // remove resource
	},

	findAdjacentCorners: function() {
		// for corners
		for(var i in this.hexCorners) {
		
			var c = this.hexCorners[i]; // get corner
			
			// Loop through all other corners
			for(var j in this.hexCorners) {
			
				var c2 = this.hexCorners[j]; // get corner to be compared
				
				if(c.getEntId() != c2.getEntId()) { // check for same corner
					
					var distance = Math.floor( c.position.distanceTo(c2.position) );
					
					if (distance <= this.hexRadius) { // if the distance is small enough, the corner is adjacent
						c.AdjacentCorners.push(c2);
					}
				
				}
			
			}

			// Loop through all edges
			for(var j in this.hexEdges) {
			
				var e = this.hexEdges[j]; // get edge to be compared
				var distance = Math.floor( c.position.distanceTo(e.position) );
				
				if (distance <= this.hexRadius) { // if the distance is small enough, the edge is adjacent
					c.AdjacentEdges.push(e);
					e.AdjacentCorners.push(c);
				}
			
			}
			
		}
	},

	findAdjacentEdges: function() {
		for(var i in this.hexEdges) {
		
			var e = this.hexEdges[i]; // get edge
			
			// Loop through all other corners
			for(var j in this.hexEdges) {
			
				var e2 = this.hexEdges[j]; // get edge to be compared
				
				if(e.getEntId() != e2.getEntId()) { // check for same edge

					var distance = Math.floor( e.position.distanceTo(e2.position) );

					if (distance <= this.hexRadius) { // if the distance is small enough, the edge is adjacent
						e.AdjacentEdges.push(e2);
					}
				
				}
			
			}

			// Loop through all edges
			for(var j in this.hexEdges) {
			
				var e2 = this.hexEdges[j]; // get edge to be compared
				var distance = Math.floor( e.position.distanceTo(e2.position) );
				
				if (distance <= this.hexRadius) { // if the distance is small enough, the edge is adjacent
					e.AdjacentEdges.push(e2);
				}
			
			}
			
		}
	},

	/* -----------------------------------------------
		CATAN.Board.prototype.getWorldHexOffset

		Desc: Returns the grid offset to center
		the board
	------------------------------------------------*/
	getWorldHexOffset: function() {
		var r = this.hexRadius,
		w = r * 2,
		h = r * Math.sqrt(3);
		
		return new THREE.Vector3( ( (this.cellWidth * w) - r ) / 2, 0, (this.cellHeight * h) / 2 );
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

	getRobber: function() {
		return this.robber;
	}

}