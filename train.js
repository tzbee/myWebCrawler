'use strict';

var brain = require('brain');
var net = new brain.NeuralNetwork();
var tzbUtil = require('./lib/crawlerUtil');

var DIR = './lib/webUnits/';

function toTrainingData(data) {
	return { input: data.occ, output: [data.out] };
}

var trainingData = [];

var inputSize = 16;

for (var i = 0; i < inputSize; i++) {
	trainingData.push(toTrainingData(require(DIR + i + '.json')));
}

console.log('training..');

net.train(trainingData, {
	iterations: 2000000, 
	errorThresh: 0.05,
  	log: true,
 	logPeriod: 10,
 	learningRate: 0.9
});

tzbUtil.writeJSON(net.toJSON(), 'net.json', function() {
	console.log('Trained data saved');
});