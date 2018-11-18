const express = require('@feathersjs/express');
const notFound = require('feathers-errors/not-found');
const auth = require('@feathersjs/authentication');
const path = require('path');
const signup = require('./signup');
const events = require('./nginx_events');
const authManagement = require('./authManagement');
const patreonAPI = require('./patreonAPI');
const patreonWebhooks = require('./patreonWebhooks');
const api = require('./api');
const admin = require('./admin');
const embed = require('./embed');
const cache = require('apicache').middleware;
const email = require('./email');
const client = require('redis').createClient();
const recaptcha = require('./recaptcha.js');
const cookieParser = require('cookie-parser');
const transcodeAPI = require('./transcodeAPI.js')

module.exports = function () {
  const app = this;

  app.set('view engine', 'ejs');
  app.set('views', 'public');
  
  app.post('/live', events.stream(app));
  app.post('/done', events.done(app));
  app.post('/update', events.update(app));

  //redirect http to https
  app.all("*", function (req, res, next) {
    if(req.url != null) {
      if(req.url.includes('/.well-known')) {
        return next();
      }
    }
    if(req.secure){
      return next();
    };
    res.redirect('https://' + req.hostname + req.url);
  });

  const limiter = require('express-limiter')(app, client)

  //limit post requests to 5 request per 30 seconds
  limiter({
    path: '*',
    method: 'post',
    lookup: 'connection.remoteAddress',
    total: 5,
    expire: 1000 * 30,
    onRateLimited: function (req, res, next) {
      next({ message: 'Rate limit exceeded', code: 429 })
    }
  })

  /* for testing emails
  app.get('/test-email', function(req,res,next) {
    var email = {
      from: "noreply@angelthump.com",
      to: 'success@simulator.amazonses.com',
      subject: 'test'
    }
    return app.service('emails')
        .create(email)
        .then(function(result) {
          console.log(result)
          res.status(200).send(result);
        }).catch(err => {
          res.status(200).send(err);
        })
  })*/

  /*testing
  app.get('/embed-test/:username', function(req, res, next){
    res.render('embed-test', {username: req.params.username});
  });*/

  app.get('/embed-test/:username', embed.test(app));

  /*
  app.get('*', function(req,res,next) {
    res.render('errors.ejs', {code: 500, message: "Server is down for maintenance."});
  });*/

  app.get('/embed/:username', embed(app));

  app.post('/email-notifications', email(app))

  app.get('/api', cache('5 seconds'), api.all(app));
  app.get('/api/:username', api.individual(app));
  app.get('/edges', cache('5 seconds'), api.edgeServerList(app));
  app.post('/api/title', cookieParser(), auth.express.authenticate('jwt'), api.changeTitle(app));

  app.get('/transcodes', cache('10 seconds'), transcodeAPI.transcodable(app));
  app.post('/transcode', transcodeAPI.transcode(app));
  app.get('/droplets', transcodeAPI.listDroplets(app));
  app.post('/droplet', transcodeAPI.addDroplet(app));
  app.post('/droplet/delete', transcodeAPI.deleteDroplet(app));
  app.put('/droplet', transcodeAPI.updateDroplet(app));

  app.get('/admin/ban/:username', admin.ban(app));
  app.get('/admin/unban/:username/', admin.unban(app));

  app.get('/dmca', function(req, res, next){
    res.sendFile('dmca.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/privacy', function(req, res, next){
    res.sendFile('privacy.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/tos', function(req, res, next){
    res.sendFile('tos.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/profile', function(req, res, next){
    res.redirect(301, 'https://angelthump.com/dashboard');
  });
  app.get('/dashboard', function(req, res, next){
    res.sendFile('dashboard.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/settings', function(req, res, next){
    res.redirect(301, 'https://angelthump.com/dashboard/settings');
  });
  app.get('/dashboard/settings', function(req, res, next){
    res.sendFile('settings.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/patreon', function(req, res, next){
    res.redirect(301, 'https://angelthump.com/dashboard/patreon');
  });
  app.get('/dashboard/patreon', function(req, res, next){
    res.sendFile('patreon.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/login', function(req, res, next){
    res.sendFile('login.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/signup', function(req, res, next){
    res.sendFile('signup.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/reset', function(req, res, next){
    res.sendFile('reset.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/donate', function(req, res, next){
    res.redirect(301, 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3VKPL7E8RSL38');
  });

  app.get('/reset_email', function(req, res, next){
    res.sendFile('reset_email.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/reset_password', function(req, res, next){
    res.sendFile('reset_password.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/resend_email', function(req, res, next){
    res.sendFile('resend_email.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/patron', function(req, res, next){
    res.sendFile('patron.html', { root: path.join(__dirname, '../../public') });
  });

  app.post('/patron', patreonAPI(app));

  app.post('/patreon/create', patreonWebhooks.create(app));
  app.post('/patreon/update', patreonWebhooks.update(app));
  app.post('/patreon/delete', patreonWebhooks.delete(app));

  
  app.post('/resendVerification', [recaptcha.verify(),authManagement.resend(app)]);
  app.post('/emailPasswordReset', [recaptcha.verify(),authManagement.emailPasswordReset(app)]);
  app.post('/passwordReset', authManagement.passwordReset(app));
  app.post('/passwordChange', authManagement.passwordChange(app));
  app.post('/emailChange', authManagement.emailChange(app));

  app.get('/management/:type(verify||reset||verifyChanges)/:hash', authManagement(app));

  app.post('/signup', [recaptcha.verify(),signup(app)]);
  app.get('/checkPassword', function(req, res, next){
    res.sendFile('checkPassword.html', { root: path.join(__dirname, '../../public') });
  });
  app.post('/checkPassword', admin.checkPassword(app));

  app.use(express.notFound({ verbose: true }));

  app.use(express.errorHandler({
    html: function(error, req, res, next) {
        res.render('errors.ejs', {code: error.code, message: error.message});
    }
  }));
};
