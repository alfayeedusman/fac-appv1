#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { glob } from 'glob';

const isProduction = process.env.NODE_ENV === 'production';

async function build() {
  try {
    console.log('🔨 Building with esbuild...');
    
    const result = await esbuild.build({
      entryPoints: ['client/main.tsx'],
      bundle: true,
      minify: true,
      target: 'esnext',
      format: 'esm',
      outfile: 'dist/spa/assets/app.js',
      splitting: true,
      chunkNames: 'chunks/[name]-[hash]',
      assetNames: 'assets/[name]-[hash]',
      outbase: './',
      
      // Memory optimizations
      logLevel: 'info',
      
      external: [
        // Keep these as-is to reduce bundling
      ],
      
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.tsx': 'tsx',
        '.css': 'css',
      },
      
      define: {
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      },
      
      // CSS handling
      cssLoader: {
        cssModules: true,
      },
      
      jsx: 'automatic',
      jsxImportSource: 'react',
      
      // Reduce memory usage
      drop: isProduction ? ['console', 'debugger'] : [],
      dropLabels: ['DEV'],
    });

    console.log('✅ Build completed successfully!');
    console.log(`📦 Output: dist/spa/assets/app.js`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
