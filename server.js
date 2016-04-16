var express = require('express');
var cors = require('cors');
var pg = require('pg');

var app = express();
app.use(cors());

var PORT = 12000;
var conString = "postgres://ajwells:ajwells@localhost:63333/ajwells_company";

app.get('/memberlist', function(req, res) {
	var query = 'select * from employee';
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/images/:name', function(req, res) {
	var file = req.params.name;
	var path = __dirname + '/images/matthew.png';
	res.sendFile(path);
});

app.listen(PORT, function() {
	console.log('Server listening on port:', PORT);
});

function fetch(query) {
	return new Promise(function(resolve, reject) {
		pg.connect(conString, function(err, client, done) {
			if (err) return reject(err);

			client.query(query, function(error, result) {
				done();
				if (error) return reject(error);
				resolve(result);
			});
		});
	});
}

