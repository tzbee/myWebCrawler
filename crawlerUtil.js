'use strict';

var Crawler = require('crawler');
var validUrl = require('valid-url');
var fs = require('fs');
var prompt = require('prompt');
var cheerio = require('cheerio');
var request = require('request');
var _ = require('lodash');
var natural = require('natural');
var stemmer = natural.PorterStemmer;
stemmer.attach();

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

function save(wu) {
	var DIR = './webUnits/';
	
	var saveWU = function() {
		writeJSON(wu, DIR + counter++ + '.json');
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


function getBookmarks(callback) {

	fs.readFile(__dirname + '/bookmarks.html', 'utf8', function(err, html) {

		var $ = cheerio.load(html);

		callback($('a').map(function(i, e) {
			return $(e).attr('href');
		}).get());

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


function parseHTML(htmlDocument) {
	var $ = cheerio.load(htmlDocument);
	$('script').remove();
	return $(':root').text();
}

function tokenizeAndFilter(text) {
	return text
		   .tokenizeAndStem()
		   .filter(function(token) {
				return isNaN(token);
		    })
		   .filter(function(token) {
		   		return token.length>2;
		   });
}


function urlToSemantics(url, callback) {
	request(url, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var result = _.countBy(tokenizeAndFilter(parseHTML(body)));
			callback(result);
		}
	});
}


function createWU(url, output, callback) {

	urlToSemantics(url, function(occ) {
		callback(
			{
				url: url,
				occ: occ,
				out: output
			}
		);
	});
}

module.exports.getBookmarks = getBookmarks;
module.exports.trainerPrompt = trainerPrompt;
module.exports.createWU = createWU;
module.exports.save = save;
module.exports.tokenizeAndFilter = tokenizeAndFilter;
module.exports.parseHTML = parseHTML;

