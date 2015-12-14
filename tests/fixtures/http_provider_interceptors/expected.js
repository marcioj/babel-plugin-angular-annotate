angular.module('app', [])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(['$q', 'dependency1', 'dependency2', function($q, dependency1, dependency2) {
      return {
        'request': function(config) {
        },
        'response': function(response) {
        }
      };
    }]);
  }]);
