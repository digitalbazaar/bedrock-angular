# bedrock-angular ChangeLog

## [Unreleased]

## [1.4.3] - 2015-10-27

### Changed
- Update `jsonld` dependency.

## [1.4.2] - 2015-10-26

### Changed
- Initialize `$rootScope.app.services` early.

## [1.4.1] - 2015-10-21

### Fixed
- Set `ng-app` only after document is ready to avoid double-bootstrap bug.

## [1.4.0] - 2015-10-14

### Changed
- Use `config.data.contextMap` in json-ld document loader.

## [1.3.0] - 2015-09-17

### Added
- Expose `$location` via `rootScope.location`.

## [1.2.2] - 2015-09-14

### Changed
- Update jsonld dependency.

## [1.2.1] - 2015-09-11

### Changed
- Handle route detection on frontend (no longer requires backend `noRoute`
  configuration).

## [1.2.0] - 2015-08-24

### Changed
- Clear `noRoute` configuration when an angular route is detected; allows
  angular routes to be added w/o requiring a paired backend express route.

## [1.1.0] - 2015-07-13

### Added
- Add `br-selected` and `br-selectable` selection utility CSS classes.

## [1.0.1] - 2015-05-07

### Fixed
- Ensure `totalPendingRequests` is set on `$templateRequest` decorator.

## [1.0.0] - 2015-04-08

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

[Unreleased]: https://github.com/digitalbazaar/bedrock-angular/compare/1.4.3...HEAD
[1.4.3]: https://github.com/digitalbazaar/bedrock-angular/compare/1.4.2...1.4.3
[1.4.2]: https://github.com/digitalbazaar/bedrock-angular/compare/1.4.1...1.4.2
[1.4.1]: https://github.com/digitalbazaar/bedrock-angular/compare/1.4.0...1.4.1
[1.4.0]: https://github.com/digitalbazaar/bedrock-angular/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/digitalbazaar/bedrock-angular/compare/1.2.2...1.3.0
[1.2.2]: https://github.com/digitalbazaar/bedrock-angular/compare/1.2.1...1.2.2
[1.2.1]: https://github.com/digitalbazaar/bedrock-angular/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/digitalbazaar/bedrock-angular/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/digitalbazaar/bedrock-angular/compare/1.0.1...1.1.0
[1.0.1]: https://github.com/digitalbazaar/bedrock-angular/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/digitalbazaar/bedrock-angular/compare/0.1.0...1.0.0
