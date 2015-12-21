function PostsCtrl($scope, posts) {
  $scope.posts = posts;
}

angular.module('app')
  .config(['$stateProvider', function($stateProvider) {
    let s = $stateProvider;

    $stateProvider
      .state('users', {
        templateUrl: 'users.html',
        controller: 'UsersCtrl',
        resolve: {
          users: ['$http', function($http) {
            return $http.get('/users');
          }]
        },
        onEnter: ['analytics', function(analytics) {
          analytics.track('Visited Users Page');
        }],
        onExit: ['analytics', function(analytics) {
          analytics.track('Left Users Page');
        }]
      })
      .state('posts', {
        templateUrl: 'posts.html',
        controller: ['$scope', 'posts', PostsCtrl],
        resolve: {
          posts: ['$http', function($http) {
            return $http.get('/posts');
          }]
        },
        onEnter: ['analytics', function(analytics) {
          analytics.track('Visited Posts Page');
        }],
        onExit: ['analytics', function(analytics) {
          analytics.track('Left Posts Page');
        }]
      });

    s.state('home', {
      templateUrl: 'home.html',
      controller: ['$scope', 'recent_posts', function($scope, recent_posts) {
        $scope.title = 'Welcome to my site';
        $scope.recent_posts = recent_posts;
      }],
      resolve: {
        recent_posts: ['$http', function($http) {
          return $http.get('/posts/recent');
        }]
      },
      onEnter: ['analytics', function(analytics) {
        analytics.track('Visited Home Page');
      }],
      onExit: ['analytics', function(analytics) {
        analytics.track('Left Home Page');
      }]
    });
  }]);
