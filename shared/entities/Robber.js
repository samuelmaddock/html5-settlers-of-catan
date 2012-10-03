/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

CATAN.ents.register('Robber', (function() {
	"use strict";

	var ENT = function() {
		this.create();

		this.modelpath = "models/robber.js";
		this.tile = null;
	};

	ENT.prototype = CATAN.ents.create('BaseEntity');

	ENT.prototype.getTile = function() {
		return this.tile;
	}

	ENT.prototype.setTile = function(tile) {
		if(this.getTile() != null) {
			this.getTile().setRobber(false);
		}

		this.tile = tile;
		this.tile.setRobber(true);

		if(CLIENT) {
			this.getMesh().position = new THREE.Vector3(
				tile.position.x,
				tile.position.y,
				tile.position.z
			);
		}
	}

	if(CLIENT) {

		ENT.prototype.setup = function(data) {
			this._setup(data);
			this.setupMesh();

			var tile = CATAN.ents.getById(data.tileId);
			this.setTile(tile);
		}

		ENT.prototype.setupMesh = function() {
			this.Mesh = new THREE.Mesh(
				CATAN.AssetManager.get(this.modelpath),
				new THREE.MeshBasicMaterial({ color: 0x888888 })
			);

			CATAN.Game.scene.add( this.Mesh );
		}

	}

	return ENT;
})());