import chai from 'chai';
import path from 'path';
import fs from 'fs';
import plugin from '../src';

const expect = chai.expect;
const babel = require('babel');

describe('babel-plugin-angular-annotate tests', function() {

  function transform(content, configuration = [], useAnnotate = true) {
    let plugins = useAnnotate ? [plugin] : [];
    return babel.transform(content, {
      blacklist: ['strict'],
      plugins: plugins,
      extra: { 'angular-annotate': configuration }
    }).code;
  }

  function assertTransformation(filepath, configuration = []) {
    var actualPath = path.join(__dirname, 'fixtures', filepath, 'actual.js');
    var actualContent = fs.readFileSync(actualPath, 'utf8');
    var expectedPath = path.join(__dirname, 'fixtures', filepath, 'expected.js');
    var expectedContent = fs.readFileSync(expectedPath, 'utf8');
    expect(transform(actualContent, configuration)).to.equal(transform(expectedContent, configuration, false));
  }

  let routeProviderConfig = ["$routeProvider.when", ["_", {
    "controller": "$injectFunction",
    "resolve": "$injectObject"
  }]];

  let injectorInvokeConfig = ["$injector.invoke", ["$injectFunction"]];

  let stateProviderConfig = ["$stateProvider.state", ["_", {
    "resolve": "$injectObject",
    "controller": "$injectFunction",
    "onEnter": "$injectFunction",
    "onExit": "$injectFunction"
  }]];

  let httpProvideInterceptorConfig = ["$httpProvider.interceptors.push", ["$injectFunction"]];

  it('converts module.controller', function() {
    assertTransformation('controller');
  });

  it('converts module.config', function() {
    assertTransformation('config');
  });

  it('converts module.service', function() {
    assertTransformation('service');
  });

  it('converts module.directive', function() {
    assertTransformation('directive', [injectorInvokeConfig]);
  });

  it('converts module.filter', function() {
    assertTransformation('filter');
  });

  it('converts module.provider', function() {
    assertTransformation('provider');
  });

  it('converts module.animation', function() {
    assertTransformation('animation');
  });

  it('converts module config callback', function() {
    assertTransformation('module_config_callback');
  });

  it('converts module.factory', function() {
    assertTransformation('factory');
  });

  it('converts module.run', function() {
    assertTransformation('run');
  });

  it('converts $injector.invoke', function() {
    assertTransformation('invoke', [injectorInvokeConfig]);
  });

  it('converts the todo mvc code', function() {
    assertTransformation('todo_mvc', [routeProviderConfig]);
  });

  it('converts modules with multiple variable assigment', function() {
    assertTransformation('variable_assigment');
  });

  it('converts different identifiers', function() {
    assertTransformation('identifiers');
  });

  it('converts $routeProvider.when', function() {
    assertTransformation('route_provider', [routeProviderConfig]);
  });

  it('converts $provide', function() {
    assertTransformation('provide');
  });

  it('does not convert value types', function() {
    assertTransformation('value');
  });

  it('converts ui_router $stateProvider', function() {
    assertTransformation('ui_router', [stateProviderConfig]);
  });

  it('converts chained calls', function() {
    assertTransformation('chaining');
  });

  it('converts $httpProvider.interceptors.push', function() {
    assertTransformation('http_provider_interceptors', [httpProvideInterceptorConfig]);
  });

  it('converts $httpProvider.interceptors.push using preset', function() {
    assertTransformation('http_provider_interceptors', ['angular']);
  });

  it('throws on non existent preset', function() {
    expect(_ => assertTransformation('http_provider_interceptors', ['whatever'])).to.throws(`Cannot find preset named 'whatever'`);
  });

  it('works with multiple presets', function() {
    let customService = ['customService.injectableFunction', ['$injectFunction']];
    assertTransformation('multiple_presets', ['angular', 'ngMaterial', customService]);
  });

  it('goes through top level IIF', function() {
    assertTransformation('iif', ['angular']);
  });
});
