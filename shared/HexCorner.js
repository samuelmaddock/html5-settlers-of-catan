/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */

if(typeof exports !== 'undefined') {
	Entity = require('./Entity.js')
}
 
HexCorner = function() {
	
	this.Building = BUILDING_SETTLEMENT;
	
	this.AdjacentTiles = [];
	this.AdjacentCorners = [];
	
};

HexCorner.prototype = new Entity();
HexCorner.prototype.constructor = HexCorner;
HexCorner.prototype.super = Entity.prototype;

HexCorner.prototype.CanBuild = function(ply) {
	return true;
}

HexCorner.prototype.setup = function(pos) {

	this.position = pos;

	if (CLIENT) {

		this.Collision = new THREE.Mesh(
			new THREE.CubeGeometry(25,25,25),
			new THREE.MeshBasicMaterial({opacity: 0})
		);

		this.Collision.position = this.position;
		this.Collision.Parent = this;
		scene.add( this.Collision );
		collisionObjects.push( this.Collision );
		
	}

}

if(typeof exports !== 'undefined') {
	Entity = require('./Entity.js')
	module.exports = HexCorner;
}