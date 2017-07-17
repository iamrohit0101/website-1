// Initializes the `emails` service on path `/emails`
const createService = require('./emails.class.js');
const hooks = require('./emails.hooks');
const mailer = require('feathers-mailer');
const smtpTransport = require('nodemailer-smtp-transport');

module.exports = function () {
  const app = this;

  // Initialize our service with any options it requires
  app.use('/emails', mailer(smtpTransport({
    service: 'gmail',
    auth: {
      user: app.get('gmail'),
      pass: app.get('gmail-password')
    }
  })));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('emails');

  service.hooks(hooks);

};