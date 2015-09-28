import chai from 'chai';
import path from 'path';
import fs from 'fs';
import plugin from '../lib';

const expect = chai.expect;
const babel = require('babel-core');

describe('babel-plugin-angular-annotate tests', function() {

  function transform(content) {
    return babel.transform(content, {
      blacklist: ['strict'],
      plugins: [plugin]
    }).code;
  }

  function annotatesTheCode(filePath) {
    var actualPath = path.join(__dirname, 'fixtures', filePath, 'actual.js');
    var actualContent = fs.readFileSync(actualPath, 'utf8');
    var expectedPath = path.join(__dirname, 'fixtures', filePath, 'expected.js');
    var expectedContent = fs.readFileSync(expectedPath, 'utf8');
    var transformedContent = transform(actualContent);
    expect(transformedContent.trim()).to.equal(expectedContent.trim());
  }

  it('works', function() {
    annotatesTheCode('controller');
    annotatesTheCode('config');
    annotatesTheCode('service');
  });

});
