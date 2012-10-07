/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

CATAN.ents.register('HexCorner', (function() {
	"use strict";

	var ENT = function() {
		this.create();
		this.setType(BUILDING_SETTLEMENT);
		
		this.AdjacentTiles = [];
		this.AdjacentEdges = [];
		this.AdjacentCorners = [];

		this.build = function(ply) {
			if(this.hasOwner()) {
				// Set to city
				this.Building = BUILDING_CITY;
				if(CLIENT) this.setupMesh();
			} else {
				this.setOwner(ply);
			}
		}
	};

	ENT.prototype = CATAN.ents.create('BaseEntity');

	ENT.prototype.isOnLand = function() {
		if(this.bOnLand == undefined) {
			this.bOnLand = false;
			var adjTiles = this.getAdjacentTiles();
			for(var i in adjTiles) {
				var tile = adjTiles[i];
				if(tile.isLand()) {
					this.bOnLand = true;
					break;
				}
			}
		}
		return this.bOnLand;
	}

	ENT.prototype.canBuild = function(ply) {
		// Only land corners are currently supported
		if(!this.isOnLand()) return false;

		if(this.hasOwner()) {
			if((this.getOwner() != ply) || ply.isInSetup()) {
				return false;
			}
			if(this.getOwner() == ply && this.isSettlement()) {
				return true;
			}
		}

		// Must build settlement at least two corners away
		var adjCorners = this.getAdjacentCorners();
		for(var i in adjCorners) {
			var corner = adjCorners[i];
			if(corner.hasOwner()) return false;
		}

		// If the player is not in setup mode
		if(!ply.isInSetup()) {
			// Must build next to road
			var adjEdges = this.getAdjacentEdges();
			for(var i in adjEdges) {
				var edge = adjEdges[i];
				if(edge.hasOwner() && edge.getOwner() == ply) {
					return true;
				}
			}
			return false; // not next to owned road
		}

		return true;
	}

	if(CLIENT) {

		ENT.prototype.setup = function(data) {
			this._setup(data);
			this.setupMesh();
		}

		ENT.prototype.setupMesh = function() {
			var path = CATAN.getSchema().Buildings[this.getType()].url;

			if(this.isCity()) {
				CATAN.Game.scene.remove(this.Mesh);
				this.Mesh = null;
			}

			this.Mesh = new THREE.Mesh(
				//new THREE.CubeGeometry(25,25,25),
				CATAN.AssetManager.get(path),
				new THREE.MeshLambertMaterial({opacity: 0})
			);

			this.Mesh.position = this.position;
			this.Mesh.Parent = this;

			CATAN.Game.scene.add(this.Mesh);
		}

	}

	return ENT;
})());