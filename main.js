/*!
 * Main Bedrock Application module.
 *
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
(function() {

// if angular is globally defined, update early to track declared modules
if(typeof angular !== 'undefined' && !angular._bedrock) {
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
  'angular-animate',
  'angular-bootstrap',
  'angular-route',
  'angular-sanitize',
  'es6-promise',
  'jquery',
  'ng-multi-transclude',
  './app-component',
  './demo-warning-component',
  './resolve-package-url-filter'
], function(angular, jsonld, events) {

'use strict';

// dependencies starting with './' that need to be registered on `init`
var localDeps = Array.prototype.slice.call(arguments, arguments.length - 3);

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
angular.module('bedrock.config', [])
  .value('config', {data: window.data})
  .run(function(config) {
    // TODO: move this into a new brJsonLdService? needs to load early though
    // configure default document loader to load contexts locally
    jsonld.useDocumentLoader('xhr', {secure: true});
    var documentLoader = jsonld.documentLoader;
    jsonld.documentLoader = function(url) {
      if(url in config.data.contextMap) {
        url = config.data.contextMap[url];
      }
      return documentLoader(url);
    };
  });

events.on('bedrock-requirejs.ready', function() {
  if(api.config.autostart) {
    api.start();
  }
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
  api.init();
  // bootstrap and set ng-app to indicate to test runner/other external apps
  // that application has bootstrapped (use strictDi when minified)
  var root = angular.element('html');
  angular.bootstrap(root, ['bedrock'], {strictDi: window.data.minify});
  angular.element(document).ready(function() {
    root.attr('ng-app', 'bedrock');
  });
};

// bedrock-angular local configuration
api.config = {
  // automatically start on load
  autostart: true
};

// prerender notification support
var _prerenderResolve;
var _prerenderPromise;
api.prerender = function() {
  return _prerenderPromise;
};

events.on('bedrock-requirejs.init', function() {
  // initialize promise *after* `bedrock-requirejs.init` to ensure polyfills
  // are ready
  _prerenderPromise = new Promise(function(resolve) {
    _prerenderResolve = resolve;
  });
});

var _init = false;

return api;

function init() {

if(_init) {
  return true;
}

_init = true;

// declare main module; use core dependencies and all other loaded modules
var deps = [
  'multi-transclude', 'ngAnimate', 'ngRoute', 'ngSanitize', 'ui.bootstrap'];
deps = deps.concat(Object.keys(angular._bedrock.modules));
var module = angular.module('bedrock', deps);

// register local components
localDeps.forEach(function(register) {
  register(module);
});

/* @ngInject */
module.config(function(
  $compileProvider, $httpProvider, $locationProvider, $provide,
  $routeProvider) {
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');

  // Disable debug data
  // See: https://docs.angularjs.org/guide/production
  $compileProvider.debugInfoEnabled(false);

  // add non-route
  $routeProvider.otherwise({none: true});

  $httpProvider.useApplyAsync(true);

  // normalize errors, deal w/auth redirection
  /* @ngInject */
  $httpProvider.interceptors.push(function($rootScope, $q) {
    return {
      responseError: function(response) {
        var error = response.data || {};
        // handle plain text error responses
        if(typeof error === 'string') {
          error = {};
        }
        if(error.type === undefined) {
          error.type = 'Error';
          error.message =
            'An error occurred while communicating with the server: ' +
            (response.statusText || ('HTTP ' + response.status));
        } else if(error.type === 'PermissionDenied') {
          // response triggered permission denied error
          $rootScope.$emit('permissionDenied', {
            response: response,
            error: error
          });
        }
        return $q.reject(error);
      }
    };
  });

  /* @ngInject */
  $provide.decorator('$templateRequest', function($delegate, $filter, config) {
    // get base URL for modules and override list
    var baseUrl = $filter('resolvePackageUrl')('bedrock-angular');
    baseUrl = baseUrl.substr(0, baseUrl.indexOf('bedrock-angular'));
    var overrides = config.data.angular.templates.overrides;

    // replace $templateRequest
    handleRequestFn.totalPendingRequests = $delegate.totalPendingRequests;
    return handleRequestFn;
    function handleRequestFn(tpl) {
      var relativeUrl = tpl;
      if(tpl.indexOf(baseUrl) === 0) {
        relativeUrl = tpl.substr(baseUrl.length);
      }
      if(relativeUrl in overrides) {
        tpl = baseUrl + overrides[relativeUrl];
      }
      arguments[0] = tpl;
      var promise = $delegate.apply($delegate, arguments).finally(function() {
        handleRequestFn.totalPendingRequests = $delegate.totalPendingRequests;
      });
      handleRequestFn.totalPendingRequests = $delegate.totalPendingRequests;
      return promise;
    }
  });

  // FIXME: deprecate, do not include service data in rootScope
  /* @ngInject */
  $provide.decorator('$rootScope', function($delegate) {
    $delegate.app = $delegate.app || {};
    $delegate.app.services = $delegate.app.services || {};
    return $delegate;
  });

  /* @ngInject */
  $provide.decorator('$http', function($delegate, $timeout) {
    var _queue = {};
    var _pendingRequests = 0;
    var _prerenderReady;
    console.log('INITIALIZING DECORATOR');
    function $http(requestConfig) {
      console.log('CCCCCCCCCC', requestConfig.url);
      // apply delay and then remove it
      if('delay' in requestConfig) {
        return $timeout(function() {
          requestConfig = angular.extend({}, requestConfig);
          delete requestConfig.delay;
          return $http(requestConfig);
        }, requestConfig.delay);
      }
      var promise;
      // allow queue if method is GET
      if(requestConfig.queue && requestConfig.method === 'GET') {
        // use global or specified queue
        var queue = (requestConfig.queue === true ?
          _queue : requestConfig.queue);
        // TODO: does not account for requestConfig.params, etc
        var url = requestConfig.url;
        if(url in queue) {
          // _pendingRequests--;
          return new Promise(function(resolve, reject) {
            queue[url].then(resolve, reject);
          });
        } else {
          _pendingRequests++;
          console.log('INCREMENTED PENDING REQUESTS', _pendingRequests);
        }
        promise = queue[url] = $delegate.apply($delegate, arguments);
        promise.then(function(response) {
          delete queue[url];
          return response;
        }).catch(function(err) {
          delete queue[url];
          throw err;
        });
      } else {
        _pendingRequests++;
        console.log('INCREMENTED PENDING REQUESTS', _pendingRequests);
        // normal operation
        promise = $delegate.apply($delegate, arguments);
      }

      return promise.then(function(response) {
        console.log('Request Complete', requestConfig.url);
        _pendingRequests--;
        _notifyIfPrerenderReady();
        return response;
      }).catch(function(err) {
        _pendingRequests--;
        _notifyIfPrerenderReady();
        throw err;
      });

      function _notifyIfPrerenderReady() {
        if(_pendingRequests === 0 && _prerenderResolve) {
          clearTimeout(_prerenderReady);
          _prerenderReady = setTimeout(function() {
            console.log('PRERENDER IS READY!');
            var tmp = _prerenderResolve;
            _prerenderResolve = null;
            tmp();
          }, 400 /*TODO: config var?*/);
        }
      }
    }
    angular.extend($http, $delegate);
    return $http;
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

// TODO: move much (if not all) module.run code to app-component's controller?

/* @ngInject */
module.run(function(
  $http, $location, $rootScope, $route, $window, config, util) {
  /* Note: $route is injected above to trigger watching routes to ensure
    pages are loaded properly. */

  // default headers
  $http.defaults.headers.common.Accept =
    'application/ld+json, application/json, text/plain, */*';
  $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

  // TODO: deprecated, only really used for `$root.requirejs.toUrl` in
  // templates which has been replaced by `resolvePackageUrl` filter
  $rootScope.requirejs = requirejs;

  // set site and page titles
  $rootScope.siteTitle = $window.data.siteTitle;
  $rootScope.pageTitle = $window.data.pageTitle;
  $rootScope.productionMode = $window.data.productionMode;
  $rootScope.demoWarningUrl = $window.data.demoWarningUrl;

  // route info
  $rootScope.route = {
    changing: false,
    // tracks whether current page is using an angular view (page is a route)
    on: false
  };
  $rootScope.location = $location;

  // do immediate initial location change prior to loading any page content
  // in case a redirect is necessary
  locationChangeStart();

  $rootScope.$on('$locationChangeStart', locationChangeStart);

  // monitor whether or not an angular view is in use (current page is a route)
  $rootScope.$on('$viewContentLoaded', function() {
    $rootScope.route.on = true;
  });

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
  $rootScope.app.config = config;
  $rootScope.app.jsonld = util.jsonld;
  $rootScope.app.util = util;

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
    var reload = !($rootScope.route.on &&
      util.getRouteFromPath($route, $location.path()));
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
