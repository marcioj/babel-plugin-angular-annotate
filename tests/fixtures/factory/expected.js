angular.module('foo', [])
  .factory('User', ['$http', function ($http) {
    return {
      get(id) {
        return $http.get(`users/${id}`);
      }
    };
  }]);

function Utils(dateToUTC) {
  return {
    remainingHours(timestamp){
      let expireDate = dateToUTC(new Date(timestamp));
      expireDate.setDate(expireDate.getDate() + 2);
      let now = dateToUTC(new Date());
      return Math.round((expireDate.getTime() - now.getTime()) / 36e5);
    }
  };
}

angular
  .module('app')
  .factory('utils', ['dateToUTC', Utils]);
