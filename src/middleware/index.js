const express = require('@feathersjs/express');
const auth = require('@feathersjs/authentication');
const path = require('path');
const signup = require('./signup');
const authManagement = require('./authManagement');
const email = require('./email');
const client = require('redis').createClient();
const recaptcha = require('./recaptcha');
const cookieParser = require('cookie-parser');
const { format } = require('url');

module.exports = function () {
  const app = this;

  app.set('view engine', 'ejs');
  app.set('views', 'public');

  const limiter = require('express-limiter')(app, client)

  //limit post requests to 10 request per 30 seconds
  limiter({
    path: '*',
    method: 'post',
    lookup: 'headers.x-forwarded-for',
    total: 10,
    expire: 1000 * 30,
    onRateLimited: function (req, res, next) {
      next({ message: 'Rate limit exceeded', code: 429 })
    }
  });

  app.post('/email-notifications', email(app))

  app.get('/p', function(req, res, next) {
    res.redirect('/');
  })
  app.get('/p/:page', function(req,res,next) {
    res.sendFile(req.params.page.toLowerCase() + '.html', { root: path.join(__dirname, '../../public') });
  })

  app.get('/dashboard', function(req, res, next){
    res.sendFile('dashboard.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/settings', function(req, res, next){
    res.redirect('/dashboard/settings');
  });

  app.get('/admin', function(req,res,next) {
    res.sendFile('admin.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/dashboard/:page', function(req,res,next) {
    res.sendFile(req.params.page.toLowerCase() + '.html', { root: path.join(__dirname, '../../public') });
  })

  app.get('/login', function(req, res, next){
    res.sendFile('login.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/signup', function(req, res, next){
    res.sendFile('signup.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/reset_pass', function(req, res, next){
    res.sendFile('reset.html', { root: path.join(__dirname, '../../public') });
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

  app.get('/patron', cookieParser(), auth.express.authenticate('jwt', { failureRedirect: '/login' }), function(req, res, next){
    const loginUrl = format({
        protocol: 'https',
        host: 'patreon.com',
        pathname: '/oauth2/authorize',
        query: {
            response_type: 'code',
            client_id: app.get('authentication').patreonV2.CLIENT_ID,
            redirect_uri: 'https://api.angelthump.com/patreon/oauth/redirect',
            scope: 'identity identity[email] identity.memberships'
        }
    })
    res.redirect(loginUrl);
  });

  app.get('/logout', cookieParser(), (req, res) => {
    res.clearCookie('feathers-jwt', {domain: "angelthump.com", path: "/"});
    res.redirect('/');
  });
  
  app.post('/resendVerification', [recaptcha.verify(),authManagement.resend(app)]);
  app.post('/emailPasswordReset', [recaptcha.verify(),authManagement.emailPasswordReset(app)]);
  app.post('/passwordReset', authManagement.passwordReset(app));
  app.post('/passwordChange', authManagement.passwordChange(app));
  app.post('/emailChange', authManagement.emailChange(app));

  app.get('/management/:type(verify||reset||verifyChanges)/:hash', authManagement(app));

  app.post('/signup', [recaptcha.verify(),signup(app)]);

  // make a pretty page for follow/view player/see stats/and possibly chat via irc?
  app.get('/:username', function(req, res, next){
    res.redirect(301, 'https://player.angelthump.com?channel=' + req.params.username.toLowerCase());
  });

  app.get('/:username/embed', function(req, res, next){
    res.redirect(301, 'https://player.angelthump.com?channel=' + req.params.username.toLowerCase());
  });
  
  app.use(express.notFound({ verbose: false }));

  app.use(express.errorHandler({
    html: function(error, req, res, next) {
        res.render('errors.ejs', {code: error.code, message: error.message});
    }
  }));
};
