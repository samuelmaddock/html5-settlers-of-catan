/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
CATAN.HexCorner = function() {

	this.create();

	this.Building = BUILDING_SETTLEMENT;
	
	this.AdjacentTiles = [];
	this.AdjacentCorners = [];

};

CATAN.HexCorner.prototype = new CATAN.Entity();
CATAN.HexCorner.prototype.constructor = CATAN.HexCorner;
CATAN.HexCorner.prototype.super = CATAN.Entity.prototype;

CATAN.HexCorner.prototype.canBuild = function() {

	if(this.hasOwner()) return false;

	// Must build settlement at least two corners away
	for(var i in this.AdjacentCorners) {
		if(this.AdjacentCorners[i].hasOwner()) return false;
	}

	return true;
}

CATAN.HexCorner.prototype.setupMesh = function() {

	this.Collision = new THREE.Mesh(
		new THREE.CubeGeometry(25,25,25),
		new THREE.MeshBasicMaterial({opacity: 0})
	);

	this.Collision.position = this.position;
	this.Collision.Parent = this;
	CATAN.Game.scene.add( this.Collision );

}