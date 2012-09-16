CATAN.AssetManager = (function(CATAN) {

	var module = {}

	/**
	 * Module Fields
	 */

	module.cache = {};
	module.downloadQueue = [];
	module.successCount = 0;
	module.errorCount = 0;

	module.jsonLoader = new THREE.JSONLoader( true );

	/**
	 * Module Methods
	 */

	module.queue = function(path) {
		if(typeof path === 'object') {
			for (var i = 0; i < path.length; i++) {
				this.downloadQueue.push(path[i]);
			}
		} else {
			this.downloadQueue.push(path);
		}
	}

	module.loadAll = function(callback) {
		if (this.downloadQueue.length === 0) {
			callback();
		}

		for (var i = 0; i < this.downloadQueue.length; i++) {
			var path = this.downloadQueue[i];
			var ext = path.split('.').pop();
			if(ext == 'js') {
				this.loadModel(path,callback);
			} else {
				this.loadImage(path,callback);
			}
		}
	}

	module.loadImage = function(path, callback) {
		/*var img = new Image();
		var self = this;

		img.addEventListener("load", function() {
			self.successCount++;
			if (self.isDone()) { callback(); }
		}, false);

		img.addEventListener("error", function() {
			self.errorCount++;
			if (self.isDone()) { callback(); }
		}, false);

		img.src = path;*/

		var img = THREE.ImageUtils.loadTexture(path);
		this.cache[path] = img;
		this.successCount++;
	}

	module.loadModel = function(path, callback) {
		var self = this;
		this.jsonLoader.load(path, function(geometry) {
			self.cache[path] = geometry;
			self.successCount++;
			if (self.isDone()) { callback(); }
		});
	}

	module.getProgress = function() {
		return (this.successCount + this.errorCount) / this.downloadQueue.length;
	}

	module.isDone = function() {
		return (this.downloadQueue.length == this.successCount + this.errorCount);
	}

	module.get = function(path) {
		return this.cache[path];
	}

	return module;

}(CATAN));