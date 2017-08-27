const accountService = require('../services/auth-management/notifier');
const feathers = require('feathers');
const config = require('feathers-configuration');

exports.sendVerificationEmail = options => hook => {
  //if (!hook.params.provider) { return hook; }
  const app = feathers().configure(config());
  const user = hook.result;
  if(app.get('email') && hook.data && hook.data.email && user) {
    accountService(hook.app).notifier('resendVerifySignup', user)
    return hook
  }
  return hook
}