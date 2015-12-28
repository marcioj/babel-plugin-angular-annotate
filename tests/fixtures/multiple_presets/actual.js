angular.module('foo', [])
  .run(function($injector, SomeService) {
    $injector.invoke(function($state) {
      $state.go('somewhere');
    });
  })
  .controller('FooCtrl', function($mdDialog, customService) {
    customService.injectableFunction(function(dep) {
    });
    $mdDialog.show({
      controller: function(a, b) {

      }
    });
  });
