# bedrock-angular

A [bedrock][] [bower][] module that provides an extensible [AngularJS][]
application. The application provides common, basic functionality such as
a simple, [bedrock][]-integrated, configuration system, animations, application
routing, multi-transclusion support, and [UI Bootstrap][] support. It can
be extended using other angular modules, in most cases, by simply installing
them via [bower][].

[Click here to read about style guidelines and how to write AngularJS modules for the bedrock framework](See [bedrock-angular](https://github.com/digitalbazaar/bedrock-angular/blob/master/CONTRIBUTING.md).

[Click here to learn how to write a bedrock-angular "pseudo bower" package](https://github.com/digitalbazaar/bedrock-examples/blob/master/angular-basic).

<!-- TODO -->

## Quick Examples

```
bower install bedrock-angular
```

<!-- TODO -->

## Configuration

<!-- TODO -->

## How It Works

### A Quick Bedrock Primer

[Bedrock][] is a foundation onwhich to build web applications. It uses a
modular design to help keep code well-organized and to allow a healthy
ecosystem to grow without hindrance. It is also designed to make it possible
to provide most of the generic, core infrastructure your project needs
via simple installation, with zero or minimal configuration.

[Bedrock][] web applications are typically built by installing a backend
[npm][] module, [bedrock-views][], and a companion frontend [bower][] package,
[bedrock-angular][].

The [bedrock-views][] module, via a dependency [bedrock-requirejs][], expects
all frontend code to behave like a [bower][] package. This means that any
packages you install via [bower][] will be automatically made available to
the browser once you've installed them and restarted your [bedrock][] server.
If you want to serve a directory that isn't in a [bower][] package, you can
manually add a [bower][] manifest for it to [bedrock][]'s configuration system.
This establishes a "pseudo bower package" for your directory, causing it to be
treated just like it was any other [bower][] package.

[Click here to learn how to write a bedrock-angular "pseudo bower" package](https://github.com/digitalbazaar/bedrock-examples/blob/master/angular-basic).

The [bedrock-angular][] package will create a core, generic [AngularJS][]
application for you, and automatically integrate any [bower][] packages that
contain [AngularJS][] components.

So, taken together, all you should need to do to add new frontend content to
your [bedrock][]-based [AngularJS][] web application is install [bower][]
packages or manually describe directories as if they were [bower][] packages.

### Overview

<!-- TODO -->

### Serving components

First we need to learn how [bedrock][] makes components available to the
browser. When components are installed via [bower][] packages, [bedrock][] will
automatically parse their `bower.json` files and make them available to the
browser.

Not every component will be installed via [bower][]. For those that are
manually integrated into our application, we need to update [bedrock][]'s
configuration to tell [bedrock][] to treat them as if they were [bower][]
packages.

To do this we create a "pseudo bower package" for each component. This is just
a way to get directories to behave like [bower][] packages, so that [bedrock][]
can deal with both [bower][] packages and directories in a consistent way.

These "pseudo bower packages" are pushed onto an array that is referenced in
[bedrock][]'s configuration system as:

```
bedrock.config.requirejs.bower.packages
```

[Click here to learn how to write a bedrock-angular "pseudo bower" package](https://github.com/digitalbazaar/bedrock-examples/blob/master/angular-basic).

### Template replacement

[Click here to learn how to write a basic "skinning" package](https://github.com/digitalbazaar/bedrock-examples/blob/master/basic-skin).

[Click here to learn how to write an advanced "skinning" package](https://github.com/digitalbazaar/bedrock-examples/blob/master/advanced-skin).

<!--
TODO: general
-->

[AngularJS]: https://github.com/angular/angular.js
[bedrock]: https://github.com/digitalbazaar/bedrock
[bedrock-angular]: https://github.com/digitalbazaar/bedrock-angular
[bedrock-express]: https://github.com/digitalbazaar/bedrock-express
[bedrock-requirejs]: https://github.com/digitalbazaar/bedrock-requirejs
[bedrock-views]: https://github.com/digitalbazaar/bedrock-views
[bower]: http://bower.io/
[clean-css]: https://github.com/jakubpawlowicz/clean-css
[html-minifier]: https://github.com/kangax/html-minifier
[less]: https://github.com/less/less.js/
[ng-annotate]: https://github.com/olov/ng-annotate
[Less]: http://lesscss.org/
[RequireJS]: http://requirejs.org/
[Swig]: http://paularmstrong.github.io/swig/
[UI Bootstrap]: http://angular-ui.github.io/bootstrap/
[npm]: https://www.npmjs.com
