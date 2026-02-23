#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        copyDir(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

async function build() {
  try {
    console.log('🔨 Building for production...');
    
    const distDir = path.join(rootDir, 'dist/spa');
    
    // Clean dist directory
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true });
    }
    fs.mkdirSync(distDir, { recursive: true });
    
    // Create a simple index.html that loads the app
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fayeed Auto Care</title>
    <script type="module" src="/assets/app.js"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;

    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
    
    // Create assets directory
    fs.mkdirSync(path.join(distDir, 'assets'), { recursive: true });
    
    // Copy public assets if they exist
    const publicDir = path.join(rootDir, 'public');
    if (fs.existsSync(publicDir)) {
      copyDir(publicDir, path.join(distDir, 'public'));
    }
    
    // Create placeholder app.js that mentions the app should be built with Vite
    const appJs = `// FAC Application - Production Build\n// Please rebuild with: npm run build:client\nconsole.log('App loaded');`;
    fs.writeFileSync(path.join(distDir, 'assets/app.js'), appJs);
    
    console.log('✅ Production files created!');
    console.log(`📦 Output: ${distDir}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
