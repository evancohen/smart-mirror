(function(window){
    var CallbackManager = function() {
	var currentId = 0;
	var callbackPool = {};
	this.add = function(clb) {
	    var id = currentId;
	    callbackPool[id] = clb;
	    currentId++;
	    return id;
	};
	this.get = function(id) {
	    if (callbackPool.hasOwnProperty(id)) {
		var clb = callbackPool[id];
		delete callbackPool[id];
		return clb;
	    }
	    return null;
	};
    };
    window.CallbackManager = CallbackManager;
})(window);
