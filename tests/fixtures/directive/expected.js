function MessageCtrl2($state, $scope) {
  $scope.message = 'Hello world';
}

class MessageCtrl3 {
  constructor($state, $scope) {
    $scope.message = 'Hello world';
  }
}

angular.module('foo', [])
  .directive('message', ['foo' , '$injector', function(foo, $injector) {
    $injector.invoke(['foo', function(foo) {
    }]);
    return {
      restrict: 'A',
      controller: ['$state', '$scope', function($state, $scope) {
        $scope.message = 'Hello world';
      }],
      link: function(scope, elem, attrs) {
      }
    }
  }])
  .directive('message2', ['foo', function(foo) {
    return {
      restrict: 'A',
      controller: ['$state', '$scope', MessageCtrl2],
      link: function(scope, elem, attrs) {
      }
    }
  }])
  .directive('message3', ['foo', function(foo) {
    return {
      restrict: 'A',
      controller: ['$state', '$scope', MessageCtrl3],
      link: function(scope, elem, attrs) {
      }
    }
  }])
  .directive('deeper', ['foo', function(foo) {
    return {
      restrict: 'A',
      controller: ['$state', '$scope', MessageCtrl3],
      link: function(scope, elem, attrs) {
      }
    }
  }])
;
