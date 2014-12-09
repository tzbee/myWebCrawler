'use strict';

var netData = require('./resources/net.json');

var brain = require('brain');
var net = new brain.NeuralNetwork();

var tzbUtil = require('./lib/crawlerUtil');

net.fromJSON(netData);

var url = '';

tzbUtil.createWU(url, 0, function(wu) {
	console.log(wu.occ);
	var output = net.run(wu.occ);
	console.log(output);
});

