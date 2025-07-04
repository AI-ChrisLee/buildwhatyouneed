const fs = require('fs');
const path = require('path');

console.log('🚀 Build What You Need - Performance Analysis\n');

// Check for large files in the codebase
function checkFileSizes(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      checkFileSizes(filePath, results);
    } else if (stat.isFile()) {
      const sizeInKB = stat.size / 1024;
      if (sizeInKB > 100) { // Files larger than 100KB
        results.push({
          path: filePath.replace(process.cwd(), ''),
          size: sizeInKB.toFixed(2) + ' KB'
        });
      }
    }
  });
  
  return results;
}

// Check image files
function checkImages(dir, results = []) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      checkImages(filePath, results);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const sizeInKB = stat.size / 1024;
        results.push({
          path: filePath.replace(process.cwd(), ''),
          size: sizeInKB.toFixed(2) + ' KB',
          type: ext
        });
      }
    }
  });
  
  return results;
}

// Analyze Next.js app structure
function analyzeNextApp() {
  const pagesDir = path.join(process.cwd(), 'src/app');
  const componentsDir = path.join(process.cwd(), 'src/components');
  
  let pageCount = 0;
  let componentCount = 0;
  
  // Count pages
  function countPages(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        countPages(filePath);
      } else if (file === 'page.tsx' || file === 'page.ts') {
        pageCount++;
      }
    });
  }
  
  // Count components
  if (fs.existsSync(componentsDir)) {
    const components = fs.readdirSync(componentsDir);
    componentCount = components.filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).length;
  }
  
  countPages(pagesDir);
  
  return { pageCount, componentCount };
}

console.log('📊 File Size Analysis\n');
const largeFiles = checkFileSizes(process.cwd());
if (largeFiles.length > 0) {
  console.log('Large files found (>100KB):');
  largeFiles.sort((a, b) => parseFloat(b.size) - parseFloat(a.size)).slice(0, 10).forEach(file => {
    console.log(`  ${file.path} - ${file.size}`);
  });
} else {
  console.log('✅ No large files found!');
}

console.log('\n🖼️  Image Analysis\n');
const images = checkImages(process.cwd());
if (images.length > 0) {
  console.log(`Found ${images.length} images:`);
  const largeImages = images.filter(img => parseFloat(img.size) > 100);
  if (largeImages.length > 0) {
    console.log('\n⚠️  Large images that need optimization:');
    largeImages.forEach(img => {
      console.log(`  ${img.path} - ${img.size} (${img.type})`);
    });
  }
  
  // Summary by type
  const summary = {};
  images.forEach(img => {
    summary[img.type] = (summary[img.type] || 0) + 1;
  });
  console.log('\nImage types:');
  Object.entries(summary).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} files`);
  });
} else {
  console.log('✅ No images found in the project');
}

console.log('\n🏗️  Next.js App Structure\n');
const { pageCount, componentCount } = analyzeNextApp();
console.log(`Pages: ${pageCount}`);
console.log(`Components: ${componentCount}`);

console.log('\n📦 Package Analysis\n');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = Object.keys(packageJson.dependencies || {}).length;
const devDeps = Object.keys(packageJson.devDependencies || {}).length;
console.log(`Production dependencies: ${deps}`);
console.log(`Dev dependencies: ${devDeps}`);

// Check for common performance issues
console.log('\n⚡ Performance Recommendations\n');

// Check if using Next.js Image component
const hasNextImage = largeFiles.some(f => f.path.includes('next/image'));
if (images.length > 0 && !hasNextImage) {
  console.log('⚠️  Consider using next/image for automatic image optimization');
}

// Check for dynamic imports
const hasDynamicImports = largeFiles.some(f => {
  try {
    const content = fs.readFileSync(f.path.substring(1), 'utf8');
    return content.includes('dynamic(') || content.includes('import(');
  } catch {
    return false;
  }
});

if (!hasDynamicImports && componentCount > 20) {
  console.log('⚠️  Consider using dynamic imports for code splitting');
}

// Check bundle size
console.log('\n📊 Estimated Initial Load Impact:');
console.log('- Base Next.js: ~70KB');
console.log('- Your code: ~' + (pageCount * 10 + componentCount * 5) + 'KB (estimate)');
console.log('- Total: ~' + (70 + pageCount * 10 + componentCount * 5) + 'KB\n');

if (pageCount * 10 + componentCount * 5 > 200) {
  console.log('⚠️  Consider code splitting to reduce initial bundle size');
}

console.log('✅ Performance analysis complete!\n');