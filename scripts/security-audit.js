const fs = require('fs');
const path = require('path');

console.log('🔒 Build What You Need - Security Audit\n');

const securityIssues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

// Check for common security patterns in code
function checkFileSecurity(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Check for SQL injection vulnerabilities
    if (content.includes('`${') && content.includes('SELECT') && !content.includes('parameterized')) {
      securityIssues.high.push({
        file: filePath,
        issue: 'Potential SQL injection - use parameterized queries',
        line: content.split('\n').findIndex(line => line.includes('`${') && line.includes('SELECT')) + 1
      });
    }
    
    // Check for dangerouslySetInnerHTML
    if (content.includes('dangerouslySetInnerHTML')) {
      securityIssues.high.push({
        file: filePath,
        issue: 'Using dangerouslySetInnerHTML - ensure content is sanitized',
        line: content.split('\n').findIndex(line => line.includes('dangerouslySetInnerHTML')) + 1
      });
    }
    
    // Check for eval() usage
    if (content.includes('eval(')) {
      securityIssues.critical.push({
        file: filePath,
        issue: 'eval() usage detected - extremely dangerous',
        line: content.split('\n').findIndex(line => line.includes('eval(')) + 1
      });
    }
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*["'][^"']{20,}/i,
      /secret\s*[:=]\s*["'][^"']{10,}/i,
      /password\s*[:=]\s*["'][^"']+/i,
      /token\s*[:=]\s*["'][^"']{20,}/i
    ];
    
    secretPatterns.forEach(pattern => {
      const match = content.match(pattern);
      if (match && !filePath.includes('.env') && !filePath.includes('example')) {
        securityIssues.critical.push({
          file: filePath,
          issue: 'Hardcoded secret detected',
          match: match[0].substring(0, 30) + '...'
        });
      }
    });
    
    // Check for missing input validation
    if (content.includes('req.body') || content.includes('request.body')) {
      if (!content.includes('validate') && !content.includes('schema') && !content.includes('sanitize')) {
        securityIssues.medium.push({
          file: filePath,
          issue: 'Request body used without apparent validation'
        });
      }
    }
    
    // Check for CORS issues
    if (content.includes('Access-Control-Allow-Origin: *')) {
      securityIssues.medium.push({
        file: filePath,
        issue: 'CORS allows all origins - consider restricting'
      });
    }
    
    // Check for rate limiting
    if (fileName.includes('route') && !content.includes('rate') && !content.includes('limit')) {
      securityIssues.low.push({
        file: filePath,
        issue: 'API route without rate limiting'
      });
    }
    
  } catch (error) {
    // File read error, skip
  }
}

// Scan project files
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
      scanDirectory(filePath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
      checkFileSecurity(filePath);
    }
  });
}

// Check environment configuration
function checkEnvironmentSecurity() {
  console.log('🔍 Environment Security Check\n');
  
  // Check if .env.local exists
  if (fs.existsSync('.env.local')) {
    console.log('✅ .env.local exists');
    
    // Check if it's in .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      if (gitignore.includes('.env.local')) {
        console.log('✅ .env.local is in .gitignore');
      } else {
        securityIssues.critical.push({
          file: '.gitignore',
          issue: '.env.local not in .gitignore - secrets may be exposed'
        });
      }
    }
  }
  
  // Check for .env in repo
  if (fs.existsSync('.env') && !fs.existsSync('.env.example')) {
    securityIssues.high.push({
      file: '.env',
      issue: '.env file exists - use .env.local or .env.example'
    });
  }
}

// Check dependencies for vulnerabilities
function checkDependencies() {
  console.log('\n🔍 Dependency Security Check\n');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const riskyPackages = ['eval', 'node-eval', 'serialize-javascript'];
  
  Object.keys(packageJson.dependencies || {}).forEach(dep => {
    if (riskyPackages.includes(dep)) {
      securityIssues.high.push({
        file: 'package.json',
        issue: `Risky dependency: ${dep}`
      });
    }
  });
  
  console.log('Run `npm audit` for detailed vulnerability scan');
}

// Check Next.js security headers
function checkNextjsSecurity() {
  console.log('\n🔍 Next.js Security Configuration\n');
  
  const configPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(configPath)) {
    const config = fs.readFileSync(configPath, 'utf8');
    
    const recommendedHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Content-Security-Policy'
    ];
    
    recommendedHeaders.forEach(header => {
      if (!config.includes(header)) {
        securityIssues.medium.push({
          file: 'next.config.js',
          issue: `Missing security header: ${header}`
        });
      }
    });
  }
}

// Check Supabase RLS
function checkSupabaseSecurity() {
  console.log('\n🔍 Supabase Security Check\n');
  
  console.log('⚠️  Manual checks required:');
  console.log('  1. Verify RLS is enabled on all tables');
  console.log('  2. Check RLS policies are restrictive');
  console.log('  3. Ensure service role key is not used client-side');
  console.log('  4. Verify email verification is enabled');
}

// Main execution
console.log('Scanning project files...\n');
scanDirectory(process.cwd());
checkEnvironmentSecurity();
checkDependencies();
checkNextjsSecurity();
checkSupabaseSecurity();

// Report results
console.log('\n📊 Security Audit Results\n');

if (securityIssues.critical.length > 0) {
  console.log('🚨 CRITICAL Issues:');
  securityIssues.critical.forEach(issue => {
    console.log(`  - ${issue.file}: ${issue.issue}`);
  });
}

if (securityIssues.high.length > 0) {
  console.log('\n⚠️  HIGH Priority Issues:');
  securityIssues.high.forEach(issue => {
    console.log(`  - ${issue.file}: ${issue.issue}`);
  });
}

if (securityIssues.medium.length > 0) {
  console.log('\n⚡ MEDIUM Priority Issues:');
  securityIssues.medium.forEach(issue => {
    console.log(`  - ${issue.file}: ${issue.issue}`);
  });
}

if (securityIssues.low.length > 0) {
  console.log('\n💡 LOW Priority Issues:');
  securityIssues.low.forEach(issue => {
    console.log(`  - ${issue.file}: ${issue.issue}`);
  });
}

const totalIssues = securityIssues.critical.length + securityIssues.high.length + 
                   securityIssues.medium.length + securityIssues.low.length;

if (totalIssues === 0) {
  console.log('✅ No security issues detected!');
} else {
  console.log(`\n📊 Total issues found: ${totalIssues}`);
}

console.log('\n✅ Security audit complete!');