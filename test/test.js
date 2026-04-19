'use strict';

const path = require('node:path');
const { suite } = require('uvu');
const assert = require('uvu/assert');
const lookup = require('../index.js');

const fixtures = (...parts) => path.join(__dirname, 'fixtures', ...parts);

const testSuite = suite('stylus-lookup');

testSuite('throws if dependency is not supplied', () => {
  assert.throws(() => lookup({
    filename: 'test/fixtures/baz.styl',
    directory: 'test/fixtures'
  }), err => err instanceof Error && err.message === 'dependency is not supplied');
});

testSuite('throws if filename is not supplied', () => {
  assert.throws(() => lookup({
    dependency: 'blueprint',
    directory: 'test/fixtures'
  }), err => err instanceof Error && err.message === 'filename is not supplied');
});

testSuite('throws if directory is not supplied', () => {
  assert.throws(() => lookup({
    dependency: 'blueprint',
    filename: 'test/fixtures/baz.styl'
  }), err => err instanceof Error && err.message === 'directory is not supplied');
});

testSuite('handles index.styl lookup', () => {
  const expected = fixtures('blueprint', 'index.styl');
  const actual = lookup({
    dependency: 'blueprint',
    filename: fixtures('styles.styl'),
    directory: fixtures()
  });

  assert.is(actual, expected);
});

testSuite('handles .css lookups', () => {
  const expected = fixtures('styles2.css');
  const actual = lookup({
    dependency: 'styles2.css',
    filename: fixtures('styles.styl'),
    directory: fixtures()
  });

  assert.is(actual, expected);
});

testSuite('handles same directory lookup', () => {
  const expected = fixtures('another.styl');
  const actual = lookup({
    dependency: 'another',
    filename: fixtures('main.styl'),
    directory: fixtures()
  });

  assert.is(actual, expected);
});

testSuite('handles subdirectory lookup', () => {
  const expected = fixtures('nested', 'foo.styl');
  const actual = lookup({
    dependency: 'nested/foo',
    filename: fixtures('another.styl'),
    directory: fixtures()
  });

  assert.is(actual, expected);
});

testSuite('handles extensionless lookup', () => {
  const expected = fixtures('another.styl');
  const actual = lookup({
    dependency: 'another',
    filename: fixtures('main.styl'),
    directory: fixtures()
  });

  assert.is(actual, expected);
});

testSuite('handles extensioned lookup', () => {
  const expected = fixtures('styles.styl');
  const actual = lookup({
    dependency: 'styles.styl',
    filename: fixtures('main.styl'),
    directory: fixtures()
  });

  assert.is(actual, expected);
});

testSuite('resolves dependency when path.resolve(filename, dependency) exists', () => {
  const expected = fixtures('blueprint', 'index.styl');
  const actual = lookup({
    dependency: 'index.styl',
    filename: fixtures('blueprint'),
    directory: fixtures()
  });

  assert.is(actual, expected);
});

testSuite('returns empty string for unresolvable dependency', () => {
  const actual = lookup({
    dependency: 'nonexistent',
    filename: fixtures('main.styl'),
    directory: fixtures()
  });

  assert.is(actual, '');
});

testSuite.skip('supports globbing imports');
testSuite.skip('supports additional path lookups');

testSuite.run();
