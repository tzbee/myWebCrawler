'use strict';

var crawlerUtil = require('./lib/crawlerUtil.js');

var data = require('./resources/inputs.json');

for(var url in data) {
	crawlerUtil.createWU(url, data[url], function(wu) {
		crawlerUtil.save(wu);
	});
}

