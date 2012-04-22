/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

var BOARD = {
	
	CellWidth: 5,
	CellHeight: 5,
	
	HexRadius: 64,

	hexTiles: [],
	hexCorners: [],
	hexEdges: [],

	ownedBuildings: [],
	
	Robber: undefined
	
}

BOARD.clearBoard = function() {

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
	delete this.Robber;

}

/* -----------------------------------------------
	Catan Board Setup
------------------------------------------------*/
BOARD.setupBoard = function() {

	this.clearBoard()

	this.Schema = CATAN.getSchema();
	this.Grid = CATAN.getSchema().Grid;
	this.resourceCount = this.Schema.ResourceCount;
	this.numTokens = this.Schema.NumberTokens;

	// Update later for possible expansions?
	this.CellHeight = this.Grid.length;
	this.CellWidth = this.Grid[0].length;

	// Setup hex grid tiles
	for (y = 0; y < this.CellHeight; y++) {
		for (x = 0; x < this.CellWidth; x++) {
		
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

	console.log("BOARD SETUP DONE")

}

BOARD.setupHexTile = function(x,y) {

	// Create new HexGridCell object
	var offset = this.getWorldHexOffset()
	var hexTile = new HexGridCell(this.HexRadius);
	hexTile.Id = this.hexTiles.length + 1;
	hexTile.setGridIndex(x,y,offset);
	
	// Replace value in grid
	this.Grid[y][x] = hexTile;
	
	return hexTile;
	
}

BOARD.setupResource = function(tile) {

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
		if(this.Robber) {
			console.log("DUPLICATE ROBBER!");
		}
		
		tile.setRobber();
		this.Robber = tile;
		
	}

}

/* -----------------------------------------------
	BOARD.setupNumberToken( HexGridCell )

	Desc: Assign number token to hex tile
------------------------------------------------*/
BOARD.setupNumberToken = function(tile) {

	if (SERVER) {

		if(tile.Resource == RESOURCE_DESERT) return; // Desert doesn't have a number token

		var randToken = Math.floor( Math.random() * this.numTokens.length )
		
		tile.NumberToken = this.numTokens[randToken];
		
		this.numTokens.splice(randToken,1); // remove resource
		
	} else {

		tile.NumberToken = NET.NumberTokens[tile.Id-1]

	}

}

BOARD.findAdjacentCorners = function() {

	for(var i in this.hexCorners) {
	
		var c = this.hexCorners[i]; // get corner
		
		// Loop through all other corners
		for(var j in this.hexCorners) {
		
			var c2 = this.hexCorners[j]; // get corner to be compared
			
			if(c.Id != c2.Id) { // check for same corner
				
				var distance = Math.floor( c.position.distanceTo(c2.position) );
				
				if (distance <= this.HexRadius) { // if the distance is small enough, the corner is adjacent
					c.AdjacentCorners.push(c2.Id);
				}
			
			}
		
		}
		
	}

}

BOARD.findAdjacentEdges = function() {

	for(var i in this.hexEdges) {
	
		var e = this.hexEdges[i]; // get corner
		
		// Loop through all other corners
		for(var j in this.hexEdges) {
		
			var e2 = this.hexEdges[j]; // get corner to be compared
			
			if(e.Id != e2.Id) { // check for same corner

				var distance = Math.floor( e.position.distanceTo(e2.position) );

				if (distance <= this.HexRadius) { // if the distance is small enough, the corner is adjacent
					e.AdjacentEdges.push(e2.Id);
				}
			
			}
		
		}
		
	}

}

/* -----------------------------------------------
	BOARD.getWorldHexOffset

	Desc: Returns the grid offset to center
	the board
------------------------------------------------*/
BOARD.getWorldHexOffset = function() {
	var r = this.HexRadius,
	w = r * 2,
	h = r * Math.sqrt(3);
	
	return new THREE.Vector3( ( (this.CellWidth * w) - r ) / 2, 0, (this.CellHeight * h) / 2 );
}

BOARD.getBuildingByID = function(id, building) {
	if(building == BUILDING_ROAD) {
		return this.getEdgeByID(id);
	} else if(building == BUILDING_SETTLEMENT || building == BUILDING_CITY) {
		return this.getCornerByID(id);
	}
}

BOARD.getCornerByID = function(id) {
	for(var i in this.hexCorners) {	
		var c = this.hexCorners[i];
		if (c.Id == id) return c;
	}
}

BOARD.getEdgeByID = function(id) {
	for(var i in this.hexEdges) {	
		var e = this.hexEdges[i];
		if (e.Id == id) return e;
	}
}

BOARD.addOwnedBuilding = function(building) {
	this.ownedBuildings.push(building)
}

// node.js serverside
if(typeof exports !== 'undefined') {

	// Prepare catan and classic schema
	CATAN = require('./catan.js')
	SCHEMA = require('./schemas/classic.js')

	// Merge properties
	for (var attrname in SCHEMA) { CATAN[attrname] = SCHEMA[attrname]; }

	THREE = require('../server/vector.js')

	HexGridCell = require('./HexTile.js')
	HexCorner = require('./HexCorner.js')
	HexEdge = require('./HexEdge.js')

	module.exports = BOARD;

}