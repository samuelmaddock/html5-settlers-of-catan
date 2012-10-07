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

CATAN.Board = function() {
	
	CATAN.EntityCount = 0; // reset

	if(SERVER) {
		this.game = arguments[0];
	}
	
	this.hexRadius = 64;
	this.gridWidth = -1;
	this.gridHeight = -1;

	this.hexTiles = [];
	this.hexCorners = [];
	this.hexEdges = [];
	this.seaTiles = [];
	this.docks = [];

	this.tiles = [];

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

	getGridWidth: function() {
		return this.gridWidth;
	},

	getGridHeight: function() {
		return this.gridHeight;
	},

	setup: function() {
		if(SERVER) {
			this.schema = this.game.getSchema();
		} else {
			this.schema = CATAN.getSchema();
		}

		this.gridWidth = this.schema.getGridWidth();
		this.gridHeight = this.schema.getGridHeight();

		// Setup hex grid tiles
		for (y = 0; y < this.getGridHeight(); y++) {
			this.tiles[y] = [];
			for (x = 0; x < this.getGridWidth(); x++) {
				var tile = CATAN.ents.create('HexTile');
				tile.setGridIndex(x, y, this.hexRadius);
				tile.setTileType(TILE_INVALID);
				tile.board = this;

				this.setTile(x, y, tile);
				this.hexTiles.push(tile);
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
				var posStr = Math.round(pos.x) + "," + Math.round(pos.y) + "," + Math.round(pos.z); // hash string
				
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

				var posStr = Math.round(pos.x) + "," + Math.round(pos.y) + "," + Math.round(pos.z); // hash string
				
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

		// Find adjacent corners
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

		// Find adjacent edges
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

		if(SERVER) {
			this.schema.configureBoard(this);
		}

	},

	/* -----------------------------------------------
		CATAN.Board.prototype.getWorldHexOffset

		Desc: Returns the grid offset to center
		the board
	------------------------------------------------*/
	getWorldHexOffset: function() {
		var count = 0;
		var offset = new THREE.Vector3(0,0,0);

		for(var i in this.hexTiles) {
			var tile = this.hexTiles[i];
			if(tile.isLand()) {
				var pos = tile.getPosition();
				offset.x += pos.x;
				offset.y += pos.y;
				offset.z += pos.z;
				count++;
			}
		}

		offset.x = offset.x / count;
		offset.y = offset.y / count;
		offset.z = offset.z / count;

		return offset;
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