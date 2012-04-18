exports.Schema = "Classic"
exports.Schemas = []

exports.setSchema = function(schema) {
	exports.Schema = (schema !== undefined) ? schema : "Classic";
}

exports.getSchema = function() {
	return this.Schemas[this.Schema];
}