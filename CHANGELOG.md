# bedrock-angular ChangeLog

## 2.3.2 - 2016-07-24

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
