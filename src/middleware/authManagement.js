module.exports = function(app) {
  const authManagement = app.service('authManagement');

  return function(req, res, next) {
    const hash = req.params.hash;
    const type = req.params.type;
    if(type == 'verify') {
      authManagement.create({ action: 'verifySignupLong',
        value: hash,
      }).then(x => {
        res.render('success.ejs', {message: "Email verified!"});
      }).catch(function(error){
        res.render('errors.ejs', {code: error.code, message: error.message});
      });
    } else if (type == 'reset') {
      res.render('reset_password.ejs', {hash: hash});
    } else if (type == 'verifyChanges') {
      authManagement.create({ action: 'verifySignupLong',
        value: hash,
      }).then(x => {
        res.redirect(301, '/dashboard');
      }).catch(function(error){
        res.render('errors.ejs', {code: error.code, message: error.message});
      });
    }
  };
};

module.exports.resend = function(app) {
  return function(req, res, next) {
    const authManagement = app.service('authManagement');
      authManagement.create({ action: 'resendVerifySignup',
        value: {email: req.params.email},
      }).then(x => {
      res.render('success.ejs', {message: "Email sent!"});
    }).catch(function(error){
      res.render('errors.ejs', {code: error.code, message: error.message});
    });;
  };
};

module.exports.passwordChange = function(app) {
  return function(req, res, next) {
    const authManagement = app.service('authManagement');
      authManagement.create({ action: 'resetPwdLong',
        value: {password: req.body.password, token: req.body.hash},
      }).then(x => {
      res.render('success.ejs', {message: "Password has been changed!"});
    }).catch(function(error){
      res.render('errors.ejs', {code: error.code, message: error.message});
    });;
  };
};

module.exports.emailPasswordReset = function(app) {
  return function(req, res, next) {
    const authManagement = app.service('authManagement');
      authManagement.create({ action: 'sendResetPwd',
        value: {email: req.body.email},
      }).then(x => {
      res.render('success.ejs', {message: "Email sent!"});
    }).catch(function(error){
      res.render('errors.ejs', {code: error.code, message: error.message});
    });;
  };
};

module.exports.passwordReset = function(app) {
  return function(req, res, next) {
    const authManagement = app.service('authManagement');
      authManagement.create({ action: 'passwordChange',
        value: {user: {email: req.body.email}, oldPassword: req.body.password, password: req.body.newPassword},
      }).then(x => {
      res.render('success.ejs', {message: "Password has been changed!"});
    }).catch(function(error){
      res.render('errors.ejs', {code: error.code, message: error.message});
    });;
  };
};

module.exports.emailChange = function(app) {
  return function(req, res, next) {
    const authManagement = app.service('authManagement');
      authManagement.create({ action: 'identityChange',
        value: {user: {email: req.body.email}, password: req.body.password, changes: {email: req.body.newEmail} },
      }).then(x => {
      res.render('success.ejs', {message: "Email sent to be confirmed!"});
    }).catch(function(error){
      res.render('errors.ejs', {code: error.code, message: error.message});
    });;
  };
};