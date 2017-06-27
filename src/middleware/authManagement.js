module.exports = function(app) {
  const authManagement = app.service('authManagement');

  return function(req, res, next) {
    const hash = req.params.hash;
    const type = req.params.type;
    if(type == 'verify') {
      authManagement.create({ action: 'verifySignupLong',
        value: hash, // compares to .verifyToken
      }).then(x => {
        res.redirect(301, '/profile');
      }).catch(function(error){
        res.render('errors.ejs', {code: error.code, message: error.message});
      });
    } else if (type == 'reset') {
      res.render('reset_password.ejs', {hash: hash});
    } else if (type == 'verifyChanges') {
      authManagement.create({ action: 'verifySignupLong',
        value: hash, // compares to .verifyToken
      }).then(x => {
        res.redirect(301, '/profile');
      }).catch(function(error){
        res.render('errors.ejs', {code: error.code, message: error.message});
      });
    }
  };
};