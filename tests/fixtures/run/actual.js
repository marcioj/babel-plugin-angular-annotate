angular.module('route_configuration', [])
  .run(function ($urlMatcherFactory) {
    $urlMatcherFactory.strictMode(false);
  });
