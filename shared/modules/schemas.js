CATAN.Schemas = (function(CATAN) {

	var module = {}

	/**
	 * Module Fields
	 */

	module.list = {};

	/**
	 * Module Methods
	 */

	module.getAll = function() {
		return this.list;
	}

	module.getCount = function() {
		return this.list.length;
	}

	module.get = function(name) {
		return this.list[name];
	}

	module.register = function(name, schema) {
		this.list[name] = schema;
	}

	return module;

}(CATAN));

if(SERVER) {
	// Load schemas
	require("fs").readdirSync("shared/schemas").forEach(function(file) {
		require("../schemas/" + file);
	});
}