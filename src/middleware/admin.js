'use strict';

const socketio = require('feathers-socketio/client');
const io = require('socket.io-client');

module.exports = function(app) {
  return function(req, res, next) {
    const requested_username = req.params.username;
    const puntUsername = req.params.puntUsername;
    const type = req.params.type;
    const ip = req.connection.remoteAddress.replace(/^.*:/, '');
    if (ip == "" || ip == "" || ip == "" || ip == "" || ip == "") {
      const socket = io('https://angelthump.com');
      socket.on('connect', function() {
        if(type == "redirect") {
          socket.emit('channel', requested_username);
          socket.emit('redirect', requested_username, "https://angelthump.com/embed/" + puntUsername);
        } else if (type == "reload") {
          socket.emit('channel', requested_username);
          socket.emit('reload', requested_username);
        }
      });
      socket.emit('end');
    }
  };
};