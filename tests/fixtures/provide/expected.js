angular.module('config', [])
  .config(['$provide', function ($provide) {
    $provide.decorator('$exceptionHandler', ['$delegate', '$http', function($delegate, $http) {
    }]);

    $provide.service('foo', ['$http', function($http) {
    }]);

    let p = $provide;

    p.factory('bar', ['$http', function($http) {
    }]);

    p.provider('myProvider', ['$http', function($http) {
      this.$get = ['dependency', function(dependency) {
      }]
    }]);
  }]);
