/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
var HexCorner = function() {

	this.create();

	this.modelpath = "models/settlement.js";
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
	// var path = CATAN.getSchema().Buildings[this.Building];

	this.Mesh = new THREE.Mesh(
		//new THREE.CubeGeometry(25,25,25),
		CATAN.AssetManager.get(this.modelpath),
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