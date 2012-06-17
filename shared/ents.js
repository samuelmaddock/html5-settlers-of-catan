/* ents Module */
CATAN.ents = {}

CATAN.ents.registered = [];
CATAN.ents.spawned = [];

CATAN.ents.create = function(name) {
	var ent = this.registered[name];
	if(ent) {
		var e = new ent();
		e.name = name;
		CATAN.ents.spawned.push(e);
		return e;
	}
};

CATAN.ents.register = function(name,ent) {
	this.registered[name] = ent;
};

CATAN.ents.getAll = function() {
	return this.spawned;
}

CATAN.ents.getById = function(id) {
	for(var i in this.spawned) {
		if(this.spawned[i].getEntId() == id) {
			return this.spawned[i];
		}
	}
}

CATAN.ents.getByName = function(name) {
	var entities = [];

	if(typeof name == "string") {
		name = [name];
	}

	for(var i in this.spawned) {
		if( name.indexOf(this.spawned[i].name ) != -1) {
			entities.push(this.spawned[i]);
		}
	}

	return entities;
}

CATAN.EntityCount = 0;