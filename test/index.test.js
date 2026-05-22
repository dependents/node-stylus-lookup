import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import lookup from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtures = (...parts) => path.join(__dirname, 'fixtures', ...parts);

describe('stylus-lookup', () => {
  it('throws if dependency is not supplied', () => {
    expect(() => lookup({
      filename: 'test/fixtures/baz.styl',
      directory: 'test/fixtures'
    })).toThrow(new Error('dependency is not supplied'));
  });

  it('throws if filename is not supplied', () => {
    expect(() => lookup({
      dependency: 'blueprint',
      directory: 'test/fixtures'
    })).toThrow(new Error('filename is not supplied'));
  });

  it('throws if directory is not supplied', () => {
    expect(() => lookup({
      dependency: 'blueprint',
      filename: 'test/fixtures/baz.styl'
    })).toThrow(new Error('directory is not supplied'));
  });

  it('handles index.styl lookup', () => {
    const expected = fixtures('blueprint', 'index.styl');
    const actual = lookup({
      dependency: 'blueprint',
      filename: fixtures('styles.styl'),
      directory: fixtures()
    });

    expect(actual).toBe(expected);
  });

  it('handles .css lookups', () => {
    const expected = fixtures('styles2.css');
    const actual = lookup({
      dependency: 'styles2.css',
      filename: fixtures('styles.styl'),
      directory: fixtures()
    });

    expect(actual).toBe(expected);
  });

  it('handles same directory lookup', () => {
    const expected = fixtures('another.styl');
    const actual = lookup({
      dependency: 'another',
      filename: fixtures('main.styl'),
      directory: fixtures()
    });

    expect(actual).toBe(expected);
  });

  it('handles subdirectory lookup', () => {
    const expected = fixtures('nested', 'foo.styl');
    const actual = lookup({
      dependency: 'nested/foo',
      filename: fixtures('another.styl'),
      directory: fixtures()
    });

    expect(actual).toBe(expected);
  });

  it('handles extensionless lookup', () => {
    const expected = fixtures('another.styl');
    const actual = lookup({
      dependency: 'another',
      filename: fixtures('main.styl'),
      directory: fixtures()
    });

    expect(actual).toBe(expected);
  });

  it('handles extensioned lookup', () => {
    const expected = fixtures('styles.styl');
    const actual = lookup({
      dependency: 'styles.styl',
      filename: fixtures('main.styl'),
      directory: fixtures()
    });

    expect(actual).toBe(expected);
  });

  it('resolves dependency when path.resolve(filename, dependency) exists', () => {
    const expected = fixtures('blueprint', 'index.styl');
    const actual = lookup({
      dependency: 'index.styl',
      filename: fixtures('blueprint'),
      directory: fixtures()
    });

    expect(actual).toBe(expected);
  });

  it('returns empty string for unresolvable dependency', () => {
    const actual = lookup({
      dependency: 'nonexistent',
      filename: fixtures('main.styl'),
      directory: fixtures()
    });

    expect(actual).toBe('');
  });
});
