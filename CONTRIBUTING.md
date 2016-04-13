# Contributing to bedrock-angular

Details for developers about contributing to bedrock-angular or writing
bedrock-based angular modules that depend upon it.

## Commit Messages

* Use present tense, so it's read as: If you applied this changeset, X will happen.
* Start with a capital letter; use proper capitalization throughout, end with a period.
* Keep the first message under 50 chars if possible, (certainly under 80). It should express a basic summary of the changeset. Be specific, don't just say "Fix the bug."
* If you have more to express after the summary, leave an empty line after the opening summary and then express whatever you need in an extended description.
* If you need to reference issues, then after the optional extended description, leave an empty line and then use `Addresses #issue-number` (for example).

Example commit messages:

```
Add infinite scroll to comment section.

- Replaces existing pagination mechanism with an infinite scroll feature.
- Future work includes CSS-animated fireworks when new comments arrive.

Addresses #123.
```

```
Fix memory leak in animation runner.

When canceling an animation, a closure was created that had a reference
to a DOM element that caused it to be held indefinitely in jquery's cache.
The closure has been reworked to avoid the reference.

Addresses #124.
```

## Writing AngularJS modules based on bedrock-angular

### Module Terminology

The commonly used terms "module" and "component" are often overloaded to take
on variety of different meanings. In order to understand any particular usage,
you must understand the context. Below are examples of modules or components.

***client-side module*** - A piece of software that can be loaded by a browser.
These may be defined according to a particular package manager, such as
[bower][].

***bower component*** - A type of client-side module. It is a collection of
files, including a `bower.json` manifest file, that can be installed via
[bower][] and configured by Bedrock to be loaded in a browser. This is also
sometimes referred to as a "package".

***AMD module*** - A single JavaScript file that includes a standard
"Asynchronous Module Definition". In other words, it is a JavaScript file
that begins with a call to a function, `define`, whose parameters express
the names of other AMD modules that it depends on and, optionally, its own
name (the name is usually provided via an external configuration instead). A
file with this definition can be loaded asynchronously and evaluated in the
proper order by an AMD module loader, such as [RequireJS][]. Bedrock has a
module, [bedrock-requirejs][] that can automatically configure AMD modules to
load properly in the browser.

***AngularJS module*** - A set of related features that can be added to an
AngularJS application. AngularJS modules are an AngularJS abstraction, they
are agnostic with respect to how they are loaded by a browser. The angular
subsystem, however, requires that AngularJS modules declare their dependencies
(which are other AngularJS modules) to ensure that AngularJS loads them
in the proper order. It is up to a different layer to ensure that those
modules are made available to be loaded. AngularJS modules themselves may
be composed of several different parts, each of which may be defined by
an AMD module.

***AngularJS component*** - A special type of AngularJS directive that is
loaded when the AngularJS compiler processes the DOM and finds an element
with a name that matches that declared by the component. AngularJS components
are defined within AngularJS modules.

A bower component that depends on bedrock-angular is typically organized
like this:

```
|-----------Bower Component----------|
|                                    |
| |-------------MANIFEST-----------| |
| |                                | |
| | bower.json:                    | |
| | - defines the name of the      | |
| |   package                      | |
| | - defines main JavaScript file | |
| |   for the package              | |
| | - the package name and main    | |
| |   file are used by             | |
| |   bedrock-requirejs to         | |
| |   auto-configure the package   | |
| |   so it can load when the      | |
| |   the browser requests it      | |
| |--------------------------------| |
|                                    |
| |--------AngularJS Module--------| |
| |                                | |
| | |---------AMD MODULE---------| | |
| | |                            | | |
| | | main.js:                   | | |
| | | - provides AngularJS       | | |
| | |   module definition        | | |
| | | - includes dependencies    | | |
| | |   like foo-component.js    | | |
| | |   and calls their register | | |
| | |   functions                | | |
| | |----------------------------| | |
| |                                | |
| | |---------AMD MODULE---------| | |
| | |                            | | |
| | | foo-component.js:          | | |
| | | - defines AngularJS        | | |
| | |   component, "foo"         | | |
| | | - returns a register       | | |
| | |   function that main.js    | | |
| | |   calls with the AngularJS | | |
| | |   module instance so       | | |
| | |   the component can        | | |
| | |   register itself with it  | | |
| | |----------------------------| | |
| |                                | |
| |              ...               | |
| |                                | |
| |--------------------------------| |
|                                    |
|------------------------------------|
```

### Loading Modules

A typical Bedrock installation uses RequireJS (via [bedrock-requirejs][])
to load client-side modules. If a client-side module is installed via
[bower][], in most cases it can be auto-detected and served by Bedrock
without any additional configuration. Furthermore, if the module is an
AngularJS module and bedrock-angular is also installed, Bedrock will
automatically configure the main AngularJS application and register the
module with it, so it can be loaded when needed. This approach:

* Minimizes the amount of overhead work module and application writers have to
  perform.
