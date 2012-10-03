/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

CATAN.ents.register('BaseEntity', (function() {
	"use strict";

	var ENT = function() {
		this.entid = -1;
		this.Mesh = null;

		this.Owner = null;
		this.Building = -1;

		this.position = new THREE.Vector3(0,0,0);
		this.angle = -1;

		this.bVisible = false;
	};

	ENT.prototype = new ENT();

	ENT.prototype.getEntId = function() { return this.entid; }

	ENT.prototype.getType = function() { return this.Building };
	ENT.prototype.setType = function(type) { this.Building = type; };

	ENT.prototype.hasOwner = function() { return (this.Owner != null); }
	ENT.prototype.getOwner = function() { return this.Owner; }
	ENT.prototype.setOwner = function(ply) {
		if(typeof ply === 'undefined') return;
		this.Owner = ply;
		ply.setOwnership(this);

		if(CLIENT) {
			this.show();
			this.getMesh().material = new THREE.MeshLambertMaterial({
				color: ply.getColor(),
				opacity: 1
			});
		}
	}

	ENT.prototype.show = function(opacity) {
		opacity = (typeof opacity !== 'undefined') ? opacity : 1;

		var mesh = this.getMesh();
		mesh.material.opacity = opacity;
		if(opacity < 1) {
			mesh.material.transparent = true;
		}

		this.bVisible = true;
	};

	ENT.prototype.hide = function() {
		var mesh = this.getMesh();
		mesh.material.opacity = 0;
		mesh.material.transparent = false;

		this.bVisible = false;
	};

	ENT.prototype.isVisible = function() {
		return this.bVisible;
	}

	/* -----------------------------------------------
		ENT.getMesh

		Desc: Returns the tile's world mesh
	------------------------------------------------*/
	ENT.prototype.getMesh = function() {

		if (!this.Mesh) {
			this.setupMesh();
		}
		
		return this.Mesh;

	};

	/* -----------------------------------------------
		ENT.getPosition
		ENT.setPosition

		Desc: Entity's world position
	------------------------------------------------*/
	ENT.prototype.getPosition = function() { return this.position; }
	ENT.prototype.setPosition = function(pos) { this.position = pos; }

	ENT.prototype.getAngle = function() { return this.angle; }
	ENT.prototype.setAngle = function(ang) { this.angle = ang; }

	ENT.prototype.build = function(ply) {
		this.setOwner(ply);
	}

	ENT.prototype.create = function() {
		this.entid = ++CATAN.EntityCount;	
	}

	ENT.prototype.remove = function() {
		
		if(CLIENT) {
			CATAN.Game.scene.remove( this.Mesh );
		}

		delete this;
		
	}

	/*
		Buildings
	*/
	ENT.prototype.isTile = function() {
		return this.hasRobber != undefined;
	}

	ENT.prototype.isSettlement = function() {
		return this.getType() == BUILDING_SETTLEMENT;
	}

	ENT.prototype.isCity = function() {
		return this.getType() == BUILDING_CITY;
	}

	ENT.prototype.isCorner = function() {
		return this.isSettlement() || this.isCity();
	}

	ENT.prototype.isRoad = function() {
		return this.getType() == BUILDING_ROAD;
	}

	/*
		Adjacent Entities
	*/
	ENT.prototype.getAdjacentTiles = function() {
		return this.AdjacentTiles ? this.AdjacentTiles : [];
	}

	ENT.prototype.getAdjacentCorners = function() {
		return this.AdjacentCorners ? this.AdjacentCorners : [];
	}

	ENT.prototype.getAdjacentEdges = function() {
		return this.AdjacentEdges ? this.AdjacentEdges : [];
	}

	if(CLIENT) {

		ENT.prototype._setup = function(data) {
			// this.entid = data.id;
		}

		ENT.prototype.onHover = function() {}

		ENT.prototype.onHoverStart = function() {
			if(!this.hasOwner()) {
				$('body').css('cursor','pointer');

				if(this.isTile()) {

					this.getMesh().material.color = new THREE.Color(CATAN.LocalPlayer.getColor());

				} else {
					this.getMesh().material = new THREE.MeshLambertMaterial({
						color: CATAN.LocalPlayer.getColor(),
						opacity: 0.88,
						transparent: true
					});
				}
			} else {

				if(this.getOwner() != CATAN.LocalPlayer) return;

				if(this.isSettlement()) {
					$('body').css('cursor','pointer');
					// TODO: Change preview to city model
				}

			}
		}

		ENT.prototype.onHoverEnd = function() {
			$('body').css('cursor','default');

			if(!this.hasOwner()) {
				if(this.isTile()) {

					this.getMesh().material.color = new THREE.Color(0xffffff);

				} else {
					this.getMesh().material = new THREE.MeshLambertMaterial({
						color: 0xffffff,
						opacity: 0.33,
						transparent: true
					});
				}
			}
		}

		ENT.prototype.onSelect = function() {
			if(!CATAN.LocalPlayer.isTurn()) return;

			if(this.isTile()) {
				CATAN.server.emit('movedRobber', {
					id: this.getEntId()
				});
			} else {
				CATAN.server.emit('playerBuild', {
					id: this.getEntId()
				});
			}
		}

	}

	return ENT;
})());