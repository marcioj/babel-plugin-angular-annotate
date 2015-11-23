angular.module('foo', [])
  .factory('User', function($http) {
    return {
      get(id) {
        return $http.get(`users/${id}`);
      }
    }
  });
