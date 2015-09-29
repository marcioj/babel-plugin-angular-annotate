angular.module('foo', [])
  .filter('sum', function(foo, bar) {

    return function(a, b) {
      return a + b;
    }
  });
