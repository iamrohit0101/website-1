const path = require('path');

module.exports = function () {
  const app = this;

  app.set('view engine', 'ejs');
  app.set('views', 'public');

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

  // make a pretty page for follow/view player/see stats/and possibly chat via irc?
  app.get('/:username', function(req, res, next){
    res.redirect(301, 'https://player.angelthump.com?channel=' + req.params.username.toLowerCase());
  });

  app.get('/:username/embed', function(req, res, next){
    res.redirect(301, 'https://player.angelthump.com?channel=' + req.params.username.toLowerCase());
  });
};
