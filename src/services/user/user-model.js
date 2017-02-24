'use strict';

// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validator = require('validator'),
    uniqueValidator = require('mongoose-unique-validator');

const usersSchema = new Schema({
  email: { type: String, required: true, unique: true, dropDups: true, uniqueCaseInsensitive: true, validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email!' }},
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
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

usersSchema.plugin(uniqueValidator);


const usersModel = mongoose.model('users', usersSchema);

module.exports = usersModel;