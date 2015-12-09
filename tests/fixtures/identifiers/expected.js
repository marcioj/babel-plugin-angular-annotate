function Ctrl1(service1) {
}

class Ctrl2 {
  constructor(service2) {
  }
  foo(stuff) {
  }
}

var Ctrl3 = function(service3) {
}

angular.module('foo', [])
  .controller('Ctrl1', ['service1', Ctrl1])
  .controller('Ctrl2', ['service2', Ctrl2])
  .controller('Ctrl3', ['service3', Ctrl3]);
