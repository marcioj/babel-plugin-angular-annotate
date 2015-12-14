angular.module('config', [])
  .config(function ($provide) {
    $provide.decorator('$exceptionHandler', function($delegate, $http) {
    });

    $provide.service('foo', function($http) {
    });

    let p = $provide;

    p.factory('bar', function($http) {
    });

    p.provider('myProvider', function($http) {
      this.$get = function(dependency) {
      }
    });
  });
