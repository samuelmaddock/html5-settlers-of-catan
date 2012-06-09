/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

CATAN.HexEdge = function() {
		
	this.create();

	this.Building = BUILDING_ROAD;
	
	this.AdjacentEdges = [];
	this.AdjacentCorners = [];
	
};

CATAN.HexEdge.prototype = new CATAN.Entity();
CATAN.HexEdge.prototype.constructor = CATAN.HexEdge;
CATAN.HexEdge.prototype.super = CATAN.Entity.prototype;

CATAN.HexEdge.prototype.canBuild = function(ply) {

	if(this.hasOwner()) return false;

	// Must build near adjacent corner
	for(var i in this.AdjacentCorners) {
		if(ply.isOwner(this.AdjacentCorners[i])) return true;
	}

	return false;

}

CATAN.HexEdge.prototype.setupMesh = function() {

	this.Collision = new THREE.Mesh(
		new THREE.CubeGeometry(40,12,12),
		new THREE.MeshBasicMaterial( { opacity: 0 } )
	);
	
	this.Collision.position = this.position;
	this.Collision.rotation = this.angle;
	this.Collision.Parent = this;
	scene.add( this.Collision );
	
}