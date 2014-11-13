var Crawler = require("crawler");
var WEBUNIT_DIR = './webUnits/';

var getContent = function(url, selector, mainCallback, getElementProperty){
	var selectorToUse = selector ? selector : 'a';
	var elementPropertyToUse = getElementProperty ? getElementProperty : function($, e){
		return $(e).attr('href');
	};

	var crawler = new Crawler({
				callback: function(error, response, $){
					if(error) {
						mainCallback(error);
					} else if($){
						var contentBlock = { "url": response.uri.toString(), "content" : [] };	

						$(selector).each(function(index, a){
							contentBlock.content.push( elementPropertyToUse($, a));
						});

						mainCallback(null, contentBlock);
					}
				}
			});

			// Start crawling
			crawler.queue(url);
};

function callWebUnit(name, operation, callback) {
	var webUnit = require(WEBUNIT_DIR + name);
	webUnit.operations[operation](callback);
}

module.exports.getContent = getContent;
module.exports.callWebUnit = callWebUnit;