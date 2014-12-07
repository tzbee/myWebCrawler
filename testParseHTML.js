'use strict';

var crawlerUtil = require('./crawlerUtil.js');


var htmlDocument = '<html><body>wgffewef jewgfewuf<script>hahahahahahaha</script><body></html>';
var output = crawlerUtil.parseHTML(htmlDocument);

console.log(output);