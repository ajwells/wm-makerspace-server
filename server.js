var express = require('express');
var cors = require('cors');
var pg = require('pg');

var app = express();
app.use(cors());

var PORT = 12000;
var conString = "postgres://ktdu:ktdu@localhost:63333/ktdu_makerspace";

app.get('/memberlist', function(req, res) {
	var query = 'select member_id as id, name, count(session_id) as visit, max(time_in) as last_visit from member natural join (visited natural join sessions) group by member_id;';
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/member/:type/:id', function(req, res) {
	var type = req.params.type;
	var id = req.params.type;
	var query;
	switch(type) {
		case 'skills':
			query = 'select skill from skilled_in where member_id = ' + id + ';'
		case 'certs':
			query = 'select certificate from certified_in where member_id = ' + id + ';'
		case 'interests':
			query = 'select interest from interested_in where member_id = ' + id + ';'
		case 'projects':
			query = 'select projects from works_on natural join projects where member_id = ' + id + ';'
			
	}
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

