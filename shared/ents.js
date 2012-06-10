/* ents Module */
CATAN.ents = {}

CATAN.ents.registered = [];
CATAN.ents.spawned = [];

CATAN.ents.create = function(name) {
	var ent = this.registered[name];
	if(ent) {
		var e = new ent();
		CATAN.ents.spawned.push(e);
		return e;
	}
};

CATAN.ents.register = function(name,ent) {
	this.registered[name] = ent;
};

CATAN.EntityCount = 0;