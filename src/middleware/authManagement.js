module.exports = function(app) {
  const authManagement = app.service('authManagement');

  return function(req, res, next) {
    const hash = req.params.hash;
    const type = req.params.type;
    if(type == 'verify') {
      authManagement.create({ action: 'verifySignupLong',
        value: hash, // compares to .verifyToken
      }).then(x => {
        res.render('success.ejs', {message: "Email verified!"});
      }).catch(function(error){
        res.render('errors.ejs', {code: error.code, message: error.message});
      });
    } else if (type == 'reset') {
      res.render('reset_password.ejs', {hash: hash});
    } else if (type == 'verifyChanges') {
      authManagement.create({ action: 'verifySignupLong',
        value: hash, // compares to .verifyToken
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
        value: {email: req.params.email}, // compares to .verifyToken
      }).then(x => {
      res.render('success.ejs', {message: "Email sent!"});
    }).catch(function(error){
      res.render('errors.ejs', {code: error.code, message: error.message});
    });;
  };
};