angular.module('foo', [])
  .run(['$injector', 'SomeService', function($injector, SomeService) {
    $injector.invoke(['$state', function($state) {
      $state.go('somewhere');
    }]);
    SomeService.invoke('someMehod');

    let inj = $injector;
    inj.invoke(['$http', function($http) {
      $http.get('users');
    }]);

    inj.toString(function($http) {
      $http.get('users');
    });
  }]);
