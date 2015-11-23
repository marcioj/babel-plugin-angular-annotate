angular.module('route_configuration', [])
  .run(['$urlMatcherFactory', function ($urlMatcherFactory) {
    $urlMatcherFactory.strictMode(false);
  }]);
