/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
CATAN.Entity = function() {

	this.entid = -1;
	this.Owner = -1;

	this.position = new THREE.Vector3(0,0,0);
	this.angle = -1;

	this.visible = false;
	
};

CATAN.Entity.prototype = new CATAN.Entity();

CATAN.Entity.prototype.getEntId = function() { return this.entid; }

CATAN.Entity.prototype.hasOwner = function() { return (this.Owner != -1); } // temporary
CATAN.Entity.prototype.getOwner = function() { return this.Owner; }
CATAN.Entity.prototype.setOwner = function(ply) {

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

CATAN.Entity.prototype.show = function(opacity) {
	opacity = (typeof opacity !== 'undefined') ? opacity : 1;

	if(typeof this.Collision !== 'undefined') { // change to mesh later
		this.Collision.material.opacity = opacity;
		if(opacity < 1) {
			this.Collision.material.transparent = true;
		}
	}

	this.visible = true;
};

CATAN.Entity.prototype.hide = function() {
	if(typeof this.Collision !== 'undefined') {
		this.Collision.material.opacity = 0;
		this.Collision.material.transparent = false;
	}

	this.visible = false;
};

/* -----------------------------------------------
	CATAN.Entity.getPosition
	CATAN.Entity.setPosition

	Desc: Entity's world position
------------------------------------------------*/
CATAN.Entity.prototype.getPosition = function() { return this.position; }
CATAN.Entity.prototype.setPosition = function(pos) { this.position = pos; }

CATAN.Entity.prototype.getAngle = function() { return this.angle; }
CATAN.Entity.prototype.setAngle = function(ang) { this.angle = ang; }

CATAN.Entity.prototype.build = function(ply) {
	this.setOwner(ply);
}

CATAN.Entity.prototype.create = function() {
	this.entid = ++CATAN.EntityCount;	
}

CATAN.Entity.prototype.remove = function() {
	
	scene.remove( this.Mesh )
	delete this
	
}

CATAN.EntityCount = 0;