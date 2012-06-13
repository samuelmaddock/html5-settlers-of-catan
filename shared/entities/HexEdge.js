/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

var HexEdge = function() {
		
	this.create();

	this.Building = BUILDING_ROAD;
	
	this.AdjacentTiles = [];
	this.AdjacentEdges = [];
	this.AdjacentCorners = [];
	
};

HexEdge.prototype = CATAN.ents.create('BaseEntity');

HexEdge.prototype.canBuild = function(ply) {

	if(this.hasOwner()) return false;

	// Must build near adjacent corner
	for(var i in this.AdjacentCorners) {
		if(ply.isOwner(this.AdjacentCorners[i])) return true;
	}

	return false;

}

HexEdge.prototype.setupMesh = function() {

	this.Collision = new THREE.Mesh(
		new THREE.CubeGeometry(40,12,12),
		new THREE.MeshBasicMaterial( { opacity: 0 } )
	);
	
	this.Collision.position = this.position;
	this.Collision.rotation = this.angle;
	this.Collision.Parent = this;
	CATAN.Game.scene.add( this.Collision );
	
}

if(CLIENT) {
	HexEdge.prototype.setup = function(data) {
		this._setup(data);
		this.setAngle(data.ang);
		this.setupMesh();
	}
}

CATAN.ents.register('HexEdge', HexEdge);