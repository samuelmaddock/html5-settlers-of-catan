/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
HexCorner = function() {

	this.Id = -1;
	
	this.Building = BUILDING_SETTLEMENT;
	this.Owner = -1;
	
	this.AdjacentTiles = [];
	this.AdjacentCorners = [];
	
};

HexCorner.prototype = new HexCorner();

HexCorner.prototype.HasOwner = function() {
	return (this.Owner != -1)
}

HexCorner.prototype.SetOwner = function(ply) {
	this.Owner = ply.getID()
	ply.setOwnership(this)
}

HexCorner.prototype.CanBuild = function(ply) {
	return true;
}

HexCorner.prototype.setup = function(pos) {

	this.position = pos;

	if (SERVER) return;

	this.Collision = new THREE.Mesh(
		new THREE.CubeGeometry(25,25,25),
		new THREE.MeshBasicMaterial({opacity: 0})
	);

	this.Collision.position = pos;
	this.Collision.Parent = this;
	scene.add( this.Collision );
	collisionObjects.push( this.Collision );

}

HexCorner.prototype.remove = function(pos) {

	scene.remove( this.Collision )
	delete this

}

if(typeof exports !== 'undefined') {
	module.exports = HexCorner;
}