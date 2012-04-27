/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
CATAN.Entity = function() {

	this.Id = -1;
	this.Owner = -1;

	this.position = new THREE.Vector3(0,0,0);
	this.angle = -1;
	
};

CATAN.Entity.prototype = new CATAN.Entity();

CATAN.Entity.prototype.HasOwner = function() {
	return (this.Owner != -1)
}

CATAN.Entity.prototype.getOwner = function() { return this.Owner; }
CATAN.Entity.prototype.SetOwner = function(ply) {
	if(typeof ply === 'undefined') return;
	this.Owner = ply.getID()
	ply.setOwnership(this)
}

/* -----------------------------------------------
	CATAN.Entity.getPosition
	CATAN.Entity.setPosition

	Desc: Entity's world position
------------------------------------------------*/
CATAN.Entity.prototype.getPosition = function() { return this.position; }
CATAN.Entity.prototype.setPosition = function(pos) { this.position = pos; }

CATAN.Entity.prototype.getAngle = function() { return this.angle; }
CATAN.Entity.prototype.setAngle = function(ang) { this.angle = ang; }

CATAN.Entity.prototype.setup = function(geometry, pos, ang) {

	this.position = pos;
	this.angle = ang;

	if(CLIENT) {

		this.Mesh = new THREE.Mesh( 
			geometry,
			new THREE.MeshBasicMaterial({})
		);

		this.Mesh.position = this.position;
		scene.add( this.Mesh );

		/*this.Collision.position = orientation.pos;
		this.Collision.rotation = orientation.ang;
		this.Collision.Parent = this;
		scene.add( this.Collision );
		
		collisionObjects.push( this.Collision );*/

	}


}

CATAN.Entity.prototype.remove = function() {
	
	scene.remove( this.Mesh )
	delete this
	
}