angular.module('foo', [])
  .config(function ($translateProvider) {
    $translateProvider
      .useStaticFilesLoader({ prefix: '/app/translations/', suffix: '.json' })
      .preferredLanguage('pt-BR')
      .useCookieStorage()
      .useSanitizeValueStrategy('sanitize');
  });
