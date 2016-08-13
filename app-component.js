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
  var self = this;

  self.config = config.data;
  self.route = $rootScope.route;
  self.path = $location.path();

  // prevent recursion within main brApp
  if(!$rootScope._brApp) {
    $rootScope._brApp = true;
    self.isMain = true;
  } else {
    self.isMain = false;
    console.error(
      'Could not load route "' + $location.path() + '" ' +
      'using template "' + self.route.current.loadedTemplateUrl + '". ' +
      'Template not found or includes a recursive "br-app" component.');
  }

  if(self.config.googleAnalytics.enabled) {
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', self.config.googleAnalytics.account]);
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
