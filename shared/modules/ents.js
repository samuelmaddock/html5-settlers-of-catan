CATAN.ents = (function(CATAN) {

	var module = {}

	/**
	 * Module Fields
	 */

	module.registered = [];
	module.spawned = [];

	/**
	 * Module Methods
	 */

	module.create = function(name) {
		var ent = this.registered[name];
		if(ent) {
			var e = new ent();
			e.name = name;
			this.spawned.push(e);
			return e;
		}
	}

	module.get = function(name) {
		return this.registered[name];
	}

	module.register = function(name,ent) {
		this.registered[name] = ent;
	}

	module.getAll = function() {
		return this.spawned;
	}

	module.getById = function(id) {
		for(var i in this.spawned) {
			if(this.spawned[i].getEntId() == id) {
				return this.spawned[i];
			}
		}
	}

	module.getByName = function(name) {
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

	return module;

}(CATAN));

CATAN.EntityCount = 0;