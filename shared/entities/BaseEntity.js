/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
var BaseEntity = function() {

	this.entid = -1;
	this.Mesh = null;

	this.Owner = null;
	this.Building = -1;

	this.position = new THREE.Vector3(0,0,0);
	this.angle = -1;

	this.bVisible = false;
	
};

BaseEntity.prototype = new BaseEntity();

BaseEntity.prototype.getEntId = function() { return this.entid; }

BaseEntity.prototype.getType = function() { return this.Building };

BaseEntity.prototype.hasOwner = function() { return (this.Owner != null); }
BaseEntity.prototype.getOwner = function() { return this.Owner; }
BaseEntity.prototype.setOwner = function(ply) {

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

BaseEntity.prototype.show = function(opacity) {
	opacity = (typeof opacity !== 'undefined') ? opacity : 1;

	var mesh = this.getMesh();
	mesh.material.opacity = opacity;
	if(opacity < 1) {
		mesh.material.transparent = true;
	}

	this.bVisible = true;
};

BaseEntity.prototype.hide = function() {
	var mesh = this.getMesh();
	mesh.material.opacity = 0;
	mesh.material.transparent = false;

	this.bVisible = false;
};

BaseEntity.prototype.isVisible = function() {
	return this.bVisible;
}

/* -----------------------------------------------
	BaseEntity.getMesh

	Desc: Returns the tile's world mesh
------------------------------------------------*/
BaseEntity.prototype.getMesh = function() {

	if (!this.Mesh) {
		this.setupMesh();
	}
	
	return this.Mesh;

};

/* -----------------------------------------------
	BaseEntity.getPosition
	BaseEntity.setPosition

	Desc: Entity's world position
------------------------------------------------*/
BaseEntity.prototype.getPosition = function() { return this.position; }
BaseEntity.prototype.setPosition = function(pos) { this.position = pos; }

BaseEntity.prototype.getAngle = function() { return this.angle; }
BaseEntity.prototype.setAngle = function(ang) { this.angle = ang; }

BaseEntity.prototype.build = function(ply) {
	this.setOwner(ply);
}

BaseEntity.prototype.create = function() {
	this.entid = ++CATAN.EntityCount;	
}

BaseEntity.prototype.remove = function() {
	
	if(CLIENT) {
		CATAN.Game.scene.remove( this.Mesh );
	}

	delete this;
	
}

BaseEntity.prototype.isTile = function() {
	return this.hasRobber != undefined;
}

BaseEntity.prototype.isSettlement = function() {
	return this.getType() == BUILDING_SETTLEMENT;
}

BaseEntity.prototype.isCity = function() {
	return this.getType() == BUILDING_CITY;
}

BaseEntity.prototype.isRoad = function() {
	return this.getType() == BUILDING_ROAD;
}

BaseEntity.prototype.getAdjacentTiles = function() {
	return this.AjacentTiles ? this.AdjacentTiles : [];
}

BaseEntity.prototype.getAdjacentCorners = function() {
	return this.AdjacentCorners ? this.AdjacentCorners : [];
}

BaseEntity.prototype.getAdjacentEdges = function() {
	return this.AdjacentEdges ? this.AdjacentEdges : [];
}

if(CLIENT) {

	BaseEntity.prototype._setup = function(data) {
		// this.entid = data.id;
	}

	BaseEntity.prototype.onHover = function() {}

	BaseEntity.prototype.onHoverStart = function() {

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

	BaseEntity.prototype.onHoverEnd = function() {

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

}

CATAN.ents.register('BaseEntity', BaseEntity);