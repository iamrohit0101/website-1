module.exports = function(app) {
  return function(req, res, next) {
    if(req.recaptchaResponse) {
      const body = req.body;
      // Get the user service and `create` a new user
      app.service('users').create({
        username: body.username,
        email: body.email,
        password: body.password
      })
      // Then redirect to the login page
      .then(user => res.redirect('/login'))
      // On errors, just call our error middleware
      .catch(next);
    } else {
      res.render('errors.ejs', {code: 403, message: 'failed captcha'});
    }
  };
};