'use strict';

var Crawler = require('crawler');
var validUrl = require('valid-url');
var fs = require('fs');
var prompt = require('prompt');
var cheerio = require('cheerio');
var request = require('request');
var _ = require('lodash');
var natural = require('natural');
var contentFilter = require('./contentFilter');
var parseHTML = contentFilter.parseHTML;
var tokenizeAndFilter = contentFilter.tokenizeAndFilter;
var path = require('path');

var stemmer = natural.PorterStemmer;
stemmer.attach();

var DIR = './resources/webUnits/';

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
				mainCallback(null, $(selectorToUse).map(function(index, a) {
					return elementPropertyToUse($, $(a));
				}).get());
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


function writeJSON(data, outputFilename, callback) {
	fs.writeFile(outputFilename, JSON.stringify(data, null, 2), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log('JSON saved to ' + outputFilename);
	    }

	    if (callback) callback();
	});
}


var counter = 0;

function save(wu, suffix) {

	var saveWU = function() {
		writeJSON(wu, DIR + counter++ + (suffix ? suffix: '') + '.json');
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


function manualPrompt(keys, callback) {

	prompt.get(keys, function (err, result) {

		var output = {};

		for (var i = 0; i < keys.length; i++) {
			output[keys[i]] = result[keys[i]] === 'true' ? 1 : 0;
		}

		callback(output);
	});
}


function trainerPrompt(keys, callback) {
	
	//
	// Start the prompt
	//

	prompt.start();

	prompt.get('manual', function (err, result) {
		if(result.manual === 'true') {
			manualPrompt(keys, callback);
		} else {
			var output = {};

			for (var i = 0; i < keys.length; i++) {
				output[keys[i]] = 0;
			}

			callback(output);
		}
	});
}



function urlToSemantics(url, callback) {
	request(url, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var parsedHTML = parseHTML(body);

			var result = _.countBy(tokenizeAndFilter(parsedHTML));
			var values = _.last(_.sortBy(_.uniq(_.values(result))), 2);
			var threshold = values[0] !== null ? values[0] : 0;

			result = _.omit(result, function(value) {
				return value <= threshold;
			});
			callback(result);
		}
	});
}


function createWU(url, output, callback) {

	urlToSemantics(url, function(occ) {

		for(var key in occ){
			occ[key] = occ[key] / 1000;
		}

		callback(
			{
				url: url,
				occ: occ,
				out: output
			}
		);
	});
}


function getBookmarks(callback) {

	fs.readFile(path.resolve(__dirname, '../resources/bookmarks.html'), 'utf-8', function(err, data) {
		if(!err) {
			var $ = cheerio.load(data);
			callback($('a').map(function(i, a) {
				return $(a).attr('href');
			}).get());
		} else {
			console.log(err);
		}
	});
}


module.exports.trainerPrompt = trainerPrompt;
module.exports.createWU = createWU;
module.exports.save = save;
module.exports.tokenizeAndFilter = tokenizeAndFilter;
module.exports.parseHTML = parseHTML;
module.exports.writeJSON = writeJSON;
module.exports.getBookmarks = getBookmarks;
module.exports.urlToSemantics = urlToSemantics;