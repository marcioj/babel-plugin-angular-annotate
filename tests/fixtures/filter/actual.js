angular.module('foo', [])
  .filter('sum', (foo, bar) => {

    return function(a, b) {
      return a + b;
    }
  });
