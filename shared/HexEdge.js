/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

if(typeof exports !== 'undefined') {
	Entity = require('./Entity.js')
}

HexEdge = function() {
	
	this.Building = BUILDING_ROAD;
	
	this.AdjacentEdges = [];
	
};

HexEdge.prototype = new Entity();
HexEdge.prototype.constructor = HexEdge;
HexEdge.prototype.super = Entity.prototype;

HexEdge.prototype.CanBuild = function(ply) {
	return true;
}

HexEdge.prototype.setup = function( orientation ) {
	
	this.position = orientation.pos;
	this.angle = orientation.ang;

	if (CLIENT) {

		this.Collision = new THREE.Mesh(
			new THREE.CubeGeometry(40,12,12),
			new THREE.MeshBasicMaterial( { opacity: 0, color: 0x000000 } )
		);
		
		this.Collision.position = this.position;
		this.Collision.rotation = this.angle;
		this.Collision.Parent = this;
		scene.add( this.Collision );
		
		collisionObjects.push( this.Collision );

	}
	
}

if(typeof exports !== 'undefined') {
	module.exports = HexEdge;
}