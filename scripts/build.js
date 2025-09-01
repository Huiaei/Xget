#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure dist directory exists
const distPath = join(__dirname, '../dist');
if (!existsSync(distPath)) {
  mkdirSync(distPath, { recursive: true });
}

// Create version.json with current timestamp
const versionData = {
  version: '1.0.0',
  platform: 'cloudflare-pages',
  build: new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, ''),
  architecture: 'functions',
  timestamp: new Date().toISOString()
};

writeFileSync(join(distPath, 'version.json'), JSON.stringify(versionData, null, 2));

console.log('✅ Build artifacts generated successfully!');
console.log(`📦 Build ID: ${versionData.build}`);
console.log(`🕒 Timestamp: ${versionData.timestamp}`);
