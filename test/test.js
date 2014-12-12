'use strict';

var brain = require('brain');
var net = new brain.NeuralNetwork();
var tzbUtil = require('../lib/crawlerUtil');
var parseHTML= tzbUtil.parseHTML;

var html = '<html><body><h1>hiiiiiiiiiiiiiiiii</h1>regrger<h2>mmmmmh</h2></body></html>';


console.log(parseHTML(html));
