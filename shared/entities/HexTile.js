/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

CATAN.ents.register('HexTile', (function() {
	"use strict";

	var ENT = function() {
		this.create();

		this.board = null;

		this.tileType = TILE_SEA;
		this.Resource = -1;
		this.NumberToken = -1;
		this.bHasRobber = false;
		this.bDock = false;
		
		this.x = -1;
		this.y = -1;

		this.bVisible = true;

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

		list.push( this.board.getTile(x-1, y) );
		list.push( this.board.getTile(x, y-1) );
		list.push( this.board.getTile(x+1, y) );
		list.push( this.board.getTile(x+1, y+1) );
		list.push( this.board.getTile(x, y+1) );
		list.push( this.board.getTile(x-1, y+1) );

		return list.filter(function(e){return e});
	}

	ENT.prototype.getAdjacentCorners = function() {
		var list = [],
			x = this.getX(),
			y = this.getY();

		var i = x;
		var j;
		if(x % 2 == 0) {
			j = 2*y;
		} else {
			j = (2*y) + 1;
		}

		list.push( this.board.getCorner(i, j) );
		list.push( this.board.getCorner(i+1, j) );
		list.push( this.board.getCorner(i+1, j+1) );
		list.push( this.board.getCorner(i+1, j+2) );
		list.push( this.board.getCorner(i, j+2) );
		list.push( this.board.getCorner(i, j+1) );

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
	ENT.prototype.getResource = function() { return this.Resource; };
	ENT.prototype.setResource = function(resource) { this.Resource = resource; };

	/*
		Tokens
	*/
	ENT.prototype.getToken = function() { return this.NumberToken; };
	ENT.prototype.setToken = function(num) {
		this.NumberToken = num;

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

	if(CLIENT) {

		ENT.prototype.setup = function(data) {
			this._setup(data);

			if(this.isLand()) {
				this.setResource(data.resource);
				this.setToken(data.token);
				this.setupMesh();
				this.getMesh().rotation.y = data.yaw;
			}

			if(this.isSea()) {
				/*this.dockTo = CATAN.ents.getById(data.dockTo);
				this.setupDock();
				CATAN.getBoard().docks.push(this);*/

				var res = CATAN.getSchema().Resources[0];

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
		}

		ENT.prototype.setupMesh = function() {
			var res = CATAN.getSchema().Resources[this.getResource()];

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

		ENT.prototype.setupDock = function() {
			var res = CATAN.getSchema().Resources[0];

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

	}

	return ENT;
})());