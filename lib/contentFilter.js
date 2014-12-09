'use strict';

var cheerio = require('cheerio');

function parseHTML(htmlDocument) {
  var $ = cheerio.load(htmlDocument);
  $('script').remove();

  var textContent = [ 'h1', 'h2', 'h3', 'title' ].map(function(tag) {
    return $(tag).text();
  }).join(', ');

  return textContent;
}


function tokenizeAndFilter(text) {
  return text
       .tokenizeAndStem()
       .filter(function(token) {
        return isNaN(token);
        })
       .filter(function(token) {
          return token.length > 2;
       });
}

module.exports.parseHTML = parseHTML;
module.exports.tokenizeAndFilter = tokenizeAndFilter;