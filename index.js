import fs from 'node:fs';
import path from 'node:path';
import { debuglog } from 'node:util';

const debug = debuglog('stylus-lookup');

/**
 * Resolves a Stylus dependency path using the compiler's lookup order:
 * 1. Relative to `filename`
 * 2. Relative to the directory containing `filename`
 * 3. As `index.styl` inside a matching subdirectory
 *
 * @param  {string} options.dependency  Import/require name (e.g. `'variables'` or `'partials/reset'`)
 * @param  {string} options.filename    Path to the file containing the import
 * @param  {string} options.directory   Root Stylus directory (reserved; not used in resolution)
 * @return {string} Resolved absolute path, or empty string if not found
 */
export default function lookup({ dependency, filename, directory } = {}) {
  if (dependency === undefined) throw new Error('dependency is not supplied');
  if (filename === undefined) throw new Error('filename is not supplied');
  if (directory === undefined) throw new Error('directory is not supplied');

  const fileDir = path.dirname(filename);

  debug(`trying to resolve: ${dependency}`);
  debug(`filename: ${filename}`);
  debug(`directory: ${directory}`);

  // Use the file's extension if necessary
  const extension = path.extname(dependency) ? '' : path.extname(filename);

  if (!path.isAbsolute(dependency)) {
    const resolved = path.resolve(filename, dependency) + extension;

    debug(`resolved relative dependency: ${resolved}`);

    if (fs.existsSync(resolved)) return resolved;

    debug('resolved file does not exist');
  }

  const sameDir = path.resolve(fileDir, dependency) + extension;
  debug(`resolving dependency about the parent file's directory: ${sameDir}`);

  if (fs.existsSync(sameDir)) return sameDir;

  debug(`resolved file does not exist: ${sameDir}`);

  // Check for dependency/index.styl file
  const indexFile = path.join(path.resolve(fileDir, dependency), 'index.styl');
  debug(`resolving dependency as if it points to an index.styl file: ${indexFile}`);

  if (fs.existsSync(indexFile)) return indexFile;

  debug(`resolved file does not exist: ${indexFile}`);
  debug('could not resolve the dependency');

  return '';
}
