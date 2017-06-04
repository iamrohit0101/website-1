'use strict';

// users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient'),
  validator = require('validator'),
  uniqueValidator = require('mongoose-unique-validator');
  const users = new mongooseClient.Schema({
  
  email: { type: String, required: true, unique: true, dropDups: true, uniqueCaseInsensitive: true, validate: [{ validator: validator.isEmail, msg: '{VALUE} is not a valid email!' }]},
  username: { type: String, required: true, unique: true, dropDups: true, uniqueCaseInsensitive: true},
  password: { type: String, required: true },
  streamkey: { type: String, unique: true, dropDups: true, uniqueCaseInsensitive: true},
  isVerified: { type: Boolean, 'default': false },
  verifyToken: { type: String },
  verifyExpires: { type: Date }, // or a long integer
  verifyChanges: { type: [String] },
  resetToken: { type: String },
  resetExpires: { type: Date }, // or a long integer
  banned:    {type: Boolean, 'default': false},
  patreon: {type: Boolean, 'default': false},
  title: {type: String, 'default': " "},
  live: {type: Boolean, 'default': false},
  streamCreatedAt: {type: Date, 'default': Date.now },
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});
  users.plugin(uniqueValidator);

  return mongooseClient.model('users', users);
};
