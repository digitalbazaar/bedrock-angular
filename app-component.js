/*!
 * Main Bedrock App Component.
 *
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([], function() {

'use strict';

function register(module) {
  module.component('brApp', {
    controller: Ctrl,
    templateUrl: requirejs.toUrl('bedrock-angular/app-component.html')
  });
}

/* @ngInject */
function Ctrl($location, $rootScope, config) {
  this.config = config.data;
  this.route = $rootScope.route;
  this.path = $location.path();

  if(this.config.googleAnalytics.enabled) {
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', this.config.googleAnalytics.account]);
    _gaq.push(['_trackPageview']);
    (function() {
      var ga = document.createElement('script');
      ga.type = 'text/javascript';
      ga.async = true;
      ga.src = ('https:' == document.location.protocol ?
        'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(ga, s);
    })();
  }
}

return register;

});
