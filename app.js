/*!
 * Main Bedrock Application module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
(function() {

// if angular is globally defined, update early to track declared modules
if(typeof angular !== 'undefined') {
  angular._bedrock = {modules: {}};
  angular._module = angular.module;
  angular.module = function(name) {
    var mod = angular._bedrock.modules[name] =
      angular._module.apply(angular, arguments);
    return mod;
  };
}

define([
  'angular',
  'jsonld',
  'requirejs/events',
  './demo-warning-directive',
  'angular-animate',
  'angular-bootstrap',
  'angular-file-upload',
  'angular-route',
  'angular-sanitize',
  'es6-promise',
  'jquery',
  'ng-multi-transclude',
  'underscore'
], function(angular, jsonld, events, demoWarningDirective) {

'use strict';

if(!angular._bedrock) {
  // rewrite angular to keep track of declared modules
  angular._bedrock = {modules: {}};
  angular._module = angular.module;
  angular.module = function(name) {
    var mod = angular._bedrock.modules[name] =
      angular._module.apply(angular, arguments);
    return mod;
  };
}

// main shared config
angular.module('bedrock.config', []).value('config', {data: window.data});

// TODO: events should be an optional dependency to allow loading via
// other mechanisms
events.on('bedrock-requirejs.ready', function() {
  api.init();
  api.start();
});

// module API to be exported
var api = {};

/**
 * Initializes the main angular application; to be called after all other
 * angular modules have been declared. This approach currently requires all
 * modules to be available before bootstrapping the application; a future
 * implementation should allow for lazy-loading as desired.
 */
api.init = init;

/**
 * Starts the main angular application by bootstrapping angular.
 */
api.start = function() {
  // bootstrap and set ng-app to indicate to test runner/other external apps
  // that application has bootstrapped (use strictDi when minified)
  var root = angular.element('html');
  angular.bootstrap(root, ['bedrock'], {strictDi: window.data.minify});
  root.attr('ng-app', 'bedrock');
};

return api;

