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

HexCorner.prototype.canBuild = function() {
	if(this.hasOwner()) return false;

	// Must build settlement at least two corners away
	var adjCorners = this.getAdjacentCorners();
	for(var i in adjCorners) {
		var corner = adjCorners[i];
		if(corner.hasOwner()) return false;
	}

	// Must build next to road
	/*var adjEdges = this.getAdjacentEdges();
	for(var j in adjEdges) {
		var edge = adjEdges[i];
		if(edge.hasOwner() && edge.getOwner() == ply) {
			return true;
		}
	}*/

	return true;
}

if(CLIENT) {
	HexCorner.prototype.setup = function(data) {
		this._setup(data);
		this.setupMesh();
	}
}


CATAN.ents.register('HexCorner', HexCorner);