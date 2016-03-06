angular.module('app', [])
  .component('greeter', {
    bindings: {
      message: '='
    },
    controller: ['GreeterService', function (GreeterService) {
      this.message = GreeterService.getMessage();
    }],
    template: '<h1>{{$ctrl.message}}</h1>'
  });
