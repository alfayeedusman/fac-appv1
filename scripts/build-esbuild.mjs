#!/usr/bin/env node
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function build() {
  try {
    console.log('🔨 Building with esbuild (memory-efficient)...');
    
    // Clean dist directory
    const distDir = path.join(rootDir, 'dist/spa');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true });
    }
    fs.mkdirSync(distDir, { recursive: true });

    const startTime = Date.now();

    // Build with esbuild
    const result = await esbuild.build({
      entryPoints: [path.join(rootDir, 'client/main.tsx')],
      bundle: true,
      splitting: false,
      outfile: path.join(distDir, 'index.js'),
      format: 'esm',
      target: 'esnext',
      minify: false,
      sourcemap: false,
      logLevel: 'info',
      loader: {
        '.png': 'dataurl',
        '.jpg': 'dataurl',
        '.jpeg': 'dataurl',
        '.svg': 'dataurl',
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      jsx: 'automatic',
      jsxImportSource: 'react',
      external: [],
      // Memory optimization
      charset: 'utf8',
    });

    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Build completed in ${buildTime}s!`);
    console.log(`📦 Output: ${distDir}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
