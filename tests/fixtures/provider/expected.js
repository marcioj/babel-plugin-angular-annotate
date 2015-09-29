angular.module('foo', [])
  .provider('unicornLauncher', ['$provide', function UnicornLauncherProvider($provide) {
    var useTinfoilShielding = false;

    this.useTinfoilShielding = function(value) {
      useTinfoilShielding = !!value;
    };

    this.$get = ['apiToken', function unicornLauncherFactory(apiToken) {
      return new UnicornLauncher(apiToken, useTinfoilShielding);
    }];
  }]);
