/*!
 * Main Bedrock Application module.
 *
 * Copyright (c) 2012-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
'use strict';

import angular from 'angular';
import jsonld from 'jsonld';
import 'angular-route';
import AppComponent from './app-component.js';
import DemoWarningComponent from './demo-warning-component.js';
import RouteLoadingComponent from './route-loading-component.js';

/**
 * Starts the main angular application by bootstrapping angular.
 *
 * @param root the root module for the application.
 */
export function bootstrap(rootModule) {
  // bootstrap and set ng-app to indicate to test runner/other external apps
  // that application has bootstrapped (use strictDi when minified)
  const root = angular.element(document.querySelector('html'));
  angular.bootstrap(root, [rootModule.name], {strictDi: window.data.minify});
  angular.element(document).ready(function() {
    root.attr('ng-app', rootModule.name);
  });
}

// render notification support (useful for prerendering, etc.)
let _renderResolve;
let _renderPromise;
let _pendingRequests = 0;
let _rendered;

/**
 * Returns a Promise that resolves once the page is considered fully rendered.
 *
 * This is useful for prerendering tools to call to determine if a page's
 * contents are ready to be proxied to a crawler that lacks JS-support.
 */
export function render() {
  if(_renderPromise) {
    return _renderPromise;
  }
  _renderPromise = new Promise(function(resolve) {
    _renderResolve = resolve;
  });
  notifyIfRendered();
  return _renderPromise;
}

function notifyIfRendered() {
  if(_pendingRequests === 0 && _renderResolve) {
    clearTimeout(_rendered);
    _rendered = setTimeout(() => {
      const tmp = _renderResolve;
      _renderResolve = null;
      tmp();
    }, config.data.renderTimeout);
  }
}

// shared application bedrock config
export const config = {data: window.data};

// main bedrock module
const module = angular.module('bedrock', ['ngRoute']);

// register root components
module.component('brApp', AppComponent);
module.component('brDemoWarning', DemoWarningComponent);
module.component('brRouteLoading', RouteLoadingComponent);

// module config and run
module
  // injectable shared bedrock config
  .value('config', config)
  .config(configure)
  .run(run);

// stores initial URL to prevent infinite reloads on 404
let initialUrl;

