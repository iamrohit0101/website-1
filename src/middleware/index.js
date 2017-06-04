const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const auth = require('feathers-authentication');
const path = require('path');

const signup = require('./signup');
const admin = require('./admin');
const verify = require('./verify');
const done = require('./on_publish_done');
const api = require('./api');

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

  /*
  app.get('/embed-test/:username', function(req, res, next){
    res.render('embed-test', {username: req.params.username});
  });*/
  
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
    res.sendFile('profile.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/login', function(req, res, next){
    res.sendFile('login.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/signup', function(req, res, next){
    res.sendFile('signup.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/donate', function(req, res, next){
    res.redirect(301, 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3VKPL7E8RSL38');
  });

  app.get('/patreon', function(req, res, next){
    res.redirect(301, 'https://www.patreon.com/angelthump');
  });

  //app.post('/login', auth.express.authenticate('local', { successRedirect: '/profile', failureRedirect: '/login' }));
  app.post('/signup', signup(app));

  app.get('/admin/:type(reload)/:username', function(req, res, next){
    res.status(200).send('ok');

    next();
  }, admin(app));

  app.get('/admin/:type(redirect)/:username/:puntUsername', function(req, res, next){
    res.status(200).send('ok');

    next();
  }, admin(app));

  app.post('/live', verify.initial(app));
  app.post('/done', done(app));

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
  
  app.use(notFound());

  //json for now
  app.use(handler({
    html: false
  }));
};
