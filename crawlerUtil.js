'use strict';

var Crawler = require('crawler');
var fs = require('fs');
var url = require('url');
var validUrl = require('valid-url');

/* Get content from a source url or plain html

	* source: String,
		URL to crawl or plain html 
	* mainCallback: Function(error, content),
		The main call back function returning the content as an Array
	* selector: String [optional],
		JQuery type selector defining which DOM element to select
		(default: a)
	* getElementProperty: Function($, $e) [optional],
		Callback defining which data to get from each selected DOM element
		(default: href attribute) */

function getContent(source, mainCallback, selector, getElementProperty) {
	var selectorToUse = selector ? selector : 'a';
	var elementPropertyToUse = getElementProperty ? getElementProperty : function($, $e) {
		return $e.attr('href');
	};

	var crawler = new Crawler({
		callback: function(error, response, $) {
			if(error) {
				mainCallback(error);
			} else if($) {
				var content = []; 

				$(selectorToUse).each(function(index, a) {
					content.push(elementPropertyToUse($, $(a)));
				});

				mainCallback(null, content);
			}
		}
	});


	// If not a valid URL, assume it's plain html
	crawler.queue(validUrl.isUri(source) ? source : { html: source });

}

function getSelector($e) {
    var path, node = $e;
    
    while (node.length) {
        var realNode = node.get(0), name = realNode.tagName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var sameTagSiblings = parent.children(name);
        if (sameTagSiblings.length > 1) { 
            var allSiblings = parent.children();
            var index = allSiblings.index(realNode) + 1;
            if (index > 1) {
                name += ':nth-child(' + index + ')';
            }
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
}

function factory(uri, callback) {

	if(!uri) callback(new Error('no url was specified when creating wu'));

	var formatURL = function(url) {
		return url.replace(/\/|:|\.|\?|=|&|%|#/gi, '');
	};

	var wu =  {
		"id": formatURL(uri),
		"url": uri,
		"operations": {}
	};

	getContent(uri, 

	//When content is retrieved
	function(error, content) {
		if(!error) {
			for (var i = 0; i < content.length; i++) {
				wu.operations[i] = content[i];
			}

			console.log('Web unit created');
			callback(null, wu);
		} else {
			callback(error);
		}
	}, 'a', 

	//What to do with each jQuery element found
	function($, $e) {
		return { 
			"selector" : getSelector($e), 
			"href": $e.attr('href') ? url.resolve(uri, $e.attr('href')) : '' 
		};
	});
}

function save(wu) {
	var DIR = "./webUnits/";
	
	var saveWU = function() {
		var path = DIR + wu.id + ".json";
		var jsonWU = JSON.stringify(wu, null, 4);

		fs.writeFile(path, jsonWU, function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("Web unit saved");
			}
		});
	};

	fs.exists(DIR, function (exists) {
		if (!exists) {
			fs.mkdir(DIR, function(err) {
				if(!err) saveWU();
			});
		} else {
			saveWU();
		}
	});
}

// Crawl the url and write information to json files
function writeAndCrawl(url, depth) {
	if(depth === 0) return;

	factory(url, function(error, wu) {
		save(wu);

		for(var key in wu.operations)  {
			var href = wu.operations[key].href;
			if(href) writeAndCrawl(href, depth-1);
		}
	});
}


module.exports.getContent = getContent;
module.exports.getSelector = getSelector;
module.exports.factory = factory;
module.exports.save = save;
module.exports.writeAndCrawl = writeAndCrawl;