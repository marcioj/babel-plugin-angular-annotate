angular.module('foo', [])
  .directive('message', function(foo) {
    return {
      restrict: 'A',
      controller: function($state, $scope) {
        $scope.message = 'Hello world';
      },
      link: function(scope, elem, attrs) {
      }
    }
  });
