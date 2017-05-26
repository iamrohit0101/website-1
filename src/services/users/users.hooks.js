const insensitive = require('./insensitive');
const username = require('./username');
const streamkey = require('./streamkey');

const { authenticate } = require('feathers-authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');

const { hashPassword } = require('feathers-authentication-local').hooks;
const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: '_id',
    ownerField: '_id'
  })
];

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt'), insensitive() ],
    get: [ ...restrict ],
    create: [ hashPassword(), streamkey.initialize(), username() ],
    update: [ ...restrict, hashPassword(), username() ],
    patch: [ ...restrict, hashPassword(), streamkey.considerReset() ],
    remove: [ ...restrict ]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
    ],
    find: [],
    get: [],
    create: [],
    update: [
    commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('streamkey')
      )],
    patch: [],
    remove: [
    commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('streamkey')
      )]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
