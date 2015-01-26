/*!
 * Demo warning directive.
 *
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['module'], function(module) {

'use strict';

var modulePath = module.uri.substr(0, module.uri.lastIndexOf('/')) + '/';

/* @ngInject */
function factory() {
  return {
    restrict: 'AE',
    templateUrl: modulePath + 'demo-warning.html'
  };
}

return {brDemoWarning: factory};

});
