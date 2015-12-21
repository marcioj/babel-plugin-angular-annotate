var todo = angular.module('todomvc', ['ngRoute', 'ngResource'])
      .config(function ($routeProvider) {
        var barConfig = {
          controller: 'BarCtrl',
          templateUrl: 'bar.html',
          resolve: {
            store: function (bar) {
            }
          }
        };

        $routeProvider.when('/foo', {
          controller: function($scope) {
            $scope.message = 'foo';
          },
          templateUrl: 'foo.html',
          resolve: {
            store: function (foo) {
            }
          }
        });

        let route = $routeProvider;

        route.when('/bar', barConfig);
      });
