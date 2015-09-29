angular.module('foo', [])
  .provider('unicornLauncher', function UnicornLauncherProvider($provide) {
    var useTinfoilShielding = false;

    this.useTinfoilShielding = function(value) {
      useTinfoilShielding = !!value;
    };

    this.$get = function unicornLauncherFactory(apiToken) {
      return new UnicornLauncher(apiToken, useTinfoilShielding);
    };
  });
