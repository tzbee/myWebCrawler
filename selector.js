var cheerio = require('cheerio');

var html = 	'<html>' + 
				'<head>' + '</head>' + 
				'<body>' + 
					'<h1>' + 'Hello' + '</h1>' + 
					'<p class="YES greeting">Welcome</p>' + 
					'<p class="NO greeting">Helloo</p>' + 
				'</body>' + 
			'</html>';

var $ = cheerio.load(html);

$('p.greeting').each(function(index, p) {
	console.log($(p).html());				
});
						
