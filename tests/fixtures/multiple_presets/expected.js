angular.module('foo', [])
  .run(['$injector', 'SomeService', function($injector, SomeService) {
    $injector.invoke(['$state', function($state) {
      $state.go('somewhere');
    }]);
  }])
  .controller('FooCtrl', ['$mdDialog', 'customService', function($mdDialog, customService) {
    customService.injectableFunction(['dep', function(dep) {
    }]);
    $mdDialog.show({
      controller: ['a', 'b', function(a, b) {

      }]
    });
  }]);
