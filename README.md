# babel-plugin-angular-annotate

>  Make angular dependency annotation minification proof

[![Build Status][travis_badge]][travis]

:warning: This is still under development :warning:

## Installation

```sh
npm install babel-plugin-angular-annotate
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```js
{
  "plugins": ["angular-annotate"],
  "extra": { "angular-annotate": [configurations...] }
}
```

### Via CLI

```sh
$ babel --plugins angular-annotate script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["angular-annotate"],
  extra: { "angular-annotate": [configurations...] }
});
```

## Configuration

`angular-annotate` accepts a json like injection configuration starting with an array containing two items in this format: `[method call, args]`.

`method call` is expressed as a string with the service name and method call. For instance `"$injector.invoke"`.
You can also nest calls. For instance: `"$httpProvider.interceptors.push"`.

`args` is where you map each param with the corresponding injection strategy. The two possible are: `"$injectFunction"` and `"$injectObject"`.
Any other value will be ignored.

`$injectFunction` will transform:

```js
function (a, b, c) {
}
```

to

```js
['a', 'b', 'c', function (a, b, c) {
}]
```

For instance to create a rule for `$injector.invoke` you can apply the following configuration: `["$injector.invoke", ["$injectFunction"]]`.

So the following will be transformed:

Before:

```js
$injector.invoke(function($state) {
  $state.go('somewhere');
});
```

After:

```js
$injector.invoke(['$state', function($state) {
  $state.go('somewhere');
}]);
```

`$injectObject` will apply `$injectFunction` for each object value. This is mainly used in the `resolve` property from some services. For example:

The `$routeProvider.when` configuration can be expressed with the following:

```json
["$routeProvider.when", ["_", {
  "controller": "$injectFunction",
  "resolve": "$injectObject"
}]];
```

Before:


```js
$routeProvider.when('/foo', {
  controller: function($scope) {
    $scope.message = 'foo';
  },
  templateUrl: 'foo.html',
  resolve: {
    store: function (foo) {
    }
  }
});
```

After:

```js
$routeProvider.when('/foo', {
  controller: ['$scope', function($scope) {
    $scope.message = 'foo';
  }],
  templateUrl: 'foo.html',
  resolve: {
    store: ['foo', function (foo) {
    }]
  }
});
```

Note that since we don't want to do anything in the routeName we use a `"_"` to ignore it.

## Running Tests

`npm test`

## Contributing

1. Fork it
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Commit your changes (`git commit -am 'Add some feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Create new Pull Request

[travis]: https://travis-ci.org/marcioj/babel-plugin-angular-annotate
[travis_badge]: https://api.travis-ci.org/marcioj/babel-plugin-angular-annotate.svg?branch=master
