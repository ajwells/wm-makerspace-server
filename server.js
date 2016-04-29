var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();
app.use(cors());
app.use(bodyParser.json());

var PORT = 13000;
var conString = "postgres://ktdu:ktdu@localhost:5432/ktdu_makerspace";

app.get('/day', function(req, res) {
	var query = "select extract(dow from time_in) as time_in, extract(dow from time_out) as time_out \
			from sessions;";
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/member/time/:id', function(req, res) {
	var id = req.params.id;
	var query = "select extract(hour from time_in) as time_in, extract(hour from time_out) as time_out \
			from visited natural join sessions \
			where member_id = " + id + ";";
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/time/:type', function(req, res) {
	var type = req.params.type;
	if (type == 'all') {
		var query = "select extract(hour from time_in) as time_in, extract(hour from time_out) as time_out \
				from visited natural join sessions;";
	} else {
		var query = "select extract(hour from time_in) as time_in, extract(hour from time_out) as time_out \
				from visited natural join sessions \
				where member_id IN ( \
					(select member_id as id \
					from skilled_in \
					where skill = \'"+ type +"\') \
					union \
					(select member_id as id \
					from certified_in \
					where certificate = \'"+ type +"\'));";
	}
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/interestlist', function(req, res) {
	var query = 'select distinct skill as interest \
			from skilled_in;';
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/makerspace/:type', function(req, res) {
	var type = req.params.type;
	var query;
	switch(type) {
		case 'current':
			query = 'select member_id as id, name, max(time_in) as last_visit \
				from member natural join (visited natural join sessions) \
				where time_out is NULL \
				group by member_id;';
			break;
		case 'notcurrent':
			query = '(select a.member_id as id, name, max(time_in) as last_visit \
				from member as a left outer join (visited natural join sessions) as b on (a.member_id = b.member_id) \
				group by a.member_id) \
				except \
				(select member_id as id, name, max(time_in) as last_visit \
					from member natural join (visited natural join sessions) \
					where time_out is NULL \
					group by member_id);';
			break;
	}
	fetch(query)
		.then(function(url) { res.send(url); })
		.catch(function(err) { res.status(500).send(err); });
});

app.get('/memberlist', function(req, res) {
	var query = 'select a.member_id as id, name, count(session_id) as visit, max(time_in) as last_visit \
			from member as a left outer join (visited natural join sessions) as b on (a.member_id = b.member_id) \
			group by a.member_id;';
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
	var path = __dirname + '/images/' + file;
	res.sendFile(path);
});

app.post('/new/:type', function(req, res) {
	var type = req.params.type;
	var data = req.body;
	var query;
	switch(type) {
		case 'signin':
			query = 'insert into sessions(location) values(\'' + req.body.room + '\'); \
				insert into visited(member_id, session_id) values(' + req.body.id + ', currval(\'session_seq\'));';
			break;
		case 'signout':
			query = 'update sessions set time_out = CURRENT_TIMESTAMP \
				where session_id = ( \
					select session_id \
					from visited natural join sessions \
					where member_id = ' + req.body.id + ' and time_out is NULL);';
			break;
		case 'member':
			query = 'insert into member(member_id, name) values(' + req.body.id + ', \'' + req.body.name + '\');';
			req.body.interests.forEach(function(data, index) {
				query += 'insert into interested_in(member_id, interest) values(' + req.body.id + ', \'' + data + '\');';
			}.bind(this));
			req.body.skills.forEach(function(data, index) {
				query += 'insert into skilled_in(member_id, skill) values(' + req.body.id + ', \'' + data + '\');';
			}.bind(this));
			req.body.certs.forEach(function(data, index) {
				query += 'insert into certified_in(member_id, certificate) values(' + req.body.id + ', \'' + data + '\');';
			}.bind(this));
			break;
		case 'project':
			query = 'insert into projects(project_name, budget) values(\'' + req.body.name + '\', ' + req.body.budget + ');';
			req.body.members.forEach(function(data, index) {
				query += 'insert into works_on(member_id, project_id) values(' + data + ', currval(\'project_seq\'));';
			}.bind(this));
			break;
	}
	console.log(type);
	console.log(req.body.id);
	fetch(query)
		.then(function() { res.send('ok'); })
		.catch(function(err) { res.status(500).send(err); });
});

app.post('/update/:type', function(req, res) {
	var type = req.params.type;
	var data = req.body;
	var query = '';
	switch(type) {
		case 'member':
			if (req.body.name != '') {
				query += 'update member set name = \'' + req.body.name + '\' \
						where member_id = ' + req.body.id + ';';
			}
			req.body.interests.forEach(function(data, index) {
				query += 'insert into interested_in(member_id, interest) values(' + req.body.id + ', \'' + data + '\');';
			}.bind(this));
			req.body.skills.forEach(function(data, index) {
				query += 'insert into skilled_in(member_id, skill) values(' + req.body.id + ', \'' + data + '\');';
			}.bind(this));
			req.body.certs.forEach(function(data, index) {
				query += 'insert into certified_in(member_id, certificate) values(' + req.body.id + ', \'' + data + '\');';
			}.bind(this));
			break;
		case 'project':
			if (req.body.budget != '') {
				query += 'update projects set budget = \'' + req.body.budget + '\' \
						where project_id = ' + req.body.id + ';';
			}
			if (req.body.spent!= '') {
				query += 'update projects set spent = \'' + req.body.spent + '\' \
						where project_id = ' + req.body.id + ';';
			}
			req.body.members.forEach(function(data, index) {
				query += 'insert into works_on(member_id, project_id) values(' + data + ', ' + req.body.id + ');';
			}.bind(this));
			break;
	}
	fetch(query)
		.then(function() { res.send('ok'); })
		.catch(function(err) { res.status(500).send(err); });
});

app.delete('/delete/:type/:id/:item', function(req, res) {
	var type = req.params.type;
	var id = req.params.id;
	var item = req.params.item;
	var query
	switch(type) {
		case 'interest':
			query = 'delete from interested_in \
				where member_id = ' + id + ' and interest = \'' + item + '\';';
			break;
		case 'skill':
			query = 'delete from skilled_in \
				where member_id = ' + id + ' and skill = \'' + item + '\';';
			break;
		case 'certification':
			query = 'delete from certified_in \
				where member_id = ' + id + ' and certificate = \'' + item + '\';';
			break;
		case 'project':
			query = 'delete from works_on \
				where member_id = ' + id + ' and project_id = \'' + item + '\';';
			break;
	}
	fetch(query)
		.then(function() { res.send('ok'); })
		.catch(function(err) { res.status(500).send(err); });
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
				if (error) {console.log(error);return reject(error);}
				resolve(result.rows);
			});
		});
	});
}

