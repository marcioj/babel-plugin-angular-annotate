angular.module('foo', [])
  .service('User', function($http) {
    return {
      get(id) {
        return $http.get(`users/${id}`);
      }
    }
  });
