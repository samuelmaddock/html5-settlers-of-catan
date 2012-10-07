/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

CATAN.ents.register('HexTile', (function() {
	"use strict";

	var ENT = function() {
		this.create();

		this.tileType = TILE_INVALID;
		this.resource = -1;
		this.numberToken = -1;
		this.bHasRobber = false;
		this.bDock = false;

		this.AdjacentCorners = [];
		this.AdjacentEdges = [];

		this.x = -1;
		this.y = -1;

		this.cornersX = [];
		this.cornersY = [];

		this.edgesX = [];
		this.edgesY = [];

		// Networked randomized rotation
		this.yaw = (2*Math.PI)/6 * (Math.floor(Math.random() * 6) + 1);
	};

	ENT.prototype = CATAN.ents.create('BaseEntity');

	ENT.prototype.getX = function() {
		return this.x;
	}

	ENT.prototype.getY = function() {
		return this.y;
	}

	ENT.prototype.getAdjacentTiles = function() {
		var list = [],
			x = this.getX(),
			y = this.getY();

		if(x % 2 == 0) { // even row
			list.push( this.board.getTile(x-1, y-1) );
			list.push( this.board.getTile(x, y-1) );
			list.push( this.board.getTile(x+1, y-1) );
			list.push( this.board.getTile(x+1, y) );
			list.push( this.board.getTile(x, y+1) );
			list.push( this.board.getTile(x-1, y) );
		} else { // odd orw
			list.push( this.board.getTile(x-1, y) );
			list.push( this.board.getTile(x, y-1) );
			list.push( this.board.getTile(x+1, y) );
			list.push( this.board.getTile(x+1, y+1) );
			list.push( this.board.getTile(x, y+1) );
			list.push( this.board.getTile(x-1, y+1) );
		}

		return list.filter(function(e){return e});
	}

	/*
		Tile type
	*/
	ENT.prototype.setTileType = function(type) {
		this.tileType = type;
	}

	ENT.prototype.getTileType = function() {
		return this.tileType;
	}

	ENT.prototype.isLand = function() {
		return this.getTileType() == TILE_LAND;
	}

	ENT.prototype.isSea = function() {
		return this.getTileType() == TILE_SEA;
	}

	/*
		Dock
	*/
	ENT.prototype.isDock = function() {
		return this.bDock;
	}
	ENT.prototype.setDock = function(tile) {
		this.dockTo = tile;
		this.bDock = true;
	}

	/*
		Resources
	*/
	ENT.prototype.getResource = function() { return this.resource; };
	ENT.prototype.setResource = function(resource) { this.resource = resource; };

	/*
		Tokens
	*/
	ENT.prototype.getToken = function() { return this.numberToken; };
	ENT.prototype.setToken = function(num) {
		this.numberToken = num;

		if(CLIENT && num > 0) {
			// White circular base
			if(!this.tokenBase) {
				this.tokenBase = new THREE.Mesh(
					new THREE.CylinderGeometry(18,18,4,12,1,false),
					new THREE.MeshBasicMaterial({color:0xFFFFFF})
				)
				this.tokenBase.position.x = this.position.x;
				this.tokenBase.position.y = this.position.y;
				this.tokenBase.position.z = this.position.z;
				CATAN.Game.scene.add(this.tokenBase);
			}

			// Number token
			if(!this.tokenText) {
				this.tokenText = new THREE.Mesh(
					new THREE.TextGeometry(this.getToken().toString(), {
						size: 20,
						height: 1,
						curveSegments: 2,
						font: "helvetiker"
					}),
					new THREE.MeshBasicMaterial({ color: 0x000000 })
				)
				this.tokenText.position.x = this.position.x - 8;
				this.tokenText.position.y = this.position.y + 2;
				this.tokenText.position.z = this.position.z + 8;
				this.tokenText.rotation.x = -90 * Math.PI/180;
				CATAN.Game.scene.add(this.tokenText);
			}
		}
	};

	/*
		Robber
	*/
	ENT.prototype.hasRobber = function() { return this.bHasRobber; };
	ENT.prototype.setRobber = function(bRobber) { this.bHasRobber = bRobber; };

	/* -----------------------------------------------
		ENT.setGridIndex( x, y )

		Desc: Sets the hex tile grid index and
		calculates the appropriate offsets
	------------------------------------------------*/
	ENT.prototype.setGridIndex = function(x, y, r) {
		var w = r *2,
			h = r * Math.sqrt(3),
			s = r * 3 /2;

		this.x = x;
		this.y = y;

		this.mX = (x * s),
		this.mY = h * (2 * y + (x % 2)) / 2;

		// Corner positions from center of tile
		this.cornersX = [ -r/2, r/2, r, r/2, -r/2, -r ];
		this.cornersY = [ -h/2, -h/2, 0, h/2, h/2, 0 ];

		// Edge positions from center of tile
		this.edgesX = [ 0, r/4 + r/2, r/4 + r/2, 0, -r/4 - r/2, -r/4 - r/2 ];
		this.edgesY = [ -h/2, -h/4, h/4, h/2, h/4, -h/4 ];

		var rad = 60 * Math.PI/180
		this.edgesAngle = [ 0, -rad, rad, 0, -rad, rad ];

		this.position = new THREE.Vector3(
			this.mX - s,
			0,
			this.mY - h/2
		);
	}

	/* -----------------------------------------------
		ENT.getCornerPosition( CORNER_ENUM )

		Desc: Returns the world position for the 
		requested corner of the tile (See enums.js)
	------------------------------------------------*/
	ENT.prototype.getCornerPosition = function(CORNER_ENUM) {
		var pos = this.getPosition();
		var corner = new THREE.Vector3(
			pos.x + this.cornersX[CORNER_ENUM],
			pos.y,
			pos.z + this.cornersY[CORNER_ENUM]
		);

		return corner;
	}

	/* -----------------------------------------------
		ENT.getEdgePosition( EDGE_ENUM )

		Desc: Returns the world position for the 
		requested edge of the tile (See enums.js)
	------------------------------------------------*/
	ENT.prototype.getEdgePosAng = function(EDGE_ENUM) {
		var angle = new THREE.Vector3(
			0,
			this.edgesAngle[EDGE_ENUM],
			0
		);

		var hexpos = this.getPosition();
		var position = new THREE.Vector3(
			hexpos.x + this.edgesX[EDGE_ENUM],
			hexpos.y,
			hexpos.z + this.edgesY[EDGE_ENUM]
		);

		return { pos: position, ang: angle };
	}

	if(CLIENT) {

		ENT.prototype.setup = function(data) {
			this._setup(data);

			if(data.type) {
				this.setTileType(data.type);
			}

			if(this.isLand()) {
				this.setResource(data.resource);
				this.setToken(data.token);
				this.setupMesh();
				this.getMesh().rotation.y = data.yaw;
				this.show(); // Set to visible
			}

			if(this.isSea() && data.dock) {
				this.setDock( CATAN.ents.getById(data.dockTo) );
				this.setupDockMesh();
				CATAN.getBoard().docks.push(this);
			}
		}

		ENT.prototype.setupMesh = function() {
			var res;
			if(this.isLand()) {
				res = CATAN.getSchema().Resources[this.getResource()];
			} else if(this.isSea()) {
				res = CATAN.getSchema().Resources[0];
			} else {
				return;
			}

			this.Mesh = new THREE.Mesh(
				CATAN.AssetManager.get(res.url),
				new THREE.MeshLambertMaterial({
					map: CATAN.AssetManager.get(res.mat)
				})
			);

			this.Mesh.position = this.position;
			this.Mesh.Parent = this;

			CATAN.Game.scene.add( this.Mesh );
		}

		ENT.prototype.setupDockMesh = function() {
			var res = CATAN.getSchema().Resources[0];

			this.Mesh = new THREE.Mesh(
				CATAN.AssetManager.get(res.url),
				new THREE.MeshLambertMaterial({
					map: CATAN.AssetManager.get(res.mat),
					color: 0x000000
				})
			);

			this.Mesh.position = this.position;
			this.Mesh.Parent = this;

			CATAN.Game.scene.add( this.Mesh );
		}

	}

	return ENT;
})());