# bedrock-angular ChangeLog

## 4.1.2 - 2018-05-02

### Fixed
- Fix import of `bedrock-web`.

## 4.1.1 - 2018-05-02

### Changed
- Use `bedrock-web` to start.

## 4.1.0 - 2018-03-22

### Changed
- Use `bedrock-frontend` to start.

## 4.0.1 - 2017-09-19

### Fixed
- Use `window` instead of `global`.

## 4.0.0 - 2017-09-06

### Removed
- Do not include `bedrock-angular-jsonld` by default. Projects
  that use JSON-LD in their AngularJS app should include it
  as a dependency on their own.

## 3.2.0 - 2017-09-06

### Changed
- Provide JSON-LD support via `bedrock-angular-jsonld` dependency.

## 3.1.2 - 2017-08-24

### Fixed
- Do not show console warning when bootstrap is deliberately disabled.

## 3.1.1 - 2017-08-24

### Fixed
- Clear br-app contents when no root module is set.

## 3.1.0 - 2017-08-24

### Added
- Improve route load spinner and add app load spinner CSS.

## 3.0.3 - 2017-08-24

### Fixed
- Issue warning and return when no root module has
  been set and bootstrap is called.

## 3.0.2 - 2017-06-28

### Fixed
- Handle bad/missing root module error/warning cases.

## 3.0.1 - 2017-06-26

### Fixed
- Pass optional callback through to `jsonld.documentLoader`.

## 3.0.0 - 2017-06-04

### Added
- New API for setting the root module and starting/bootstrapping
  the angular application.

### Changed
- BREAKING: Switch package manager from bower to npm.
- BREAKING: Replace requirejs/amd with ES6 import.
- BREAKING: Simplify app-component.html, removing significant logic
  and replacing with customizable (but undefined by this package)
  components such as br-header, br-footer, and br-router-outlet.
- BREAKING: General rewrite and simplification of route handling
  and all other core bedrock-angular features.
- Angular 1.6.x is required.

### Removed
- Remove unused fonts/ dir.
- Remove bower.json.

## 2.9.0 - 2017-05-08

### Added
- Add `br-route-loading` component for better extensibility.

## 2.8.1 - 2017-05-08

### Fixed
- Remove erroneous `overflow-y` CSS rule.

## 2.8.0 - 2017-05-08

### Added
- Add `br-flex-*` layout utility classes.

## 2.7.0 - 2017-04-28

### Added
- Add base classes for content and view to enable easier
  CSS customization.
- Add automatic route loading animation spinner for
  slow route resolvers.

## 2.6.0 - 2017-03-02

### Changed
- Support both bedrock-angular-footer 2 and 3.

## 2.5.2 - 2017-02-22

### Changed
- Fix root container class logic.

## 2.5.1 - 2017-02-14

### Changed
- Update font-awesome to 4.7.

## 2.5.0 - 2017-02-13

### Added
- Add options for configuring root container css.

## 2.4.2 - 2016-12-16

### Fixed
- Pull `vars` from `$$route` if available or not in `current`.

## 2.4.1 - 2016-11-15

### Changed
- Remove `css` folder.

## 2.4.0 - 2016-10-18

### Added
- Add `permissionDenied` event when HTTP requests are rejected.
- Support for prerendering pages.

## 2.3.5 - 2016-08-13

### Fixed
- Prevent br-app recursion when templates are not found.

## 2.3.4 - 2016-07-26

### Fixed
- Initialize jsonld document loader early (when `bedrock.config` loads).
- Do not overwrite `_bedrock` on `angular`.

## 2.3.3 - 2016-07-24

### Fixed
- Use root scope for demo warning vars.

## 2.3.1 - 2016-06-29

### Changed
- Disable debug data. See https://docs.angularjs.org/guide/production.

## 2.3.1 - 2016-06-28

### Changed
- Do not require navbar to use alerts.

## 2.3.0 - 2016-06-18

### Added
- Add `queue` option for $http GET requests.

## 2.2.2 - 2016-06-17

### Changed
- Update angular to ~1.5.6.

## 2.2.1 - 2016-05-31

### Fixed
- Handle plain text error responses.

### Changed
- Update error type name from 'website.Exception' to just 'Error'.

## 2.2.0 - 2016-05-13

### Added
- New `resolvePackageUrl` filter that can be used in HTML templates instead
  of the now deprecated `$root.requirejs.toUrl(...)`.

## 2.1.0 - 2016-04-15

### Added
- New app component that encompasses the entire main body
  of the application and loads routes via ng-view. This
  component replaces old behavior that was provided by
  bedrock-views and allows customization to happen more
  readily at the angular layer.

## 2.0.0 - 2016-04-09

### Changed
- **BREAKING**: Update to angular 1.5.

## 1.5.1 - 2016-03-17

### Changed
- Update dependencies.
- Replace underscore with lodash.

## 1.5.0 - 2015-12-06

### Added
- Add option to disable autostart (angular bootstrapping) of application. This
  allows test frameworks to delay bootstrapping if necessary.

### Fixed
- Ensure `init` is always called when `start` is executed.

## 1.4.4 - 2015-10-29

### Fixed
- Do not overwrite $rootScope.app.

## 1.4.3 - 2015-10-27

### Changed
- Update `jsonld` dependency.

## 1.4.2 - 2015-10-26

### Changed
- Initialize `$rootScope.app.services` early.

## 1.4.1 - 2015-10-21

### Fixed
- Set `ng-app` only after document is ready to avoid double-bootstrap bug.

## 1.4.0 - 2015-10-14

### Changed
- Use `config.data.contextMap` in json-ld document loader.

## 1.3.0 - 2015-09-17

### Added
- Expose `$location` via `rootScope.location`.

## 1.2.2 - 2015-09-14

### Changed
- Update jsonld dependency.

## 1.2.1 - 2015-09-11

### Changed
- Handle route detection on frontend (no longer requires backend `noRoute`
  configuration).

## 1.2.0 - 2015-08-24

### Changed
- Clear `noRoute` configuration when an angular route is detected; allows
  angular routes to be added w/o requiring a paired backend express route.

## 1.1.0 - 2015-07-13

### Added
- Add `br-selected` and `br-selectable` selection utility CSS classes.

## 1.0.1 - 2015-05-07

### Fixed
- Ensure `totalPendingRequests` is set on `$templateRequest` decorator.

## 1.0.0 - 2015-04-08

### Added
- Expose requirejs on $rootScope. Useful when needed in ng-include:
```html
<div ng-include="$root.requirejs.toUrl('mod/path/to/template.html')"></div>
```

### Removed
- Remove `angular-file-upload` as an explicit core dependency.
- Remove `jquery-migrate` support.

## 0.1.0 (up to early 2015)

- See git history for changes.
