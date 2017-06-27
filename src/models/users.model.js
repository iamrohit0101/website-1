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
  patreonId: { type: String },
  patreon: { type: mongooseClient.Schema.Types.Mixed },
  streamkey: { type: String, unique: true, dropDups: true, uniqueCaseInsensitive: true},
  isVerified: { type: Boolean, default: false },
  verifyToken: { type: String },
  verifyExpires: { type: Date },
  verifyChanges: { type: Object },
  resetToken: { type: String },
  resetExpires: { type: Date },
  banned:    {type: Boolean, 'default': false},
  ifPatreon: {type: Boolean, 'default': false},
  title: {type: String},
  live: {type: Boolean, 'default': false},
  poster: {type: String, 'default': "https://angelthump.com/assets/default_offline.jpg"},
  streamCreatedAt: {type: Date, 'default': Date.now },
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});
  users.plugin(uniqueValidator);

  return mongooseClient.model('users', users);
};
