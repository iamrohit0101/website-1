'use strict';

// src/services/user/hooks/username.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

// clean up a username
// - only letters and numbers
// - lowercase
// - 10 characters
const normalize = username => {
  return username.replace(/[^0-9a-zA-Z]/g, '').toLowerCase().substring(0, 15);
};

// TODO: use something to actually validate things
// https://github.com/kulakowka/feathers-validate-hook

module.exports = function() {
  return function(hook) {
    // Assign the new data with the username
    console.log(hook.data);
    hook.data = Object.assign({}, hook.data, {
      username: normalize(hook.data.username)
    });
  };
};