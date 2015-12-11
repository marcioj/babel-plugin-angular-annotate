var todo = angular.module('todomvc', ['ngRoute', 'ngResource'])
      .config(function ($routeProvider) {
        var fooConfig = {
          controller: 'FooCtrl',
          templateUrl: 'foo.html',
          resolve: {
            store: function (foo) {
            }
          }
        };

        var barConfig = {
          controller: 'BarCtrl',
          templateUrl: 'bar.html',
          resolve: {
            store: function (bar) {
            }
          }
        };

        $routeProvider.when('/foo', fooConfig);

        let route = $routeProvider;

        route.when('/bar', barConfig);
      });
