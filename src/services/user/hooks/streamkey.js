'use strict';

// src/services/user/hooks/streamkey.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

// We need this to create the MD5 hash
const crypto = require('crypto');

// Returns a long 'random' string to be used for a streamkey
const keyGen = email => {
  const seed = `${Math.random().toString()}${email}`;
  const key = crypto.createHash('sha256').update(seed).digest('hex');

  return key;
};

module.exports.initialize = function() {
  return function(hook) {
    // Assign the new data with the streamkey
    hook.data = Object.assign({}, hook.data, {
      streamkey: keyGen(hook.data.email)
    });
  };
};

module.exports.considerReset = function() {
  return function(hook) {
    // reset if the user assigned their streamkey to 0
    if (hook.data.streamkey === 0) {
      // Assign the new data with the streamkey
      hook.data = Object.assign({}, hook.data, {
        streamkey: keyGen(hook.data.email)
      });
    }
  };
};

