/**
 * @author samuelmaddock / http://samuelmaddock.com/
 */

var CATAN = CATAN || { VERSION: '1.00' };

CATAN.getVersion = function() {
	return this.VERSION;
}

if(typeof exports !== 'undefined') {
	global.CATAN = CATAN;
	global.SERVER = true;
	global.CLIENT = false;
	require('./enums.js');
} else {
	SERVER = false;
	CLIENT = true;
}