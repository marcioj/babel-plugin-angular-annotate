import chai from 'chai';
import path from 'path';
import fs from 'fs';
import plugin from '../src';

const expect = chai.expect;
const babel = require('babel-core');

describe('babel-plugin-angular-annotate tests', function() {

  function transform(content, useAnnotate = true) {
    let plugins = useAnnotate ? [plugin] : [];
    return babel.transform(content, {
      blacklist: ['strict'],
      plugins: plugins
    }).code;
  }

  function assertTransformation(filepath) {
    var actualPath = path.join(__dirname, 'fixtures', filepath, 'actual.js');
    var actualContent = fs.readFileSync(actualPath, 'utf8');
    var expectedPath = path.join(__dirname, 'fixtures', filepath, 'expected.js');
    var expectedContent = fs.readFileSync(expectedPath, 'utf8');
    expect(transform(actualContent)).to.equal(transform(expectedContent, false));
  }

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
    assertTransformation('directive');
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
    assertTransformation('invoke');
  });

  it('converts the todo mvc code', function() {
    assertTransformation('todo_mvc');
  });

  it('converts modules with multiple variable assigment', function() {
    assertTransformation('variable_assigment');
  });

  it('converts different identifiers', function() {
    assertTransformation('identifiers');
  });

  it('converts $routeProvider.when', function() {
    assertTransformation('route_provider');
  });

  it('converts $provide', function() {
    assertTransformation('provide');
  });

  it('does not convert value types', function() {
    assertTransformation('value');
  });

  it('converts ui_router $stateProvider', function() {
    assertTransformation('ui_router');
  });
});
