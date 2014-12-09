'use strict';

var brain = require('brain');
var net = new brain.NeuralNetwork();
var tzbUtil = require('./crawlerUtil');

var trainingData = [
	{
		input:[0, 1],
		output: [1]
	},

	{
		input:[1, 0],
		output: [0]
	},

	{
		input:[1, 1],
		output: [1]
	}
];

net.train(trainingData);

var output = net.run([0, 1]);

console.log(output);