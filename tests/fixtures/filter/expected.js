angular.module('foo', [])
  .filter('sum', ['foo', 'bar', (foo, bar) => {

    return function(a, b) {
      return a + b;
    }
  }]);
