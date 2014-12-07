'use strict';

var crawlerUtil = require('./crawlerUtil.js');

var url = 'http://reddit.com';

crawlerUtil.createWU(url, 0, function(wu) {
	crawlerUtil.save(wu);
});
