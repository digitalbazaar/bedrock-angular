/*!
 * Resolve Package URL filter.
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
// TODO: remove this entire filter in next major version!
define([], function() {

'use strict';

function register(module) {
  module.filter('resolvePackageUrl', factory);
}

/* @ngInject */
function factory() {
  return function(value) {
    return requirejs.toUrl(value);
  };
}

return register;

});
