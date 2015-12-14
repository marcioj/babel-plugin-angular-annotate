angular.module('app', [])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push(function($q, dependency1, dependency2) {
      return {
        'request': function(config) {
        },
        'response': function(response) {
        }
      };
    });
  });
