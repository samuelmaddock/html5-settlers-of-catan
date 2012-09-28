/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

var HexEdge = function() {
	this.create();

	this.modelpath = "models/road.js";
	this.Building = BUILDING_ROAD;
	
	this.AdjacentTiles = [];
	this.AdjacentEdges = [];
	this.AdjacentCorners = [];
};

HexEdge.prototype = CATAN.ents.create('BaseEntity');

HexEdge.prototype.canBuild = function(ply) {
	if(this.hasOwner()) return false;

	// Can build near adjacent corner
	var corners = this.getAdjacentCorners();
	for(var i in corners) {
		var corner = corners[i];
		if(ply.isOwner(corner)) return true;
	}

	// Can build near adjacent edge
	var edges = this.getAdjacentEdges();
	for(var i in edges) {
		var edge = edges[i];
		if(ply.isOwner(edge)) return true;
	}

	return false;
}

HexEdge.prototype.setupMesh = function() {
	this.Mesh = new THREE.Mesh(
		//new THREE.CubeGeometry(40,12,12),
		CATAN.AssetManager.get(this.modelpath),
		new THREE.MeshLambertMaterial({ opacity: 0 })
	);
	
	this.Mesh.position = this.position;
	this.Mesh.rotation = this.angle;
	this.Mesh.Parent = this;

	CATAN.Game.scene.add( this.Mesh );
}

if(CLIENT) {
	HexEdge.prototype.setup = function(data) {
		this._setup(data);
		this.setAngle(data.ang);
		this.setupMesh();
	}
}

CATAN.ents.register('HexEdge', HexEdge);