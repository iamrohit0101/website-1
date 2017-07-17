// Initializes the `authManagement` service on path `/authManagement`
const createService = require('./auth-management.class.js');
const hooks = require('./auth-management.hooks');
const notifier = require('./notifier');
const authManagement = require('feathers-authentication-management');

module.exports = function () {
  const app = this;

  app.configure(authManagement(notifier(app)));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('authManagement');

  service.hooks(hooks);

};
