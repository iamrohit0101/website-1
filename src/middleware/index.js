const handler = require('@feathersjs/express/errors');
const notFound = require('feathers-errors/not-found');
const auth = require('@feathersjs/authentication');
const path = require('path');

const signup = require('./signup');
const verify = require('./verify');
const done = require('./on_publish_done');
const authManagement = require('./authManagement');
const checkPassword = require('./checkPassword');

const patreonAPI = require('./patreonAPI');
const patreonWebhooks = require('./patreonWebhooks');
const paywall = require('./paywall');
const api = require('./api');
const admin = require('./admin');

module.exports = function () {
  const app = this;

  app.set('view engine', 'ejs');
  app.set('views', 'public');
  
  // TODO:
  // check if the username actually exists before trying to render this view
  // http://docs.feathersjs.com/guides/using-a-view-engine.html

  app.get('/embed/:username', function(req, res, next){
  	const referer = req.header('Referer') || '/';
    if(referer.includes("t.co") || referer.includes("reddit.com") || referer.includes('facebook.com') || referer.includes('twitch.tv')) {
      console.log('redirecting ' + referer);
      res.redirect('https://www.youtube.com/watch?v=mj-v6zCnEaw');
    } else {
      res.render('embed', {username: req.params.username});
    }
  });
  
  //test-bed
  app.get('/embed-test/:username', function(req, res, next){
    res.render('embed-test', {username: req.params.username});
  });

  app.get('/api', function(req, res, next){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", -1);

    next();
  }, api.all(app));

  app.get('/api/:username', function(req, res, next){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", -1);

    next();
  }, api.individual(app));

  app.get('/admin/reload/:username', admin.reload(app));

  app.get('/admin/redirect/:username/:puntUsername', admin.redirect(app));

  app.get('/banned', function(req, res, next){
    res.render('errors.ejs', {code: 400, message: "User is banned"});
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

  app.get('/patron', function(req, res, next){
    res.sendFile('patron.html', { root: path.join(__dirname, '../../public') });
  });
  app.post('/patron', patreonAPI(app));

  app.post('/patreon/create', patreonWebhooks.create(app));
  app.post('/patreon/update', patreonWebhooks.update(app));
  app.post('/patreon/delete', patreonWebhooks.delete(app));

  app.get('/resend-email/:email', authManagement.resend(app));

  app.get('/management/:type(verify||reset||verifyChanges)/:hash', authManagement(app));

  app.post('/signup', signup(app));
  app.post('/checkPassword', checkPassword(app));

  app.get('/admin/paywall/:username', paywall.paywall(app));
  app.get('/admin/undopaywall/:username', paywall.undoPaywall(app));

  app.post('/live', verify.initial(app));
  app.post('/done', done(app));
  
  app.use(notFound());

  app.use(handler({
    html: function(error, req, res, next) {
       res.render('errors.ejs', {code: error.code, message: error.message});
    }
  }));
};
