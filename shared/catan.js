var CATAN = CATAN || { VERSION: '1.00' };

CATAN.Schemas = [];

CATAN.getVersion = function() {
	return this.VERSION;
}

if(typeof exports !== 'undefined') {
	global.CATAN = CATAN;
}