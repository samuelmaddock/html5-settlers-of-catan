/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
var HexCorner = function() {

	this.create();
	this.setType(BUILDING_SETTLEMENT);
	
	this.AdjacentTiles = [];
	this.AdjacentEdges = [];
	this.AdjacentCorners = [];

	this.build = function(ply) {
		if(this.hasOwner()) {
			// Set to city
			this.Building = BUILDING_CITY;
			if(CLIENT) this.setupMesh();
		} else {
			this.setOwner(ply);
		}
	}

};

HexCorner.prototype = CATAN.ents.create('BaseEntity');

HexCorner.prototype.setupMesh = function() {
	var path = CATAN.getSchema().Buildings[this.getType()].url;

	if(this.isCity()) {
		CATAN.Game.scene.remove(this.Mesh);
		this.Mesh = null;
	}

	this.Mesh = new THREE.Mesh(
		//new THREE.CubeGeometry(25,25,25),
		CATAN.AssetManager.get(path),
		new THREE.MeshLambertMaterial({opacity: 0})
	);

	this.Mesh.position = this.position;
	this.Mesh.Parent = this;

	CATAN.Game.scene.add(this.Mesh);
}

HexCorner.prototype.canBuild = function(ply) {
	if(this.hasOwner()) {
		if(this.getOwner() != ply) return false;
		if(this.getOwner() == ply && this.isSettlement()) {
			return true;
		}
	}

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