function init() {

// declare main module; depend core dependencies and all other loaded modules
var deps = ['angularFileUpload', 'multi-transclude',
  'ngAnimate', 'ngRoute', 'ngSanitize', 'ui.bootstrap'];
deps = deps.concat(Object.keys(angular._bedrock.modules));
var module = angular.module('bedrock', deps);

module.directive(demoWarningDirective);

/* @ngInject */
module.config(function(
  $httpProvider, $locationProvider, $provide, $routeProvider) {
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');

  // add non-route
  $routeProvider.otherwise({none: true});

  $httpProvider.useApplyAsync(true);

  // normalize errors, deal w/auth redirection
  /* @ngInject */
  $httpProvider.interceptors.push(function($rootScope, $q, $timeout) {
    return {
      request: function(config) {
        if('delay' in config) {
          return $timeout(function() {
            return config;
          }, config.delay);
        }
        return config;
      },
      responseError: function(response) {
        var error = response.data || {};
        if(error.type === undefined) {
          error.type = 'website.Exception';
          error.message =
            'An error occurred while communicating with the server: ' +
            (response.statusText || ('HTTP ' + response.status));
        } else if(error.type === 'PermissionDenied') {
          // invalid session or missing session, show login modal
          $rootScope.$emit('showLoginModal');
        }
        return $q.reject(error);
      }
    };
  });

  /* @ngInject */
  $provide.decorator('$templateRequest', function($delegate, config) {
    // get base URL for modules
    var baseUrl = requirejs.toUrl('bedrock-angular');
    baseUrl = baseUrl.substr(0, baseUrl.indexOf('bedrock-angular'));
    var overrides = config.data.angular.templates.overrides;
    return function(tpl) {
      var relativeUrl = tpl;
      if(tpl.indexOf(baseUrl) === 0) {
        relativeUrl = tpl.substr(baseUrl.length);
      }
      if(relativeUrl in overrides) {
        tpl = baseUrl + overrides[relativeUrl];
      }
      arguments[0] = tpl;
      return $delegate.apply($delegate, arguments);
    };
  });
});

// TODO: `util` seems like it should be a service, why isn't it?

// utility functions
var util = {};
module.value('util', util);
util.parseFloat = parseFloat;

util.jsonld = {};
util.jsonld.isType = function(obj, value) {
  var types = obj.type;
  if(types) {
    if(!angular.isArray(types)) {
      types = [types];
    }
    return types.indexOf(value) !== -1;
  }
  return false;
};

util.w3cDate = function(date) {
  if(date === undefined || date === null) {
    date = new Date();
  } else if(typeof date === 'number' || typeof date === 'string') {
    date = new Date(date);
  }
  return (
    date.getUTCFullYear() + '-' +
    util.zeroFill(date.getUTCMonth() + 1) + '-' +
    util.zeroFill(date.getUTCDate()) + 'T' +
    util.zeroFill(date.getUTCHours()) + ':' +
    util.zeroFill(date.getUTCMinutes()) + ':' +
    util.zeroFill(date.getUTCSeconds()) + 'Z');
};
util.zeroFill = function(num) {
  return (num < 10) ? '0' + num : '' + num;
};

var _routes;
util.getRouteFromPath = function($route, path) {
  if(!_routes) {
    // init routes
    _routes = [];
    angular.forEach($route.routes, function(route, path) {
      _routes.push({
        route: route,
        regex: getRouteRegex(path)
      });
    });
  }
  for(var i = 0; i < _routes.length; ++i) {
    if(_routes[i].regex.test(path)) {
      return _routes[i].route;
    }
  }
  return null;
};

/* @ngInject */
module.run(function(
  $http, $location, $rootScope, $route, $window, config, util) {
  /* Note: $route is injected above to trigger watching routes to ensure
    pages are loaded properly. */

  // configure document loader to load security context locally
  jsonld.useDocumentLoader('xhr', {secure: true});
  var documentLoader = jsonld.documentLoader;
  jsonld.documentLoader = function(url) {
    if(url === 'https://w3id.org/security/v1') {
      url = config.data.baseUri + '/contexts/security-v1.jsonld';
    }
    return documentLoader(url);
  };

  // default headers
  $http.defaults.headers.common.Accept =
    'application/ld+json, application/json, text/plain, */*';
  $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

  // set site and page titles
  $rootScope.siteTitle = $window.data.siteTitle;
  $rootScope.pageTitle = $window.data.pageTitle;
  $rootScope.productionMode = $window.data.productionMode;
  $rootScope.demoWarningUrl = $window.data.demoWarningUrl;

  // tracks whether current page is using an angular view (page is a route)
  var onRoute = false;

  // do immediate initial location change prior to loading any page content
  // in case a redirect is necessary
  locationChangeStart();

  $rootScope.$on('$locationChangeStart', locationChangeStart);

  // monitor whether or not an angular view is in use (current page is a route)
  $rootScope.$on('$viewContentLoaded', function() {
    onRoute = true;
  });

  // route info
  $rootScope.route = {
    changing: false
  };

  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    $rootScope.route.changing = true;
  });

  // set page vars when route changes
  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
    $rootScope.route.changing = false;
    // FIXME: angular13 fix this
    if(current) {
      $rootScope.route.current = current;
      $rootScope.route.vars = current.vars || {};
      // FIXME: remove once routes switched to above vars object
      if(current.title) {
        $rootScope.route.vars.title = current.title;
      }
    } else {
      $rootScope.route.current = null;
      $rootScope.route.vars = {};
    }
  });

  // set page title when route changes
  $rootScope.$on('$routeChangeError', function(event) {
    $rootScope.route.changing = false;
  });

  // access to app core (utility functions, services, etc.)
  $rootScope.app = {
    config: config,
    jsonld: util.jsonld,
    services: {},
    util: util
  };

  function locationChangeStart(event) {
    /* Handle switching between single-page app routes and server-side
    rendered pages.

    The current location is: $window.location.href
    The new location is: $location.path()

    If $location.absUrl() matches $window.location.href, we don't need to
    reload the page as there would be no location change. Otherwise, we need
    to do a full page reload unless the location change is not inter-route.
    In other words, unless the current page is a route and we're changing to
    another route, then we must reload. The possible location change
    combinations and their reload requirements are below:

    non-route => non-route (must reload)
    non-route => route (must reload)
    route => non-route (must reload)
    route => route (no reload necessary)
    */

    // return early if the new location wouldn't change the current one
    if($window.location.href === $location.absUrl()) {
      return;
    }

    // we must reload if we're not staying in the route system
    var reload = !(onRoute && util.getRouteFromPath($route, $location.path()));
    if(reload) {
      $window.location.href = $location.absUrl();
      if(event) {
        event.preventDefault();
      } else {
        throw new Error('Location change is not inter-route; reload required.');
      }
      return;
    }
  }
});

}

// from angular.js for route matching
// TODO: could probably be simplified
function getRouteRegex(when) {
  // Escape regexp special characters.
  when = '^' + when.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$';
  var regex = '', params = [];
  var re = /:(\w+)/g, paramMatch, lastMatchedIndex = 0;
  while((paramMatch = re.exec(when)) !== null) {
    // Find each :param in `when` and replace it with a capturing group.
    // Append all other sections of when unchanged.
    regex += when.slice(lastMatchedIndex, paramMatch.index);
    regex += '([^\\/]*)';
    params.push(paramMatch[1]);
    lastMatchedIndex = re.lastIndex;
  }
  // Append trailing path part.
  regex += when.substr(lastMatchedIndex);
  return new RegExp(regex);
}

});

})();
