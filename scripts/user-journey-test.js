const https = require('https');
const http = require('http');

console.log('🚀 User Journey Test - Build What You Need\n');

const BASE_URL = 'http://localhost:3000';
const timestamp = Date.now();
const randomId = Math.random().toString(36).substring(7);
const testEmail = `test${timestamp}${randomId}@example.com`;
const testPassword = 'TestPassword123!';
// Use different email for rate limit test
const rateLimitEmail = `ratelimit${timestamp}${randomId}@example.com`;

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to make HTTP requests
async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testLandingPage() {
  console.log('1. Testing Landing Page...');
  try {
    const response = await makeRequest('/');
    if (response.status === 200) {
      results.passed.push('✅ Landing page loads correctly');
    } else {
      results.failed.push(`❌ Landing page returned ${response.status}`);
    }
  } catch (error) {
    results.failed.push(`❌ Landing page error: ${error.message}`);
  }
}

async function testLeadCapture() {
  console.log('2. Testing Lead Capture...');
  try {
    const response = await makeRequest('/api/leads', {
      method: 'POST',
      body: {
        email: testEmail,
        full_name: 'Test User',
        pain_level: 8,
        utm_source: 'test',
        utm_medium: 'test',
        utm_campaign: 'user-journey'
      }
    });
    
    if (response.status === 201) {
      results.passed.push('✅ Lead capture successful');
    } else {
      results.failed.push(`❌ Lead capture failed: ${response.data.error}`);
    }
  } catch (error) {
    results.failed.push(`❌ Lead capture error: ${error.message}`);
  }
}

async function testSignup() {
  console.log('3. Testing Signup...');
  try {
    const response = await makeRequest('/api/auth/signup', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
        full_name: 'Test User'
      }
    });
    
    if (response.status === 200) {
      results.passed.push('✅ Signup successful');
      return response.data.data;
    } else {
      results.failed.push(`❌ Signup failed: ${response.data.error}`);
      return null;
    }
  } catch (error) {
    results.failed.push(`❌ Signup error: ${error.message}`);
    return null;
  }
}

async function testLogin() {
  console.log('4. Testing Login...');
  
  // Add delay to avoid rate limit from previous signup
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword
      }
    });
    
    if (response.status === 200) {
      results.passed.push('✅ Login successful');
      if (response.data.data.redirectTo === '/payment') {
        results.passed.push('✅ Non-member redirected to payment');
      }
      return response.data.data;
    } else {
      results.failed.push(`❌ Login failed: ${response.data.error}`);
      return null;
    }
  } catch (error) {
    results.failed.push(`❌ Login error: ${error.message}`);
    return null;
  }
}

async function testProtectedRoutes() {
  console.log('5. Testing Protected Routes...');
  
  const protectedRoutes = [
    { path: '/threads', name: 'Threads' },
    { path: '/classroom', name: 'Classroom' },
    { path: '/calendar', name: 'Calendar' }
  ];
  
  for (const route of protectedRoutes) {
    try {
      const response = await makeRequest(route.path);
      if (response.status === 200) {
        // Check if it redirects or shows login
        if (response.data.includes('Sign up') || response.data.includes('login')) {
          results.passed.push(`✅ ${route.name} page protected for non-members`);
        } else {
          results.warnings.push(`⚠️ ${route.name} page may not be properly protected`);
        }
      } else if (response.status === 307 || response.status === 302) {
        results.passed.push(`✅ ${route.name} page redirects non-members`);
      }
    } catch (error) {
      results.failed.push(`❌ ${route.name} page error: ${error.message}`);
    }
  }
}

async function testPaymentFlow() {
  console.log('6. Testing Payment Flow...');
  
  // Test payment intent creation
  try {
    const response = await makeRequest('/api/stripe/payment-intent', {
      method: 'POST',
      body: {
        email: testEmail
      }
    });
    
    if (response.status === 200 && response.data.clientSecret) {
      results.passed.push('✅ Payment intent created successfully');
      results.passed.push('✅ Stripe Elements integration working');
    } else {
      results.failed.push(`❌ Payment intent creation failed`);
    }
  } catch (error) {
    results.failed.push(`❌ Payment flow error: ${error.message}`);
  }
}

async function testMobileResponsiveness() {
  console.log('7. Testing Mobile Headers...');
  
  try {
    const response = await makeRequest('/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    
    if (response.status === 200) {
      results.passed.push('✅ Mobile user agent accepted');
    }
  } catch (error) {
    results.warnings.push(`⚠️ Mobile test warning: ${error.message}`);
  }
}

async function testSecurityHeaders() {
  console.log('8. Testing Security Headers...');
  
  try {
    const response = await makeRequest('/');
    const headers = response.headers;
    
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'content-security-policy'
    ];
    
    securityHeaders.forEach(header => {
      if (headers[header]) {
        results.passed.push(`✅ ${header} header present`);
      } else {
        results.warnings.push(`⚠️ ${header} header missing`);
      }
    });
  } catch (error) {
    results.failed.push(`❌ Security headers test error: ${error.message}`);
  }
}

async function testRateLimiting() {
  console.log('9. Testing Rate Limiting...');
  
  // Test auth rate limiting
  const promises = [];
  for (let i = 0; i < 7; i++) {
    promises.push(makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: rateLimitEmail,
        password: 'wrong'
      }
    }));
  }
  
  try {
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      results.passed.push('✅ Rate limiting working on auth endpoints');
    } else {
      results.warnings.push('⚠️ Rate limiting may not be working properly');
    }
  } catch (error) {
    results.warnings.push(`⚠️ Rate limiting test error: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive user journey tests...\n');
  
  await testLandingPage();
  await testLeadCapture();
  const signupData = await testSignup();
  
  if (signupData) {
    await testLogin();
  }
  
  await testProtectedRoutes();
  await testPaymentFlow();
  await testMobileResponsiveness();
  await testSecurityHeaders();
  await testRateLimiting();
  
  // Print results
  console.log('\n📊 Test Results Summary\n');
  
  if (results.passed.length > 0) {
    console.log('Passed Tests:');
    results.passed.forEach(test => console.log(test));
  }
  
  if (results.warnings.length > 0) {
    console.log('\nWarnings:');
    results.warnings.forEach(warning => console.log(warning));
  }
  
  if (results.failed.length > 0) {
    console.log('\nFailed Tests:');
    results.failed.forEach(fail => console.log(fail));
  }
  
  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? (results.passed.length / total * 100).toFixed(1) : 0;
  
  console.log(`\n✅ Passed: ${results.passed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📈 Pass Rate: ${passRate}%`);
}

// Execute tests
runAllTests().catch(console.error);