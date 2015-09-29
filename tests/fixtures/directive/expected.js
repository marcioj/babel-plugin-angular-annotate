angular.module('foo', [])
  .directive('message', ['foo', function(foo) {
    return {
      restrict: 'A',
      controller: ['$state', '$scope', function($state, $scope) {
        $scope.message = 'Hello world';
      }],
      link: function(scope, elem, attrs) {
      }
    }
  }]);
