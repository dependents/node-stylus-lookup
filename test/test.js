'use strict';

const path = require('path');
const process = require('process');
const mock = require('mock-fs');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const lookup = require('../index.js');

const testSuite = suite('stylus-lookup');

testSuite.before.each(() => {
  mock({
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

testSuite.after.each(() => mock.restore);

testSuite('throws if dependency is not supplied', () => {
  assert.throws(() => lookup({
    filename: 'example/baz.styl',
    directory: 'example'
  }), Error, 'dependency is not a supplied');
});

testSuite('throws if filename is not supplied', () => {
  assert.throws(() => lookup({
    dependency: 'blueprint',
    directory: 'example'
  }), Error, 'filename is not a supplied');
});

testSuite('throws if directory is not supplied', () => {
  assert.throws(() => lookup({
    dependency: 'blueprint',
    filename: 'example/baz.styl'
  }), Error, 'directory is not a supplied');
});

testSuite('handles index.styl lookup', () => {
  const expected = path.normalize(`${process.cwd()}/example/blueprint/index.styl`);
  const actual = lookup({
    dependency: 'blueprint',
    filename: 'example/styles.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite('handles .css lookups', () => {
  const expected = path.normalize(`${process.cwd()}/example/styles2.css`);
  const actual = lookup({
    dependency: 'styles2.css',
    filename: 'example/styles.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite('handles same directory lookup', () => {
  const expected = path.normalize(`${process.cwd()}/example/another.styl`);
  const actual = lookup({
    dependency: 'another',
    filename: 'example/main.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite('handles subdirectory lookup', () => {
  const expected = path.normalize(`${process.cwd()}/example/nested/foo.styl`);
  const actual = lookup({
    dependency: 'nested/foo',
    filename: 'example/another.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite('handles extensionless lookup', () => {
  const expected = path.normalize(`${process.cwd()}/example/another.styl`);
  const actual = lookup({
    dependency: 'another',
    filename: 'example/main.styl',
    directory: 'example'
  });

  assert.is(actual, expected);
});

testSuite('handles extensioned lookup', () => {
  const expected = path.normalize(`${process.cwd()}/example/styles.styl`);
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
