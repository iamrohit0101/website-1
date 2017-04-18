'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/', serveStatic( app.get('public') ))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio({
    wsEngine: 'uws'
  }))
  .configure(services)
  .configure(middleware);

 app.configure(socketio(function(io) {
    io.on('connection', function(socket) {
	      socket.on('channel', function (channel) {
  				socket.join(channel);
  				var connection = io.nsps['/'].adapter.rooms[channel];
          socket.emit('viewers', connection.length);
  				//console.log("total sockets connected: " + Object.keys(io.sockets.sockets).length);
		    });
        socket.on('end', function (){
            socket.disconnect(0);
        });
        socket.on('redirect', function (argUsername, url){
          console.log("redirecting " + argUsername);
          socket.broadcast.emit('redirect', argUsername, url);
        });
        socket.on('reload', function (argUsername){
          console.log("reloading " + argUsername);
          socket.broadcast.emit('reload', argUsername);
        });
      });
    }))

module.exports = app;