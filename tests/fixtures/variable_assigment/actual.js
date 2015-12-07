var ref1 = angular.module('foo', []).service('User', function($http) {});

ref1.service('User', function($http) {});

var ref2 = ref1;

ref2.service('User', function($http) {});

var ref3 = ref2;

ref3.service('User', function($http) {});
