const https = require('https');
const http = require('http');

const API_ENDPOINTS = [
  { path: '/', method: 'GET', name: 'Landing Page' },
  { path: '/threads', method: 'GET', name: 'Threads Page' },
  { path: '/classroom', method: 'GET', name: 'Classroom Page' },
  { path: '/api/leads', method: 'GET', name: 'Leads API' },
];

async function measureEndpoint(endpoint) {
  return new Promise((resolve) => {
    const start = Date.now();
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'User-Agent': 'Performance-Test'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const end = Date.now();
        const time = end - start;
        const size = Buffer.byteLength(data);
        
        resolve({
          name: endpoint.name,
          path: endpoint.path,
          time: time,
          status: res.statusCode,
          size: size
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        path: endpoint.path,
        time: -1,
        status: 0,
        size: 0,
        error: error.message
      });
    });

    req.end();
  });
}

async function runPerformanceTest() {
  console.log('🚀 API Performance Test\n');
  console.log('Testing endpoints on http://localhost:3000\n');
  
  const results = [];
  
  for (const endpoint of API_ENDPOINTS) {
    const result = await measureEndpoint(endpoint);
    results.push(result);
    
    if (result.error) {
      console.log(`❌ ${result.name}: Error - ${result.error}`);
    } else {
      const status = result.status === 200 ? '✅' : '⚠️';
      console.log(`${status} ${result.name}: ${result.time}ms (${result.status}) - ${(result.size / 1024).toFixed(2)}KB`);
    }
  }
  
  console.log('\n📊 Performance Summary\n');
  
  const successfulResults = results.filter(r => !r.error && r.status === 200);
  
  if (successfulResults.length > 0) {
    const avgTime = successfulResults.reduce((sum, r) => sum + r.time, 0) / successfulResults.length;
    const maxTime = Math.max(...successfulResults.map(r => r.time));
    const minTime = Math.min(...successfulResults.map(r => r.time));
    
    console.log(`Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`Fastest: ${minTime}ms`);
    console.log(`Slowest: ${maxTime}ms`);
    
    console.log('\n⚡ Performance Recommendations:\n');
    
    const slowEndpoints = successfulResults.filter(r => r.time > 200);
    if (slowEndpoints.length > 0) {
      console.log('⚠️  Slow endpoints (>200ms):');
      slowEndpoints.forEach(e => {
        console.log(`   - ${e.name}: ${e.time}ms`);
      });
    } else {
      console.log('✅ All endpoints respond within 200ms target!');
    }
    
    const largeResponses = successfulResults.filter(r => r.size > 100 * 1024);
    if (largeResponses.length > 0) {
      console.log('\n⚠️  Large responses (>100KB):');
      largeResponses.forEach(e => {
        console.log(`   - ${e.name}: ${(e.size / 1024).toFixed(2)}KB`);
      });
    }
  } else {
    console.log('❌ No successful responses. Is the server running?');
    console.log('   Run: npm run dev');
  }
}

// Check if server is running first
http.get('http://localhost:3000', (res) => {
  runPerformanceTest();
}).on('error', (err) => {
  console.log('❌ Server not running at http://localhost:3000');
  console.log('   Please start the server with: npm run dev');
});