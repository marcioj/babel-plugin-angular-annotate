angular.module('foo', [])
  .factory('User', ['$http', function ($http) {
    return {
      get(id) {
        return $http.get(`users/${id}`);
      }
    };
  }]);
