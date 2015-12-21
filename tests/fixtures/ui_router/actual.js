function PostsCtrl($scope, posts) {
  $scope.posts = posts;
}

angular.module('app')
  .config(function($stateProvider) {
    let s = $stateProvider;

    $stateProvider
      .state('users', {
        templateUrl: 'users.html',
        controller: 'UsersCtrl',
        resolve: {
          users: function($http) {
            return $http.get('/users');
          }
        },
        onEnter: function(analytics) {
          analytics.track('Visited Users Page');
        },
        onExit: function(analytics) {
          analytics.track('Left Users Page');
        }
      })
      .state('posts', {
        templateUrl: 'posts.html',
        controller: PostsCtrl,
        resolve: {
          posts: function($http) {
            return $http.get('/posts');
          }
        },
        onEnter: function(analytics) {
          analytics.track('Visited Posts Page');
        },
        onExit: function(analytics) {
          analytics.track('Left Posts Page');
        }
      });

    s.state('home', {
      templateUrl: 'home.html',
      controller: function($scope, recent_posts) {
        $scope.title = 'Welcome to my site';
        $scope.recent_posts = recent_posts;
      },
      resolve: {
        recent_posts: function($http) {
          return $http.get('/posts/recent');
        }
      },
      onEnter: function(analytics) {
        analytics.track('Visited Home Page');
      },
      onExit: function(analytics) {
        analytics.track('Left Home Page');
      }
    });
  });
