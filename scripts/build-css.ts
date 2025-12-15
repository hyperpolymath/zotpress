/**
 * CSS Build Script
 *
 * Modern CSS processing with LightningCSS via Deno.
 * Replaces PostCSS/Autoprefixer with faster native tooling.
 *
 * @module
 */

import { ensureDir } from '@std/fs';
import { join, basename } from '@std/path';
// @ts-ignore: lightningcss types
import { transform, browserslistToTargets } from 'lightningcss';

const SRC_DIR = './src/css';
const DIST_DIR = './dist/css';
const LEGACY_CSS_DIR = './css';

/**
 * CSS build configuration
 */
interface CSSConfig {
  readonly minify: boolean;
  readonly sourceMaps: boolean;
  readonly targets: ReturnType<typeof browserslistToTargets>;
}

const config: CSSConfig = {
  minify: Deno.env.get('NODE_ENV') === 'production',
  sourceMaps: Deno.env.get('NODE_ENV') !== 'production',
  targets: browserslistToTargets([
    '>= 0.5%',
    'last 2 versions',
    'Firefox ESR',
    'not dead',
  ]),
};

/**
 * Process a single CSS file with LightningCSS
 */
async function processCSS(inputPath: string, outputPath: string): Promise<void> {
  const filename = basename(inputPath);
  console.log(`  Processing: ${filename}`);

  const code = await Deno.readFile(inputPath);

  const result = transform({
    filename: inputPath,
    code,
    minify: config.minify,
    sourceMap: config.sourceMaps,
    targets: config.targets,
    drafts: {
      customMedia: true,
    },
    nonStandard: {
      deepSelectorCombinator: true,
    },
    errorRecovery: true,
  });

  await Deno.writeFile(outputPath, result.code);

  if (result.map && config.sourceMaps) {
    await Deno.writeFile(
      `${outputPath}.map`,
      new TextEncoder().encode(JSON.stringify(result.map))
    );
  }

  const inputSize = code.length;
  const outputSize = result.code.length;
  const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

  console.log(`    ${inputSize} → ${outputSize} bytes (${reduction}% reduction)`);
}

/**
 * Find all CSS files in a directory
 */
async function findCSSFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.endsWith('.css') && !entry.name.endsWith('.min.css')) {
        files.push(join(dir, entry.name));
      }
    }
  } catch {
    // Directory may not exist yet
  }

  return files;
}

/**
 * Main CSS build function
 */
async function main(): Promise<void> {
  console.log('🎨 Building CSS assets...\n');

  await ensureDir(DIST_DIR);

  // Process modern CSS from src/css
  const srcFiles = await findCSSFiles(SRC_DIR);
  if (srcFiles.length > 0) {
    console.log(`Found ${srcFiles.length} files in ${SRC_DIR}:`);
    for (const file of srcFiles) {
      const outputFile = join(DIST_DIR, basename(file).replace('.css', '.min.css'));
      await processCSS(file, outputFile);
    }
  }

  // Also process legacy CSS files (minify existing)
  const legacyFiles = await findCSSFiles(LEGACY_CSS_DIR);
  if (legacyFiles.length > 0) {
    console.log(`\nFound ${legacyFiles.length} legacy files in ${LEGACY_CSS_DIR}:`);
    for (const file of legacyFiles) {
      const filename = basename(file);
      // Skip already minified files
      if (filename.includes('.min.')) continue;

      const outputFile = join(DIST_DIR, filename.replace('.css', '.min.css'));
      await processCSS(file, outputFile);
    }
  }

  console.log('\n✓ CSS build complete');
}

// Run if executed directly
if (import.meta.main) {
  main();
}

export { main, processCSS, findCSSFiles };
