/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

var HexEdge = function() {
	this.create();
	this.setType(BUILDING_ROAD);

	this.modelpath = "models/road.js";
	
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
		if(corner.hasOwner() && corner.getOwner() == ply) {
			return true;
		}
	}

	// Can build near adjacent edge
	var edges = this.getAdjacentEdges();
	for(var i in edges) {
		var edge = edges[i];
		if(edge.hasOwner() && edge.getOwner() == ply) {
			return true;
		}
	}

	return false;
}

HexEdge.prototype.setupMesh = function() {
	var path = CATAN.getSchema().Buildings[this.getType()].url;

	this.Mesh = new THREE.Mesh(
		//new THREE.CubeGeometry(40,12,12),
		CATAN.AssetManager.get(path),
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
		this.setupMesh();
	}
}

CATAN.ents.register('HexEdge', HexEdge);