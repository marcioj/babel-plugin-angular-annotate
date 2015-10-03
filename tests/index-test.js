import chai from 'chai';
import path from 'path';
import fs from 'fs';
import plugin from '../lib';

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
});