* Allows developers to add or remove features from their bedrock-based
  application by simply adding or removing modules via [bower][] install
  and uninstall; no changes to the main application are necessary.
* No additional work is required to take advantage of Bedrock's client-side
  module optimization features.

While Bedrock can load any module, the best way to ensure your AngularJS module
can take advantage of these auto-detection, auto-configuration, and optimization
features is to use [bower][], depend on bedrock-angular, and wrap your
AngularJS module with an AMD `define` declaration.

For example:

```js
define(['angular'], function(angular) {

'use strict';

var module = angular.module('mynamespace.mymodule', ['myangulardependencies']);

// ...

});
```

### Organizing Modules

As a best practice, modules should be scoped to a particular feature set. This
usually means that a module provides a single component, which may include
other AngularJS elements such as controllers, services, filters, or templates.
However, sometimes a single module may provide multiple components. In either
case, each individual element should be given its own file, and that file
should be named after its element's type.

Here is an example of the directory layout for a module:

    .
    |-- bower.json
    |-- foo-bar-controller.js
    |-- foo-bar-component.js
    |-- foo-bar-directive.js
    |-- foo-bar-filter.js
    |-- foo-bar-service.js
    |-- foo-bar.html
    `-- main.js

Each JavaScript file will contain an AMD module and uses snake-case. The file
`main.js` is be responsible for defining the AngularJS module and loading all of
the controllers, components, directives, services, and filter files as
dependencies. It will look like this:

```js
define([
  'angular',
  './foo-bar-controller',
  './foo-bar-component',
  './foo-bar-directive',
  /*...*/], function(angular) {

'use strict';

var module = angular.module('mynamespace.mymodule', ['myangulardependencies']);

// register each element of the AngularJS module
Array.prototype.slice.call(arguments, 1).forEach(function(register) {
  register(module);
});

// do any module config
// module.config(...);

// run any post-config code
// module.run(...);

});
```

An example component would look like this:

```js
define([], function() {

'use strict';

function register(module) {
  module.component('prefixFooBar', {
    bindings: {
      title: '@?prefixTitle'
    },
    transclude: {
      'prefix-foo-bar-header': '?prefixFooBarHeader',
      'prefix-foo-bar-footer': '?prefixFooBarFooter'
    },
    templateUrl: requirejs.toUrl('my-bower-package-name/foo-bar.html')
  });
}

return register;

});
```

Naming conventions:

All files use lowercase and hyphens as a word delimiter. Controllers,
services, and directives should be prefixed and use camelCase. Filters
are not prefixed and use camelCase.

Controllers:

* Name: prefixFooBarController (camelCase)
* File: foo-bar-controller.js

Components:

* Name: prefixFooBar (camelCase)
* File: foo-bar-component.js

Directives:

* Name: prefixFooBar (camelCase)
* File: foo-bar-directive.js

Filters:

* Name: fooBar (camelCase)
* File: foo-bar-filter.js
*
Services:

* Name: prefixFooBarService (CamelCase)
* File: foo-bar-service.js

Templates:

* Name: foo-bar.html

Modals (if using bedrock-angular-modal):

* Name: prefixFooBarModal (camelCase)
* File: foo-bar-modal-component.js
* Template: foo-bar-modal.html

Selectors (if using bedrock-angular-selector):

* Name: prefixFooBarSelector (camelCase)
* File: foo-bar-selector-component.js
* Template: foo-bar-selector.html

Best practices:

* Use AngularJS 1.5+ component API whenever possible instead of the
  older directive API. Use defaults like `$ctrl`. Refer to the
  controller as `self` in controller code.
* Do not use two-way bindings unless there is no other reasonable
  way to achieve your goal. Use one-way bindings (`<`) for inputs and
  expression execution functions (`&`) for outputs.
* If you must use the directive API, always use a controller if any model
  is required and use the "controller as" syntax. Refer to the controller as
  `self` in controller code. Use "controller as $ctrl" in the common case where
  the view is simple and only one controller is used. Use 'controllerAs'
  property in directive.
* Do not add variables directly to the scope, as this may lead to unexpected
  behavior that results from prototypical inheritance patterns. Instead, use
  a controller and add them to it. Ensure you are also using `bindToController`
  to make sure any bindings are attached to the controller not the scope
  directly. In other words, use this definition:
```js
  {
    scope: {foo: '<'},
    controller: function() {},
    controllerAs: '$ctrl',
    bindToController: true
  }
```
* Use the annotation /* @ngInject */ before dependency-injected functions
  to ensure the build tools can appropriately deal with minification.

### Code Style

Regarding code style, please follow the [Angular Style Guide](https://github.com/johnpapa/angular-styleguide).

## Testing

See: [bedrock-protractor](https://github.com/digitalbazaar/bedrock-protractor))


[bedrock-requirejs]: https://github.com/digitalbazaar/bedrock-requirejs
[bower]: http://bower.io/
[AngularJS]: https://github.com/angular/angular.js
[RequireJS]: http://requirejs.org/
