function MessageCtrl2($state, $scope) {
  $scope.message = 'Hello world';
}

class MessageCtrl3 {
  constructor($state, $scope) {
    $scope.message = 'Hello world';
  }
}

angular.module('foo', [])
  .directive('message', function(foo, $injector) {
    $injector.invoke(function(foo) {
    });
    return {
      restrict: 'A',
      controller: function($state, $scope) {
        $scope.message = 'Hello world';
      },
      link: function(scope, elem, attrs) {
      }
    }
  })
  .directive('message2', function(foo) {
    return {
      restrict: 'A',
      controller: MessageCtrl2,
      link: function(scope, elem, attrs) {
      }
    }
  })
  .directive('message3', function(foo) {
    return {
      restrict: 'A',
      controller: MessageCtrl3,
      link: function(scope, elem, attrs) {
      }
    }
  })
  .directive('deeper', function(foo) {
    return {
      restrict: 'A',
      controller: MessageCtrl3,
      link: function(scope, elem, attrs) {
      }
    }
  })
;
