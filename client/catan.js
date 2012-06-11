CATAN.Schemas = [];
CATAN.Players = [];
CATAN.Entities = [];

CATAN.getSchema = function() {
	return this.Schemas["Classic"]; // static for now
}

CATAN.getEntById = function(id) {
	for(var i in this.Entities) {
		if(this.Entities[i].getEntId() == id) {
			return this.Entities[i];
		}
	}
}

CATAN.addPlayer = function(data, bChat) {
	var ply = new CATAN.Player();
	ply.id = data.id;
	ply.name = data.name;
	ply.address = data.address;
	ply.color = data.color;

	this.Players.push(ply);

	if(ply.id == this.server.socket.sessionid) {
		CATAN.LocalPlayer = ply;
	} else if(bChat) {
		this.chat.AddLine(ply.getName() + " has joined the game (" + ply.address.address + ":" + ply.address.port + ")");
	}

	this.Game.players.refresh();
}

CATAN.removePlayer = function(ply) {

	for(var i in this.Players) {
		if(this.Players[i].getID() == ply.getID()) {
			this.Players.splice(i,1);
		}
	}

	this.Game.players.refresh();

}

CATAN.getPlayerById = function(id) {
	for(var i in this.Players) {
		if(this.Players[i].getID() == id) {
			return this.Players[i];
		}
	}
}

CATAN.create = function(name, data) {

	var ent = this.ents.create(name);
	ent.entid = data.id;
	ent.setPosition(data.pos);

	if(name == 'HexTile') {

		ent.setResource(data.resource);
		ent.setToken(data.token);

		if(data.robber == true) {
			ent.setRobber();
		}

	} else if(name == 'HexCorner') {

		// do nothing

	} else if(name == 'HexEdge') {

		ent.setAngle(data.ang);

	}

	ent.setupMesh();
	this.Entities.push(ent);

	return ent;

}

CATAN.mouseRayTrace = function( event ) {

	//if(onTurn != true) return; // TODO: prevent tracing while not client's turn

	var camera = CATAN.Game.camera;
	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

	CATAN.Game.controls.projector.unprojectVector( vector, CATAN.Game.camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
	var intersects = ray.intersectObjects( CATAN.Game.collisionObjects );

	var hitObject = intersects[0];
	if(hitObject) {
	
		var ent = hitObject.object.Parent;

		if ((ent.Building !== undefined) && (ent.visible == true)) {
			return ent;
		};
		
		//CATAN.Game.lastSelection = hitObject.object;
		
	};

};

CATAN.onEntityHover = function(ent) {}

CATAN.onEntityHoverStart = function(ent) {

	if(!ent.hasOwner()) {
		$('body').css('cursor','pointer');

		ent.Collision.material = new THREE.MeshBasicMaterial({
			color: CATAN.LocalPlayer.getColor(),
			opacity: 0.88,
			transparent: true
		});
	}

}

CATAN.onEntityHoverEnd = function(ent) {

	$('body').css('cursor','default');

	if(!ent.hasOwner()) {
		ent.Collision.material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			opacity: 0.33,
			transparent: true
		});
	}

}