angular.module('foo', []).service('User', ['$http', function ($http) {
  return {
    get: function get(id) {
      return $http.get('users/' + id);
    }
  };
}]);
