var express = require('express');
var cors = require('cors');
var pg = require('pg');

var app = express();
app.use(cors());
var PORT = 12000;

var conString = "postgres://ajwells:ajwells@localhost/ajwells_company";

app.get('/test', function(req, res) {
	fetch('test')
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.listen(PORT, function() {
	console.log('Server listening on port:', PORT);
});

function fetch(type) {
	return new Promise(function(resolve, reject) {
		pg.connect(conString, function(err, client, done) {
			if (err) return reject(err);
			switch (type) {
				case 'test':
					var query = 'select * from employee';
			}
			client.query(query, function(error, result) {
				done();
				if (error) return reject(error);
				resolve(result);
			});
		});
	});
}

