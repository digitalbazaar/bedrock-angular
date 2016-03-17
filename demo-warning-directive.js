/*!
 * Demo warning directive.
 *
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([], function() {

'use strict';

/* @ngInject */
function factory() {
  return {
    restrict: 'AE',
    templateUrl: requirejs.toUrl('bedrock-angular/demo-warning.html')
  };
}

return {brDemoWarning: factory};

});
