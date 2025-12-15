/**
 * JavaScript Build Script
 *
 * Modern JavaScript bundling with esbuild via Deno.
 * Produces optimized bundles for WordPress plugin.
 *
 * @module
 */

import { ensureDir } from '@std/fs';
import { join, basename } from '@std/path';
// @ts-ignore: esbuild types
import * as esbuild from 'esbuild';

const SRC_DIR = './src/js';
const DIST_DIR = './dist/js';
const LEGACY_JS_DIR = './js';

/**
 * JS build configuration
 */
interface JSConfig {
  readonly minify: boolean;
  readonly sourceMaps: boolean;
  readonly target: string[];
}

const config: JSConfig = {
  minify: Deno.env.get('NODE_ENV') === 'production',
  sourceMaps: Deno.env.get('NODE_ENV') !== 'production',
  target: ['es2020', 'chrome90', 'firefox90', 'safari14'],
};

/**
 * Build a single JavaScript/TypeScript file with esbuild
 */
async function buildFile(inputPath: string, outputPath: string): Promise<void> {
  const filename = basename(inputPath);
  console.log(`  Bundling: ${filename}`);

  const result = await esbuild.build({
    entryPoints: [inputPath],
    outfile: outputPath,
    bundle: true,
    minify: config.minify,
    sourcemap: config.sourceMaps,
    target: config.target,
    format: 'iife',
    globalName: 'Zotpress',
    platform: 'browser',
    external: ['jquery', 'wp'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        Deno.env.get('NODE_ENV') || 'development'
      ),
    },
    metafile: true,
  });

  if (result.metafile) {
    const outputs = Object.values(result.metafile.outputs)[0];
    if (outputs) {
      console.log(`    → ${outputs.bytes} bytes`);
    }
  }
}

/**
 * Minify a legacy JavaScript file
 */
async function minifyFile(inputPath: string, outputPath: string): Promise<void> {
  const filename = basename(inputPath);
  console.log(`  Minifying: ${filename}`);

  const code = await Deno.readTextFile(inputPath);

  const result = await esbuild.transform(code, {
    minify: true,
    sourcemap: config.sourceMaps,
    target: config.target,
    format: 'iife',
  });

  await Deno.writeTextFile(outputPath, result.code);

  if (result.map && config.sourceMaps) {
    await Deno.writeTextFile(`${outputPath}.map`, result.map);
  }

  const inputSize = new TextEncoder().encode(code).length;
  const outputSize = new TextEncoder().encode(result.code).length;
  const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

  console.log(`    ${inputSize} → ${outputSize} bytes (${reduction}% reduction)`);
}

/**
 * Find all JS/TS files in a directory
 */
async function findJSFiles(dir: string, extensions = ['.ts', '.js']): Promise<string[]> {
  const files: string[] = [];

  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile) {
        const isTarget = extensions.some(
          (ext) => entry.name.endsWith(ext) && !entry.name.endsWith('.min.js')
        );
        if (isTarget) {
          files.push(join(dir, entry.name));
        }
      }
    }
  } catch {
    // Directory may not exist yet
  }

  return files;
}

/**
 * Main JS build function
 */
async function main(): Promise<void> {
  console.log('⚡ Building JavaScript assets...\n');

  await ensureDir(DIST_DIR);

  // Build modern TypeScript from src/js
  const srcFiles = await findJSFiles(SRC_DIR, ['.ts', '.tsx']);
  if (srcFiles.length > 0) {
    console.log(`Found ${srcFiles.length} files in ${SRC_DIR}:`);
    for (const file of srcFiles) {
      const outputFile = join(
        DIST_DIR,
        basename(file).replace(/\.(ts|tsx)$/, '.min.js')
      );
      await buildFile(file, outputFile);
    }
  }

  // Minify legacy JavaScript files
  const legacyFiles = await findJSFiles(LEGACY_JS_DIR, ['.js']);
  if (legacyFiles.length > 0) {
    console.log(`\nFound ${legacyFiles.length} legacy files in ${LEGACY_JS_DIR}:`);
    for (const file of legacyFiles) {
      const filename = basename(file);
      // Skip already minified files
      if (filename.includes('.min.')) continue;

      const outputFile = join(DIST_DIR, filename.replace('.js', '.min.js'));
      await minifyFile(file, outputFile);
    }
  }

  // Stop esbuild service
  await esbuild.stop();

  console.log('\n✓ JavaScript build complete');
}

// Run if executed directly
if (import.meta.main) {
  main();
}

export { main, buildFile, minifyFile, findJSFiles };
