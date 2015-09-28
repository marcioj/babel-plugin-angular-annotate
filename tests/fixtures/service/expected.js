angular.module('foo', [])
  .service('User', ['$http', function ($http) {
    return {
      get(id) {
        return $http.get(`users/${id}`);
      }
    };
  }]);
