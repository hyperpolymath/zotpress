/**
 * Zotpress Build Script
 *
 * Main entry point for building CSS and JS assets.
 * Uses Deno for modern, secure builds without npm/node_modules.
 *
 * @module
 */

import { ensureDir } from '@std/fs';
import { join } from '@std/path';

const DIST_DIR = './dist';
const SRC_DIR = './src';

/**
 * Build configuration
 */
interface BuildConfig {
  readonly distDir: string;
  readonly srcDir: string;
  readonly minify: boolean;
  readonly sourceMaps: boolean;
}

const config: BuildConfig = {
  distDir: DIST_DIR,
  srcDir: SRC_DIR,
  minify: Deno.env.get('NODE_ENV') === 'production',
  sourceMaps: Deno.env.get('NODE_ENV') !== 'production',
};

/**
 * Ensure output directories exist
 */
async function setupDirs(): Promise<void> {
  await ensureDir(join(config.distDir, 'css'));
  await ensureDir(join(config.distDir, 'js'));
}

/**
 * Build CSS assets
 */
async function buildCSS(): Promise<void> {
  const cssProcess = new Deno.Command('deno', {
    args: ['task', 'build:css'],
    stdout: 'inherit',
    stderr: 'inherit',
  });
  const { code } = await cssProcess.output();
  if (code !== 0) {
    throw new Error(`CSS build failed with code ${code}`);
  }
}

/**
 * Build JavaScript assets
 */
async function buildJS(): Promise<void> {
  const jsProcess = new Deno.Command('deno', {
    args: ['task', 'build:js'],
    stdout: 'inherit',
    stderr: 'inherit',
  });
  const { code } = await jsProcess.output();
  if (code !== 0) {
    throw new Error(`JS build failed with code ${code}`);
  }
}

/**
 * Main build function
 */
async function main(): Promise<void> {
  const startTime = performance.now();

  console.log('🔨 Starting Zotpress build...\n');

  try {
    // Setup directories
    console.log('📁 Setting up directories...');
    await setupDirs();

    // Build assets in parallel
    console.log('🎨 Building CSS...');
    console.log('⚡ Building JavaScript...');
    await Promise.all([buildCSS(), buildJS()]);

    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✓ Build complete in ${duration}s`);
  } catch (error) {
    console.error('\n❌ Build failed:', error);
    Deno.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}

export { buildCSS, buildJS, main, setupDirs };
export type { BuildConfig };
