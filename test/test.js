'use strict';

const path = require('path');
const process = require('process');
const { vol } = require('memfs');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const lookup = require('../index.js');

const testSuite = suite('stylus-lookup');

testSuite.before(() => {
  vol.mkdirSync(process.cwd(), { recursive: true });
  vol.fromNestedJSON({
    example: {
      'main.styl': '@import "blueprint"; @require "another"; @require "styles.styl"',
      'another.styl': '@import "nested/foo"',
      'styles.styl': '@import "styles2.css"',
      'styles2.css': '',
      blueprint: {
        'index.styl': ''
      },
      nested: {
        'foo.styl': ''
      }
    }
  });
});

testSuite.after(() => {
  console.log(vol.toTree());
  vol.reset();
});

testSuite('throws if dependency is not supplied', () => {
  assert.throws(() => lookup({
    filename: 'example/baz.styl',
    directory: 'example'
  }), err => err instanceof Error && err.message === 'dependency is not supplied');
});

testSuite('throws if filename is not supplied', () => {
  assert.throws(() => lookup({
    dependency: 'blueprint',
    directory: 'example'
  }), err => err instanceof Error && err.message === 'filename is not supplied');
});

testSuite('throws if directory is not supplied', () => {
  assert.throws(() => lookup({
    dependency: 'blueprint',
    filename: 'example/baz.styl'
  }), err => err instanceof Error && err.message === 'directory is not supplied');
});

testSuite('handles index.styl lookup', () => {
  const expected = path.join(process.cwd(), '/example/blueprint/index.styl');
  const actual = lookup({
    dependency: 'blueprint',
    filename: 'example/styles.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite.skip('handles .css lookups', () => {
  const expected = path.join(process.cwd(), '/example/styles2.css');
  const actual = lookup({
    dependency: 'styles2.css',
    filename: 'example/styles.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite.skip('handles same directory lookup', () => {
  const expected = path.join(process.cwd(), '/example/another.styl');
  const actual = lookup({
    dependency: 'another',
    filename: 'example/main.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite.skip('handles subdirectory lookup', () => {
  const expected = path.join(process.cwd(), '/example/nested/foo.styl');
  const actual = lookup({
    dependency: 'nested/foo',
    filename: 'example/another.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite.skip('handles extensionless lookup', () => {
  const expected = path.join(process.cwd(), '/example/another.styl');
  const actual = lookup({
    dependency: 'another',
    filename: 'example/main.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite.skip('handles extensioned lookup', () => {
  const expected = path.join(process.cwd(), '/example/styles.styl');
  const actual = lookup({
    dependency: 'styles.styl',
    filename: 'example/main.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite.skip('supports globbing imports');
testSuite.skip('supports additional path lookups');

testSuite.run();
