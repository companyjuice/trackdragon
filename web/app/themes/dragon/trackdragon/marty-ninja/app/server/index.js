/* bin/www */
require('babel/register');

var fs = require('fs');
var _ = require('lodash');
var util = require('util');
var path = require('path');
var uuid = require('uuid').v1;
var morgan = require('morgan'); //var logger

var rooms = require('./rooms');
var projects = require('./projects');

var express = require('express');
var Table = require('cli-table');
var bodyParser = require('body-parser');

var app = express();

/* bin/www */
var port = process.env.PORT || 7777;
var server = require('http').Server(app);
var io = require('socket.io')(server);

require('marty').HttpStateSource.removeHook('parseJSON');

console.log('-||- Running server http://localhost:' + port);
server.listen(port);
/**/

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 7777);

app.use(morgan('dev')); //logger('dev')
app.use(bodyParser.json());

app.use(require('marty-express')({
  routes: require('../routes'),
  application: require('../application'),
  rendered: function (result) {
    console.log('Rendered ' + result.req.url);

    var table = new Table({
      colWidths: [30, 30, 30, 30, 60],
      head: ['Store Id', 'Fetch Id', 'Status', 'Time', 'Result']
    });

    _.each(result.diagnostics, function (diagnostic) {
      table.push([
        diagnostic.storeId,
        diagnostic.fetchId,
        diagnostic.status,
        diagnostic.time,
        JSON.stringify(diagnostic.result || diagnostic.error || {}, null, 2)
      ]);
    });

    console.log(table.toString());
  }
}));

app.use(express.static(path.join(__dirname, '..', '..', 'dist')));
app.use('/styles', express.static(path.join(__dirname, '..', 'styles')));
app.use('/node_modules', express.static(path.join(__dirname, '..', '..', 'node_modules')));

/******************
** Marty Objects **
******************/

// Marty Rooms

app.get('/rooms/:id', function (req, res) {
  res.render('index');
});

app.get('/api/rooms', function(req, res) {
  res.json(rooms.getAllRooms()).end();
});

app.post('/api/rooms', function (req, res) {
  var room = rooms.createRoom(req.body);

  res.json(room).status(201).end();
});

app.post('/api/rooms/:roomId/messages', function(req, res) {
  var message = rooms.addMessage(roomId(req), req.body);

  res.json(message).status(201).end();
});

app.get('/api/rooms/:roomId/messages', function (req, res) {
  var messages = rooms.getRoomMessages(roomId(req));

  res.json(messages).end();
});

rooms.on('*', function() {
  console.log.apply(console, _.union([this.event], _.toArray(arguments)));
});

io.on('connection', function(socket) {
  rooms.on('*', function() {
    var args = _.toArray(arguments);
    args.unshift(this.event);
    socket.emit.apply(socket, args);
  });
});

function roomId(req) {
  return req.params.roomId;
}
// end Marty Rooms

/***********************************************************/

// Marty Projects
//app.get('/api/projects/:id', require('./routes/getProject'));

app.get('/projects/:id', function (req, res) {
  res.render('index');
});

app.get('/api/projects', function(req, res) {
  res.json(projects.getAllProjects()).end();
});

app.post('/api/projects', function (req, res) {
  var project = projects.createProject(req.body);

  res.json(project).status(201).end();
});

app.post('/api/projects/:projectId/messages', function(req, res) {
  var message = projects.addMessage(projectId(req), req.body);

  res.json(message).status(201).end();
});

app.get('/api/projects/:projectId/messages', function (req, res) {
  var messages = projects.getProjectMessages(projectId(req));

  res.json(messages).end();
});

projects.on('*', function() {
  console.log.apply(console, _.union([this.event], _.toArray(arguments)));
});

io.on('connection', function(socket) {
  projects.on('*', function() {
    var args = _.toArray(arguments);
    args.unshift(this.event);
    socket.emit.apply(socket, args);
  });
});

function projectId(req) {
  return req.params.projectId;
}
// end Marty Projects

/***********************************************************/

// Marty Tracks
//app.get('/api/tracks/:id', require('./routes/getTrack'));
// end Marty Tracks

/***********************************************************/

// Marty Clips
//app.get('/api/clips/:id', require('./routes/getClip'));
// end Marty Clips

/***********************************************************/

// Marty Mediums
//app.get('/api/mediums/:id', require('./routes/getMedium'));
// end Marty Mediums

/***********************************************************

io.on('connection', function(socket) {

  rooms.on('*', function() {
    var args = _.toArray(arguments);
    args.unshift(this.event);
    socket.emit.apply(socket, args);
  });
  
  projects.on('*', function() {
    var args = _.toArray(arguments);
    args.unshift(this.event);
    socket.emit.apply(socket, args);
  });

});

***********************************************************/

// ES6 "app" module exports ??
//module.exports = app;