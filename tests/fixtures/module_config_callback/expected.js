angular.module('foo', ['i18n'], ['$translateProvider', function ($translateProvider) {
    $translateProvider
      .useStaticFilesLoader({ prefix: '/app/translations/', suffix: '.json' })
      .preferredLanguage('pt-BR')
      .useCookieStorage()
      .useSanitizeValueStrategy('sanitize');
  }]);
