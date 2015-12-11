angular.module('foo', [])
  .run(function($injector, SomeService) {
    $injector.invoke(function($state) {
      $state.go('somewhere');
    });
    SomeService.invoke('someMehod');

    let inj = $injector;
    inj.invoke(function($http) {
      $http.get('users');
    });

    inj.toString(function($http) {
      $http.get('users');
    });
  });
