/**
 * JavaScript Build Script
 *
 * Modern JavaScript bundling with esbuild via Deno.
 * Bundles ReScript-compiled JavaScript for WordPress plugin.
 *
 * RSR Policy: ReScript primary, Deno for build tooling
 *
 * @module
 */

import { ensureDir, exists } from '@std/fs';
import { join, basename } from '@std/path';
// @ts-ignore: esbuild types
import * as esbuild from 'esbuild';

// ReScript compiles to lib/es6 by default, or src/rescript for in-source
const RESCRIPT_DIR = './src/rescript';
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
 * Build ReScript-generated JavaScript with esbuild
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
 * Find ReScript-generated JS files (.res.js)
 */
async function findReScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.endsWith('.res.js')) {
        files.push(join(dir, entry.name));
      }
    }
  } catch {
    // Directory may not exist yet
  }

  return files;
}

/**
 * Find legacy JS files
 */
async function findJSFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    for await (const entry of Deno.readDir(dir)) {
      if (
        entry.isFile &&
        entry.name.endsWith('.js') &&
        !entry.name.endsWith('.min.js') &&
        !entry.name.endsWith('.res.js')
      ) {
        files.push(join(dir, entry.name));
      }
    }
  } catch {
    // Directory may not exist yet
  }

  return files;
}

/**
 * Compile ReScript sources (requires rescript compiler)
 */
async function compileReScript(): Promise<boolean> {
  console.log('📦 Compiling ReScript sources...');

  try {
    // Check if rescript.json exists
    if (!(await exists('./rescript.json'))) {
      console.log('  ⚠️  No rescript.json found, skipping ReScript compilation');
      return false;
    }

    // Try to compile ReScript
    const command = new Deno.Command('npx', {
      args: ['rescript', 'build'],
      stderr: 'piped',
      stdout: 'piped',
    });

    const { success, stdout, stderr } = await command.output();

    if (!success) {
      const errText = new TextDecoder().decode(stderr);
      console.log(`  ⚠️  ReScript compilation failed: ${errText}`);
      console.log('  ℹ️  Using pre-compiled ReScript output if available');
    } else {
      const outText = new TextDecoder().decode(stdout);
      if (outText) console.log(outText);
      console.log('  ✓ ReScript compiled successfully');
    }

    return true;
  } catch {
    console.log('  ⚠️  ReScript compiler not available, using pre-compiled output');
    return false;
  }
}

/**
 * Main JS build function
 */
async function main(): Promise<void> {
  console.log('⚡ Building JavaScript assets...\n');

  await ensureDir(DIST_DIR);

  // Compile ReScript first
  await compileReScript();

  // Bundle ReScript-generated JS files
  const rescriptFiles = await findReScriptFiles(RESCRIPT_DIR);
  if (rescriptFiles.length > 0) {
    console.log(`\nFound ${rescriptFiles.length} ReScript files in ${RESCRIPT_DIR}:`);
    for (const file of rescriptFiles) {
      const outputFile = join(
        DIST_DIR,
        basename(file).replace('.res.js', '.min.js')
      );
      await buildFile(file, outputFile);
    }
  } else {
    console.log(`\n⚠️  No ReScript output found in ${RESCRIPT_DIR}`);
    console.log('   Run "npx rescript build" to compile ReScript sources');
  }

  // Minify legacy JavaScript files
  const legacyFiles = await findJSFiles(LEGACY_JS_DIR);
  if (legacyFiles.length > 0) {
    console.log(`\nFound ${legacyFiles.length} legacy files in ${LEGACY_JS_DIR}:`);
    for (const file of legacyFiles) {
      const filename = basename(file);
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

export { main, buildFile, minifyFile, findReScriptFiles, findJSFiles };
