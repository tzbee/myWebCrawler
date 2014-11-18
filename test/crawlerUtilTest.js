var cheerio = require('cheerio');
var assert = require("assert");
var request = require('request');

var crawlerUtil = require('../crawlerUtil');
var getSelector = crawlerUtil.getSelector;
var getContent = crawlerUtil.getContent;


var testFunction = function(document, done) {
	var $ = cheerio.load(document);
	var $a = $('a');

	$a.each(function(index, e) {
		var $e = $(e);
		var selector = getSelector($e);

		assert.equal($(selector)[0], $e[0]);
	});

	done();
};

var remoteTest = function(url, done) {
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
	    	testFunction(body, done);
		}
	});
};

describe('Selector test', function() {
    
    it('hardcoded html with only one link', function(done) {
      
    	var html = 	'<html>' + 
						'<head>' + '</head>' + 
						'<body>' + 
							'<h1>' + 'Hello' + '</h1>' + 
							'<a class="YES greeting" href="http://localhost:8000">' +
								'Welcome' +
							'</a>' +
						'</body>' + 
					'</html>';

		testFunction(html ,done);
	});

	it('hardcoded html with 2 links', function(done) {
      
    	var html = 	'<html>' + 
						'<head>' + '</head>' + 
						'<body>' + 
							'<h1>' + 'Hello' + '</h1>' + 
							'<a class="YES greeting" href="http://localhost:8000">' +
								'Welcome' +
							'</a>' +
							'<a class="NO greeting" href="http://localhost:8000">' +
								'HEOO' + 
							'</a>' +
						'</body>' + 
					'</html>';

		testFunction(html ,done);
	});

});

describe('getContent test', function(){
	it('should return all links from the html page', function(done) {

    	var html = 	'<html>' + 
						'<head>' + '</head>' + 
						'<body>' + 
							'<h1>' + 'Hello' + '</h1>' + 
							'<a class="YES greeting" href="http://localhost:8000">' +
								'Welcome' +
							'</a>' +
							'<a class="NO greeting" href="http://localhost:8001">' +
								'HEOO' + 
							'</a>' +
						'</body>' + 
					'</html>';

		getContent(html,  function(error, content) {
			assert.equal(null, error);
			assert.deepEqual([ "http://localhost:8000", "http://localhost:8001" ], content);
			done();
		});
	});

	it('should return the html content of the h1 tag', function(done) {

    	var html = 	'<html>' + 
						'<head>' + '</head>' + 
						'<body>' + 
							'<h1>' + 'Hello' + '</h1>' + 
							'<a class="YES greeting" href="http://localhost:8000">' +
								'Welcome' +
							'</a>' +
							'<a class="NO greeting" href="http://localhost:8001">' +
								'HEOO' + 
							'</a>' +
						'</body>' + 
					'</html>';

		getContent(html, function(error, content) {
			assert.equal(null, error);
			assert.deepEqual([ "Hello" ], content);
			done();
		}, 'h1', function($, $e) {
			return $e.html();
		});
	});
});
 