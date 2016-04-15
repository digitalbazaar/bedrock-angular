/*!
 * Demo warning component.
 *
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([], function() {

'use strict';

/* @ngInject */
function register(module) {
  module.component('brDemoWarning', {
    templateUrl: requirejs.toUrl('bedrock-angular/demo-warning-component.html')
  });
}

return register;

});
