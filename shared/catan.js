var CATAN = {
	Schema: "Classic",	// Default schema to Classic
	Schemas: []			// Array of schemas
}

CATAN.setSchema = function(schema) {
	this.Schema = (schema !== undefined) ? schema : "Classic";
}

CATAN.getSchema = function() {
	return this.Schemas[this.Schema];
}

if(typeof exports !== 'undefined') {
	module.exports = CATAN
}
