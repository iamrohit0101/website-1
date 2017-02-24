'use strict';

const assert = require('assert');
const insensitive = require('../../../../src/services/user/hooks/insensitive.js');

describe('user insensitive hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    insensitive()(mockHook);

    assert.ok(mockHook.insensitive);
  });
});
