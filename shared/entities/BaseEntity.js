/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
var BaseEntity = function() {

	this.entid = -1;
	this.Owner = -1;

	this.position = new THREE.Vector3(0,0,0);
	this.angle = -1;

	this.visible = false;
	
};

BaseEntity.prototype = new BaseEntity();

BaseEntity.prototype.getEntId = function() { return this.entid; }

BaseEntity.prototype.hasOwner = function() { return (this.Owner != -1); } // temporary
BaseEntity.prototype.getOwner = function() { return this.Owner; }
BaseEntity.prototype.setOwner = function(ply) {

	if(typeof ply === 'undefined') return;
	this.Owner = ply.getID()
	ply.setOwnership(this)

	if(CLIENT) {
		this.show();
		this.Collision.material = new THREE.MeshBasicMaterial({
			color: ply.getColor(),
			opacity: 1
		});
	}

}

BaseEntity.prototype.show = function(opacity) {
	opacity = (typeof opacity !== 'undefined') ? opacity : 1;

	if(typeof this.Collision !== 'undefined') { // change to mesh later
		this.Collision.material.opacity = opacity;
		if(opacity < 1) {
			this.Collision.material.transparent = true;
		}
	}

	this.visible = true;
};

BaseEntity.prototype.hide = function() {
	if(typeof this.Collision !== 'undefined') {
		this.Collision.material.opacity = 0;
		this.Collision.material.transparent = false;
	}

	this.visible = false;
};

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

CATAN.ents.register('BaseEntity', BaseEntity);