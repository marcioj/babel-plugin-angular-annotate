angular.module('foo', [])
  .run(function($injector, SomeService) {
    $injector.invoke(function($state) {
      $state.go('somewhere');
    });
    SomeService.invoke('someMehod');
  });
