var express = require('express');
var cors = require('cors');
var pg = require('pg');

var app = express();
app.use(cors());

var PORT = 12000;
var conString = "postgres://ktdu:ktdu@localhost:63333/ktdu_makerspace";

app.get('/time/:type', function(req, res) {
	var type = req.params.type;
	var query = "select time_in, time_out \
			from visited natural join sessions \
			where member_id IN ( \
				(select member_id as id \
				from skilled_in \
				where skill = \'"+ type +"\') \
			union \
			(select member_id as id \
			from certified_in \
			where certificate = \'"+ type +"\'));";
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/interestlist', function(req, res) {
	var query = 'select distinct interest \
			from interested_in;';
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/makerspace/:type', function(req, res) {
	var type = req.params.type;
	var query;
	switch(type) {
		case 'current':
			query = 'select member_id as id, name \
				from member natural join (visited natural join sessions) \
				where time_out = NULL;';
			break;
		case 'notcurrent':
			query = '(select member_id as id, name \
					from visited natural join member) \
				except \
				(select member_id as id, name \
					from member natural join (visited natural join sessions) \
					where time_out = NULL);';
			break;
	}
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/memberlist', function(req, res) {
	var query = 'select member_id as id, name, count(session_id) as visit, max(time_in) as last_visit \
			from member natural join (visited natural join sessions) \
			group by member_id;';
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/member/:type/:id', function(req, res) {
	var type = req.params.type;
	var id = req.params.id;
	var query;
	switch(type) {
		case 'skills':
			query = 'select skill \
				from skilled_in \
				where member_id = ' + id + ';';
			break;
		case 'certs':
			query = 'select certificate \
				from certified_in \
				where member_id = ' + id + ';';
			break;
		case 'interests':
			query = 'select interest \
				from interested_in \
				where member_id = ' + id + ';';
			break;
		case 'projects':
			query = 'select project_name \
				from works_on natural join projects \
				where member_id = ' + id + ';';
			break;
			
	}
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/projectlist', function(req, res) {
	var query = 'select project_id as id, project_name as name, budget, spent \
			from projects;';
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/project/:type/:id', function(req, res) {
	var type = req.params.type;
	var id = req.params.id;
	var query;
	switch(type) {
		case 'members':
			var query = 'select member_id as id, name \
					from member natural join (works_on natural join projects) \
					where project_id =' + id + ';';
			break;
	}
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/counts/:type', function(req, res) {
	var type = req.params.type;
	var query;
	switch(type) {
		case 'interests':
			var query = 'select count(i.interest) as count, int.interest as item\
					from interested_in as i, interested_in as int \
					where i.member_id = int.member_id and i.interest = int.interest \
					group by int.interest;';
			break;
		case 'certifications':
			var query = 'select count(c.certificate) as count, ce.certificate as item\
					from certified_in as c, certified_in as ce \
					where c.member_id = ce.member_id and c.certificate = ce.certificate \
					group by ce.certificate;';
			break;
		case 'skills':
			var query = 'select count(s.skill) as count, sk.skill as item\
					from skilled_in as s, skilled_in as sk \
					where s.member_id = sk.member_id and s.skill = sk.skill \
					group by sk.skill;';
			break;
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
				resolve(result.rows);
			});
		});
	});
}

