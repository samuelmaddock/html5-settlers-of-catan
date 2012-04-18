/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
HexEdge = function() {

	this.Id = -1;
	
	this.Building = BUILDING_ROAD;
	this.Owner = -1;
	
	this.AdjacentEdges = [];
	
};

HexEdge.prototype = new HexEdge();

HexEdge.prototype.HasOwner = function() {
	return (this.Owner != -1)
}

HexEdge.prototype.SetOwner = function(ply) {
	this.Owner = ply.getID()
	ply.setOwnership(this)
}

HexEdge.prototype.CanBuild = function(ply) {
	return true;
}

HexEdge.prototype.setup = function( orientation ) {
	
	this.position = orientation.pos;

	if (SERVER) return;

	this.Collision = new THREE.Mesh(
		new THREE.CubeGeometry(40,12,12),
		new THREE.MeshBasicMaterial( { opacity: 0, color: 0x000000 } )
	);
	
	this.Collision.position = orientation.pos;
	this.Collision.rotation = orientation.ang;
	this.Collision.Parent = this;
	scene.add( this.Collision );
	
	collisionObjects.push( this.Collision );
	
}

HexEdge.prototype.remove = function() {
	
	scene.remove( this.Collision )
	delete this
	
}

if(typeof exports !== 'undefined') {
	module.exports = HexEdge;
}