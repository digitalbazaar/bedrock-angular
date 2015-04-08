# bedrock-angular ChangeLog

## [Unreleased]

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

[Unreleased]: https://github.com/digitalbazaar/bedrock-angular/compare/1.0.0...HEAD
[1.0.0]: https://github.com/digitalbazaar/bedrock-angular/compare/0.1.0...1.0.0
