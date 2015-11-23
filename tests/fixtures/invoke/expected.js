angular.module('foo', [])
  .run(['$injector', 'SomeService', function($injector, SomeService) {
    $injector.invoke(['$state', function($state) {
      $state.go('somewhere');
    }]);
    SomeService.invoke('someMehod');
  }]);
