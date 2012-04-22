/**
 * @author Samuel Maddock / http://samuelmaddock.com/
 */
 
CatanPlayer = function() {

	this.Id = -1;
	this.Address = undefined;

	this.Name = "Player";
	this.VP = 0;

	this.Buildings = []

	/*this.Inventory = {
		Resources = new Array(NUM_RESOURCES);
	}*/

}

CatanPlayer.prototype.getID = function() {
	return this.Id;
}

CatanPlayer.prototype.getName = function() {
	return this.Name;
}
	
CatanPlayer.prototype.getNumResource = function(RESOURCE_ENUM) {
	return ( this.Inventory.Resources[RESOURCE_ENUM] !== undefined ) ? this.Inventory.Resources[RESOURCE_ENUM] : 0
}

CatanPlayer.prototype.hasResources = function(RESOURCE_ENUM, amount) {
	return this.getResource(RESOURCE_ENUM) >= amount;
}

CatanPlayer.prototype.giveResource = function(RESOURCE_ENUM, amount) {
	this.Inventory.Resources[RESOURCE_ENUM] += ( amount !== undefined ? amount : 1);
}


CatanPlayer.prototype.getBuildings = function() {
	return this.Buildings;
}

CatanPlayer.prototype.setOwnership = function(building) {
	building.Color = this.Color
	this.Buildings.push(building)
}

CatanPlayer.prototype.hasOwnership = function(building) {
	for(i in this.Buildings) {
		var b = this.Buildings[i]
		if (b.Id == building.Id && b.Building == building.Building) {
			return true
		}
	}
}


/* --------------------------------------------
	Player server module
-------------------------------------------- */
exports.List = []

exports.getAll = function() {
	return this.List;
}

exports.getNumberPlayers = function() {
	return this.List.length
}

exports.getByID = function(id) {
	for(i in this.List) {
		var ply = this.List[i]
		if (ply.getID() == id) {
			return ply
		}
	}
}

exports.getByName = function(name) {
	for(i in this.List) {
		var ply = this.List[i]
		if (ply.getName() == name) {
			return ply
		}
	}
}

exports.Connect = function(socket,io) {
	var ply = new CatanPlayer()
	ply.Id = socket.id
	ply.Address = socket.handshake.address

	ply.Name += " " + (this.List.length + 1)
	ply.Color = Math.round( 0xffffff * Math.random() )

	// Don't send the address later on, this could be exploited
	socket.broadcast.emit('PlayerJoin', { Name: ply.Name, Id: ply.Id, Address: ply.Address });

	ply.Index = this.List.push(ply)
}

exports.Disconnect = function(id, io) {

	var ply = this.getByID(id)
	if(typeof ply == 'undefined') return;

	// Remove building ownership
	for(i in ply.Buildings) {
		var building = ply.Buildings[i]
		building.Owner = -1
		io.sockets.emit('BuildingReset', { id: building.Id, building: building.Building })

		delete building
	}

	console.log("Removed " + ply.Name)
	io.sockets.emit('PlayerLeave', { Name: ply.Name, Id: ply.Id });

	this.List.splice(ply.Index-1,1);

}

exports.OnChat = function(io, socket, data) {

	var ply = this.getByID(socket.id)
	if(typeof ply == 'undefined') return;

	var name = ply.getName()
	var text = data.text
	var col = ply.Color.toString(16)

	console.log("PLAYER COLOR: " + col)

    io.sockets.emit('ChatReceive', { Name: name, Text: text, Color: col })

}