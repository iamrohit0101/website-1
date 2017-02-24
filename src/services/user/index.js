'use strict';

const service = require('feathers-mongoose');
const user = require('./user-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  app.use('/users', service({
	Model: user,
	lean: true
  }));

  // Get our initialize service to that we can bind hooks
  const userService = app.service('/users');


    userService.filter('streamkey', function(data, connection, hook) {
    // The id of the user that created the todo
    const modifiedUserId = hook.params.user._id;
    // The a list of ids of the connection's user friends
    const currentUserId = connection.user._id;

    if(modifiedUserId !== currentUserId) {
      return false;
    }

    return data;
  });


  // Set up our before hooks
  userService.before(hooks.before);

  // Set up our after hooks
  userService.after(hooks.after);
};
