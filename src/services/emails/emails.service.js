// Initializes the `emails` service on path `/emails`
const createService = require('./emails.class.js');
const hooks = require('./emails.hooks');
const mailer = require('feathers-mailer');
const sesTransport = require('nodemailer-ses-transport');

module.exports = function () {
  	const app = this;

  	var sesConfig = {
  		accessKeyId: app.get('awsAccessKey'),
        secretAccessKey: app.get('awsSecretKey'),
        rateLimit: 12
  	};
	app.use('/emails', mailer(sesTransport(sesConfig)));

	// Get our initialized service so that we can register hooks and filters
	const service = app.service('emails');

	service.hooks(hooks);

};