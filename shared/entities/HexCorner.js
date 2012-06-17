/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
var HexCorner = function() {

	this.create();

	this.Building = BUILDING_SETTLEMENT;
	
	this.AdjacentTiles = [];
	this.AdjacentEdges = [];
	this.AdjacentCorners = [];

};

HexCorner.prototype = CATAN.ents.create('BaseEntity');

HexCorner.prototype.canBuild = function() {

	if(this.hasOwner()) return false;

	// Must build settlement at least two corners away
	for(var i in this.AdjacentCorners) {
		if(this.AdjacentCorners[i].hasOwner()) return false;
	}

	return true;
}

HexCorner.prototype.setupMesh = function() {

	this.Mesh = new THREE.Mesh(
		//new THREE.CubeGeometry(25,25,25),
		CATAN.getSchema().Buildings[this.Building].geometry,
		new THREE.MeshLambertMaterial({opacity: 0})
	);

	this.Mesh.position = this.position;
	this.Mesh.Parent = this;
	CATAN.Game.scene.add( this.Mesh );

}

if(CLIENT) {

	HexCorner.prototype.setup = function(data) {
		this._setup(data);
		this.setupMesh();
	}
	
}


CATAN.ents.register('HexCorner', HexCorner);