var todo = angular.module('todomvc', ['ngRoute', 'ngResource'])
      .config(['$routeProvider', function ($routeProvider) {
        var barConfig = {
          controller: 'BarCtrl',
          templateUrl: 'bar.html',
          resolve: {
            store: ['bar', function (bar) {
            }]
          }
        };

        $routeProvider.when('/foo', {
          controller: ['$scope', function($scope) {
            $scope.message = 'foo';
          }],
          templateUrl: 'foo.html',
          resolve: {
            store: ['foo', function (foo) {
            }]
          }
        });

        let route = $routeProvider;

        route.when('/bar', barConfig);
      }]);
