/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

THREE = require('../server/vector.js');
require('./Entity.js');
require('./HexTile.js');
require('./HexCorner.js');
require('./HexEdge.js');

CATAN.Board = function(game) {
	
	this.game = game;

	this.cellWidth = 5;
	this.cellHeight = 5;
	
	this.hexRadius = 64;

	this.hexTiles = [];
	this.hexCorners = [];
	this.hexEdges = [];

	this.ownedBuildings = [];
	
	this.robber = undefined;

	this.setup();
	
}

CATAN.Board.prototype.clearBoard = function() {

	// Remove geometry
	if (CLIENT) {

		for(var i in this.hexTiles) {
			this.hexTiles[i].remove()
		}

		for(var i in this.hexCorners) {
			this.hexCorners[i].remove()
		}

		for(var i in this.hexEdges) {
			this.hexEdges[i].remove()
		}

	}

	this.hexTiles = [];
	this.hexCorners = [];
	delete this.robber;

}

/* -----------------------------------------------
	Catan Board Setup
------------------------------------------------*/
CATAN.Board.prototype.setup = function() {

	this.clearBoard()

	this.Schema = this.game.getSchema();
	this.Grid = this.game.getSchema().getGrid();
	this.resourceCount = this.Schema.getResources();
	this.numTokens = this.Schema.getNumberTokens();

	// Update later for possible expansions?
	this.cellHeight = this.Grid.length;
	this.cellWidth = this.Grid[0].length;

	// Setup hex grid tiles
	for (y = 0; y < this.cellHeight; y++) {
		for (x = 0; x < this.cellWidth; x++) {
		
			var tile = this.Grid[y][x];
			
			if (tile != 0) { // Check if grid coordinate is valid
			
				tile = this.setupHexTile(x,y);
				this.setupResource(tile);
				this.setupNumberToken(tile);
	
				if (CLIENT) tile.setupMesh();
				
				this.hexTiles.push( tile );
				
			}
			
		}
	}
	
	// Create corner entities
	var corners = [];
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
		]
		
		for(var j in positions) {
			
			var pos = positions[j]; // get corner vector
			var posStr = Math.floor(pos.x) + "," + Math.floor(pos.Y) + "," + Math.floor(pos.z); // hash string
			
			var corner;
			if (!corners[posStr]) { // create new corner entity
			
				corner = new HexCorner();
				corner.setup( positions[j] );
				corner.Id = this.hexCorners.length + 1; // unique Id
				
				corners[posStr] = corner; // set reference for later
				
				tile.corners.push( corner );
				this.hexCorners.push( corner );
				
			} else { // duplicate corner
			
				corner = corners[posStr];
			
			}
			
			tile.corners.push( corner ); 
			
		}
		
	}
	delete corners;
	
	// Create roads
	var edges = [];
	for(var i in this.hexTiles) {
		
		var tile = this.hexTiles[i];
		
		// Get edge positions
		var orientations = [
			tile.getEdgePosAng(EDGE_T),
			tile.getEdgePosAng(EDGE_TR),
			tile.getEdgePosAng(EDGE_BR),
			tile.getEdgePosAng(EDGE_B),
			tile.getEdgePosAng(EDGE_BL),
			tile.getEdgePosAng(EDGE_TL)
		]
		
		for(var j in orientations) {
			
			var pos = orientations[j].pos; // get edge vector
			var ang = orientations[j].ang; // get edge vector

			var posStr = Math.floor(pos.x) + "," + Math.floor(pos.Y) + "," + Math.floor(pos.z); // hash string
			
			var edge;
			if (!edges[posStr]) { // create new edge entity
			
				edge = new HexEdge();
				edge.Id = this.hexEdges.length + 1; // unique Id

				edge.setup( orientations[j] );
				
				edges[posStr] = edge; // set reference for later
				
				tile.edges.push( edge );
				this.hexEdges.push( edge );
				
			} else { // duplicate edge
			
				edge = edges[posStr];
			
			}
			
			tile.edges.push( edge ); 
			
		}
		
	}
	delete edges;

	// Establish adjacencies
	if (SERVER) {
		this.findAdjacentCorners()
		this.findAdjacentEdges()
	}


	// Create docks

}

