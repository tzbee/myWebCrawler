var getContent = require("./crawlerUtil").getContent;
var getSelector = require("./crawlerUtil").getSelector;
var fs = require('fs');
var url = require('url');

var DIR = "./webUnits/";

module.exports.factory = function(uri, callback) {

	var formatURL = function(url) {
		return url.replace(/\/|:|\.|\?|=|&|%/gi, '');
	}

	var wu =  {
		"id": formatURL(uri),
		"domain": uri,
		"operations": {}
	};

	getContent(uri, 'a', 

		//When content is retrieved
		function(error, content) {
			if(!error) {
				for (var i = 0; i < content.length; i++) {
					var urlSelector = content[i];
					wu.operations[i] = urlSelector;
				};

				console.log('Web unit created');
				callback(wu);
			}
		}, 

		//What to do with each jQuery element found
		function($, $e) {
			return getSelector($e);
		});
};


module.exports.writeWUToFile = function (wu) {
	var path = DIR + wu.id + ".json";
	var jsonWU = JSON.stringify(wu, null, 4);

	fs.writeFile(path, jsonWU, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	}); 
}