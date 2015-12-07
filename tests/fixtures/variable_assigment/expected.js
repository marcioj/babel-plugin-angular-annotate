var ref1 = angular.module('foo', []).service('User', ['$http', function($http) {}]);

ref1.service('User', ['$http', function($http) {}]);

var ref2 = ref1;

ref2.service('User', ['$http', function($http) {}]);

var ref3 = ref2;

ref3.service('User', ['$http', function($http) {}]);