CATAN.Board.prototype.setupHexTile = function(x,y) {

	// Create new HexGridCell object
	var offset = this.getWorldHexOffset()
	var hexTile = new CATAN.HexTile(this.hexRadius);
	hexTile.Id = this.hexTiles.length + 1;
	hexTile.setGridIndex(x,y,offset);
	
	// Replace value in grid
	this.Grid[y][x] = hexTile;
	
	return hexTile;
	
}

CATAN.Board.prototype.setupResource = function(tile) {

	if (SERVER) {
		// Get random possible key
		var randResource = Math.floor( Math.random() * this.resourceCount.length )
		
		// Select resource
		tile.Resource = this.resourceCount[randResource];

		this.resourceCount.splice(randResource,1); // remove resource		
	} else {
		tile.Resource = NET.Resources[tile.Id-1]
	}

	// Setup robber if the resource is desert
	if (tile.Resource == RESOURCE_DESERT) {
	
		// TODO: Remove this check
		if(this.robber) {
			console.log("DUPLICATE ROBBER!");
		}
		
		tile.setRobber();
		this.robber = tile;
		
	}

}

/* -----------------------------------------------
	CATAN.Board.prototype.setupNumberToken( CATAN.HexTile )

	Desc: Assign number token to hex tile
------------------------------------------------*/
CATAN.Board.prototype.setupNumberToken = function(tile) {

	if (SERVER) {

		if(tile.Resource == RESOURCE_DESERT) return; // Desert doesn't have a number token

		var randToken = Math.floor( Math.random() * this.numTokens.length )
		
		tile.NumberToken = this.numTokens[randToken];
		
		this.numTokens.splice(randToken,1); // remove resource
		
	} else {

		tile.NumberToken = NET.NumberTokens[tile.Id-1]

	}

}

CATAN.Board.prototype.findAdjacentCorners = function() {

	for(var i in this.hexCorners) {
	
		var c = this.hexCorners[i]; // get corner
		
		// Loop through all other corners
		for(var j in this.hexCorners) {
		
			var c2 = this.hexCorners[j]; // get corner to be compared
			
			if(c.Id != c2.Id) { // check for same corner
				
				var distance = Math.floor( c.position.distanceTo(c2.position) );
				
				if (distance <= this.hexRadius) { // if the distance is small enough, the corner is adjacent
					c.AdjacentCorners.push(c2.Id);
				}
			
			}
		
		}
		
	}

}

CATAN.Board.prototype.findAdjacentEdges = function() {

	for(var i in this.hexEdges) {
	
		var e = this.hexEdges[i]; // get corner
		
		// Loop through all other corners
		for(var j in this.hexEdges) {
		
			var e2 = this.hexEdges[j]; // get corner to be compared
			
			if(e.Id != e2.Id) { // check for same corner

				var distance = Math.floor( e.position.distanceTo(e2.position) );

				if (distance <= this.hexRadius) { // if the distance is small enough, the corner is adjacent
					e.AdjacentEdges.push(e2.Id);
				}
			
			}
		
		}
		
	}

}

/* -----------------------------------------------
	CATAN.Board.prototype.getWorldHexOffset

	Desc: Returns the grid offset to center
	the board
------------------------------------------------*/
CATAN.Board.prototype.getWorldHexOffset = function() {
	var r = this.hexRadius,
	w = r * 2,
	h = r * Math.sqrt(3);
	
	return new THREE.Vector3( ( (this.cellWidth * w) - r ) / 2, 0, (this.cellHeight * h) / 2 );
}

CATAN.Board.prototype.getBuildingByID = function(id, building) {
	if(building == BUILDING_ROAD) {
		return this.getEdgeByID(id);
	} else if(building == BUILDING_SETTLEMENT || building == BUILDING_CITY) {
		return this.getCornerByID(id);
	}
}

CATAN.Board.prototype.getCornerByID = function(id) {
	for(var i in this.hexCorners) {	
		var c = this.hexCorners[i];
		if (c.Id == id) return c;
	}
}

CATAN.Board.prototype.getEdgeByID = function(id) {
	for(var i in this.hexEdges) {	
		var e = this.hexEdges[i];
		if (e.Id == id) return e;
	}
}

CATAN.Board.prototype.addOwnedBuilding = function(building) {
	this.ownedBuildings.push(building)
}