const fs = require('fs');
const path = require('path');

// ✅ OPTIMIZED: Bundle analysis script
function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size...\n');
  
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run "pnpm build" first.');
    return;
  }

  // Analyze static files
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    analyzeDirectory(staticDir, 'Static Assets');
  }

  console.log('\n📊 Bundle Analysis Complete!');
  console.log('💡 To get detailed analysis, run: ANALYZE=true pnpm build');
}

function analyzeDirectory(dir, label) {
  console.log(`\n📁 ${label}:`);
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const sizes = [];
  
  files.forEach(file => {
    if (file.isFile()) {
      const filePath = path.join(dir, file.name);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      if (sizeKB > 10) { // Only show files > 10KB
        sizes.push({ name: file.name, size: sizeKB });
      }
    } else if (file.isDirectory()) {
      analyzeDirectory(path.join(dir, file.name), file.name);
    }
  });
  
  // Sort by size (largest first)
  sizes.sort((a, b) => b.size - a.size);
  
  sizes.forEach(file => {
    const emoji = file.size > 100 ? '🔴' : file.size > 50 ? '🟡' : '🟢';
    console.log(`  ${emoji} ${file.name}: ${file.size}KB`);
  });
}

if (require.main === module) {
  analyzeBundleSize();
}

module.exports = { analyzeBundleSize };
