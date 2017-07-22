const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const auth = require('feathers-authentication');
const path = require('path');

const signup = require('./signup');
const verify = require('./verify');
const done = require('./on_publish_done');
const authManagement = require('./authManagement');

module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this;

  app.set('view engine', 'ejs');
  app.set('views', 'public');
  
  // TODO:
  // check if the username actually exists before trying to render this view
  // http://docs.feathersjs.com/guides/using-a-view-engine.html

  app.get('/embed/:username', function(req, res, next){
    res.render('embed', {username: req.params.username});
  });
  
  app.get('/embed-test/:username', function(req, res, next){
    res.render('embed-test', {username: req.params.username});
  });

  app.get('/embed-flash/:username', function(req, res, next){
    res.render('embed-flash', {username: req.params.username});
  });
  
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
    res.sendFile('dashboard.html', { root: path.join(__dirname, '../../public') });
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

  app.get('/patreon', function(req, res, next){
    res.redirect(301, 'https://www.patreon.com/angelthump');
  });

  app.get('/reset_email', function(req, res, next){
    res.sendFile('reset_email.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/reset_password', function(req, res, next){
    res.sendFile('reset_password.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/resend_email/:email', function(req, res, next){
    const authManagement = app.service('authManagement');
    authManagement.create({ action: 'resendVerifySignup',
      value: {email: req.params.email}, // compares to .verifyToken
    }).then(x => {
		res.status(200).send('ok');
	}).catch(function(error){
		res.render('errors.ejs', {code: error.code, message: error.message});
	});;
  });

  app.get('/management/:type(verify||reset||verifyChanges)/:hash', authManagement(app));

  app.post('/signup', signup(app));

  app.get('/admin/reload/:username', function(req, res, next){
    res.redirect(301, 'https://api.angelthump.com/admin/reload/' + req.params.username);
  });

  app.get('/admin/redirect/:username/:puntUsername', function(req, res, next){
     res.redirect(301, 'https://api.angelthump.com/admin/redirect/' + req.params.username + '/' + req.params.puntUsername);
  });

  app.post('/live', verify.initial(app));
  app.post('/done', done(app));

  app.get('/api', function(req, res, next){
    res.redirect(301, 'https://api.angelthump.com/');
  });

  app.get('/api/:username', function(req, res, next){
  	res.redirect(301, 'https://api.angelthump.com/' + req.params.username);
  });
  
  app.use(notFound());

  //json for now
  app.use(handler({
    html: function(error, req, res, next) {
       res.render('errors.ejs', {code: error.code, message: error.message});
    }
  }));
};
