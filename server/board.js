/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

THREE = require('./vector.js');
require('../shared/ents.js');
require('../shared/entities/BaseEntity.js');
require('../shared/entities/HexTile.js');
require('../shared/entities/HexCorner.js');
require('../shared/entities/HexEdge.js');
require('../shared/entities/Robber.js');

CATAN.Board = function(game) {
	
	CATAN.EntityCount = 0; // reset

	this.game = game;

	this.cellWidth = 5;
	this.cellHeight = 5;
	
	this.hexRadius = 64;

	this.hexTiles = [];
	this.hexCorners = [];
	this.hexEdges = [];

	this.ownedBuildings = [];

	this.setup();

}

/* -----------------------------------------------
	Catan Board Setup
------------------------------------------------*/
CATAN.Board.prototype.setup = function() {

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
				
				this.hexTiles.push( tile );
				
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
		]
		
		for(var j in positions) {
			
			var pos = positions[j]; // get corner vector
			var posStr = Math.floor(pos.x) + "," + Math.floor(pos.Y) + "," + Math.floor(pos.z); // hash string
			
			var corner;
			if (!corners[posStr]) { // create new corner entity
			
				corner = CATAN.ents.create('HexCorner');
				corner.setPosition(positions[j]);
				corner.Id = this.hexCorners.length + 1; // unique Id
				
				corners[posStr] = corner; // set reference for later
				
				this.hexCorners.push(corner);
				this.game.entities.push(corner);
				
			} else { // duplicate corner
			
				corner = corners[posStr];
			
			}
			
			tile.corners.push( corner );
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
		]
		
		for(var j in orientations) {
			
			var pos = orientations[j].pos; // get edge vector
			var ang = orientations[j].ang; // get edge vector

			var posStr = Math.floor(pos.x) + "," + Math.floor(pos.Y) + "," + Math.floor(pos.z); // hash string
			
			var edge;
			if (!edges[posStr]) { // create new edge entity
			
				edge = CATAN.ents.create('HexEdge');
				edge.Id = this.hexEdges.length + 1; // unique Id
				edge.setPosition(orientations[j].pos);
				edge.setAngle(orientations[j].ang);
				
				edges[posStr] = edge; // set reference for later
				
				this.hexEdges.push(edge);
				this.game.entities.push(edge);
				
			} else { // duplicate edge
			
				edge = edges[posStr];
			
			}
			
			tile.edges.push( edge );
			edge.AdjacentTiles.push(tile);
			
		}
		
	}
	delete corners;
	delete edges;

	// Establish adjacencies
	this.findAdjacentCorners()
	this.findAdjacentEdges()


	// Create docks

}

CATAN.Board.prototype.setupHexTile = function(x,y) {

	// Create new HexGridCell object
	var offset = this.getWorldHexOffset()
	var hexTile = CATAN.ents.create('HexTile');
	hexTile.Id = this.hexTiles.length + 1;
	hexTile.setRadius(this.hexRadius);
	hexTile.setGridIndex(x,y,offset);
	
	// Replace value in grid
	this.Grid[y][x] = hexTile;
	this.game.entities.push(hexTile);
	
	return hexTile;
	
}

CATAN.Board.prototype.setupResource = function(tile) {

	// Get random possible key
	var randResource = Math.floor( Math.random() * this.resourceCount.length )
	
	// Select resource
	tile.Resource = this.resourceCount[randResource];

	this.resourceCount.splice(randResource,1); // remove resource

	// Setup robber if the resource is desert
	if (tile.Resource == RESOURCE_DESERT) {
	
		// TODO: Remove this check
		if(this.robber) {
			console.log("DUPLICATE ROBBER!");
		}
		
		tile.setRobber(this);
		
	}

}

/* -----------------------------------------------
	CATAN.Board.prototype.setupNumberToken( HexTile )

	Desc: Assign number token to hex tile
------------------------------------------------*/
CATAN.Board.prototype.setupNumberToken = function(tile) {

	if(tile.Resource == RESOURCE_DESERT) return; // Desert doesn't have a number token

	var randToken = Math.floor( Math.random() * this.numTokens.length )
	
	tile.NumberToken = this.numTokens[randToken];
	
	this.numTokens.splice(randToken,1); // remove resource

}

CATAN.Board.prototype.findAdjacentCorners = function() {

	// for corners
	for(var i in this.hexCorners) {
	
		var c = this.hexCorners[i]; // get corner
		
		// Loop through all other corners
		for(var j in this.hexCorners) {
		
			var c2 = this.hexCorners[j]; // get corner to be compared
			
			if(c.Id != c2.Id) { // check for same corner
				
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

}

CATAN.Board.prototype.findAdjacentEdges = function() {

	for(var i in this.hexEdges) {
	
		var e = this.hexEdges[i]; // get edge
		
		// Loop through all other corners
		for(var j in this.hexEdges) {
		
			var e2 = this.hexEdges[j]; // get edge to be compared
			
			if(e.Id != e2.Id) { // check for same edge

				var distance = Math.floor( e.position.distanceTo(e2.position) );

				if (distance <= this.hexRadius) { // if the distance is small enough, the edge is adjacent
					e.AdjacentEdges.push(e2);
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

CATAN.Board.prototype.getBuildingByID = function(id, BUILDING_ENUM) {
	if(BUILDING_ENUM == BUILDING_ROAD) {
		return this.getEdgeByID(id);
	} else if(BUILDING_ENUM == BUILDING_SETTLEMENT || BUILDING_ENUM == BUILDING_CITY) {
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

CATAN.Board.prototype.getAvailableBuildings = function(ply, BUILDING_ENUM) {

	var entities = this.board.getBuildingsByType(BUILDING_ENUM);

	var buildable = [];
	for(var i in entities) {
		if(entities[i].canBuild(ply)) {
			buildable.push(entities[i].getEntId());
		}
	}

	return buildable;

}