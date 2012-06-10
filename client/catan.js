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
};