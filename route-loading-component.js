/*!
 * Route loading component.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
/* global requirejs */
define([], function() {

'use strict';

/* @ngInject */
function register(module) {
  module.component('brRouteLoading', {
    templateUrl: requirejs.toUrl('bedrock-angular/route-loading-component.html')
  });
}

return register;

});