/* @ngInject */
function configure(
  $compileProvider, $httpProvider, $locationProvider, $provide,
  $routeProvider) {
  // TODO: are these the defaults now in Angular 1.6? Can we remove?
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');

  // Disable debug data
  // See: https://docs.angularjs.org/guide/production
  $compileProvider.debugInfoEnabled(false);

  // route not found handling
  $routeProvider.when('/404', {
    templateUrl: 'bedrock-angular/404.html'
  }).otherwise({
    /* @ngInject */
    resolveRedirectTo: ($location) => {
      if(initialUrl === $location.url()) {
        return '/404';
      }
      window.location = $location.url();
    }
  });

  // TODO: is this the default in Angular 1.6 now? can we remove?
  $httpProvider.useApplyAsync(true);

  // normalize errors, deal w/auth redirection
  /* @ngInject */
  $httpProvider.interceptors.push(($rootScope, $q) => {
    return {
      responseError: async response => {
        let error = response.data || {};
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
  $provide.decorator('$templateRequest', function($delegate, config) {
    // replace $templateRequest with package-relative template URL handling
    // and template override support:

    // get base URL for modules and override list
    const templateConfig = config.data.angular.templates;
    const baseUrl = templateConfig.baseUrl;
    const overrides = templateConfig.overrides;

    const $templateRequest = function(tpl) {
      let relativeUrl = tpl;
      if(tpl.indexOf(baseUrl) === 0) {
        relativeUrl = tpl.substr(baseUrl.length);
      } else if(tpl.indexOf('./') === 0) {
        relativeUrl = tpl.substr(1);
        tpl = baseUrl + relativeUrl;
      } else if(tpl[0] !== '/') {
        tpl = baseUrl + '/' + relativeUrl;
      }
      // TODO: handle relative urls comprehensively (e.g. '../' case, etc.)
      if(relativeUrl in overrides) {
        tpl = baseUrl + overrides[relativeUrl];
      }
      arguments[0] = tpl;
      const promise = $delegate.apply($delegate, arguments).finally(() => {
        $templateRequest.totalPendingRequests = $delegate.totalPendingRequests;
      });
      $templateRequest.totalPendingRequests = $delegate.totalPendingRequests;
      return promise;
    };
    $templateRequest.totalPendingRequests = $delegate.totalPendingRequests;
    return $templateRequest;
  });

  /* @ngInject */
  $provide.decorator('$http', ($delegate, $q) => {
    // define $http request queue, integrated with prerendering capability:

    // shared global queue, can be overridden with a queue from requestConfig
    const _queue = {};

    // override $http to use queue and track pending requests for render notify
    const $http = async function(requestConfig) {
      _pendingRequests++;
      let response;
      let error;

      try {
        // if method is not GET or queue is not truthy, do not use queue
        if(requestConfig.method.toLowerCase() !== 'get' ||
          !requestConfig.queue) {
          response = await $delegate.apply($delegate, arguments);
        } else {
          // use global or specified queue
          const queue = (requestConfig.queue === true ?
            _queue : requestConfig.queue);
          // TODO: does not account for requestConfig.params, etc
          const url = requestConfig.url;
          if(url in queue) {
            // await response but do not clear queue because we were not
            // the first to request the URL
            response = await queue[url];
          } else {
            // await response and ensure queue is cleared because we're
            // the first to request the URL
            try {
              queue[url] = $delegate.apply($delegate, arguments);
              response = await queue[url];
              delete queue[url];
            } catch(e) {
              delete queue[url];
              error = e;
            }
          }
        }
      } catch(e) {
        error = e;
      }

      // always decrement pending request count and notify if rendered
      _pendingRequests--;
      notifyIfRendered();

      // now throw error if detected
      if(error) {
        return $q.reject(error);
      }

      return $q.resolve(response);
    };
    angular.extend($http, $delegate);
    return $http;
  });
}

/* @ngInject */
function run($http, $location, $rootScope, $window, config) {
  /* Note: $route is injected above to trigger watching routes to ensure
    pages are loaded properly. */

  // TODO: move this into a new brJsonLdService? needs to load early though
  // configure default document loader to load contexts locally
  jsonld.useDocumentLoader('xhr', {secure: true});
  const documentLoader = jsonld.documentLoader;
  jsonld.documentLoader = url => {
    // TODO: add integration w/$http cache
    if(url in config.data.contextMap) {
      url = config.data.contextMap[url];
    }
    return documentLoader(url);
  };

  // default headers
  $http.defaults.headers.common.Accept =
    'application/ld+json, application/json, text/plain, */*';

  // store initial URL to prevent redirect loops
  initialUrl = $location.url();

  // set site and page titles
  $rootScope.siteTitle = $window.data.siteTitle;
  $rootScope.pageTitle = $window.data.pageTitle;
  // TODO: move to frontend configuration file
  $rootScope.productionMode = $window.data.productionMode;
  $rootScope.demoWarningUrl = $window.data.demoWarningUrl;

  // route info
  $rootScope.route = {
    changing: false
  };
  // reveal location to view
  $rootScope.location = $location;

  // reveal route changes to view
  $rootScope.$on('$routeChangeStart', event => {
    if(!event.defaultPrevented) {
      $rootScope.route.changing = true;
    }
  });

  $rootScope.$on('$routeChangeError', () => {
    $rootScope.route.changing = false;
  });

  // set route vars when route changes
  $rootScope.$on('$routeChangeSuccess', (event, current, previous) => {
    $rootScope.route.changing = false;
    // TODO: clean up needed
    // FIXME: angular13 fix this
    if(current) {
      $rootScope.route.current = current;
      if('$$route' in current) {
        $rootScope.route.vars = (current.$$route.vars ||
          (current.$$route.vars = {}));
      } else if('vars' in current) {
        $rootScope.route.vars = current.vars;
      } else {
        $rootScope.route.vars = {};
      }
      // FIXME: remove once routes switched to above vars object
      if(!('title' in $rootScope.route.vars) && current.title) {
        $rootScope.route.vars.title = current.title;
      }
    } else {
      $rootScope.route.current = null;
      $rootScope.route.vars = {};
    }
  });

  // access to app core class and style
  $rootScope.app = {};
  $rootScope.app.ngClass = {};
  $rootScope.app.ngStyle = {};
}
