var Crawler = require("crawler");
var fs = require('fs');
var url = require('url');


function getContent(url, selector, mainCallback, getElementProperty) {
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

				$(selector).each(function(index, a) {
					content.push(elementPropertyToUse($, $(a)));
				});

				mainCallback(null, content);
			}
		}
	});

	// Start crawling
	crawler.queue(url);
};

function getSelector($e) {
    var path, node = $e;
    
    while (node.length) {
        var realNode = node.get(0), name = realNode.tagName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var sameTagSiblings = parent.children(name);
        if (sameTagSiblings.length > 1) { 
            allSiblings = parent.children();
            var index = allSiblings.index(realNode) + 1;
            if (index > 1) {
                name += ':nth-child(' + index + ')';
            }
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};

function factory(uri, callback) {

	if(!uri) callback(new Error('no url was specified when creating wu'));

	var formatURL = function(url) {
		return url.replace(/\/|:|\.|\?|=|&|%|#/gi, '');
	}

	var wu =  {
		"id": formatURL(uri),
		"url": uri,
		"operations": {}
	};

	getContent(uri, 'a', 

	//When content is retrieved
	function(error, content) {
		if(!error) {
			for (var i = 0; i < content.length; i++) {
				wu.operations[i] = content[i];
			};

			console.log('Web unit created');
			callback(null, wu);
		} else {
			callback(error);
		}
	}, 

	//What to do with each jQuery element found
	function($, $e) {
		return { 
			"selector" : getSelector($e), 
			"href": $e.attr('href') ? url.resolve(uri, $e.attr('href')) : '' 
		};
	});
};

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
};

// Crawl the url and write information to json files
function writeAndCrawl(url, depth) {
	if(depth === 0) return;

	factory(url, function(wu) {
		save(wu);

		for(key in wu.operations)  {
			var href = wu.operations[key].href;
			if(href) writeAndCrawl(href, depth-1);
		}
	});
};  


module.exports.getContent = getContent;
module.exports.factory = factory;
module.exports.save = save;
module.exports.writeAndCrawl = writeAndCrawl;