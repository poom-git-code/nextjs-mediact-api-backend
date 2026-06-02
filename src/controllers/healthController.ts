import { Context } from 'koa';
import { memoryMonitor } from '../middlewares/memory.middleware';

/**
 * Simple health check endpoint for DigitalOcean
 */
export const simpleHealthCheck = async (ctx: Context) => {
  ctx.status = 200;
  ctx.body = {
    status: 'OK!',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  };
};

/**
 * Detailed health check endpoint
 */
export const healthCheck = async (ctx: Context) => {
  const memUsage = process.memoryUsage();
  
  ctx.status = 200;
  ctx.body = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    timeout_config: {
      server_timeout: process.env.SERVER_TIMEOUT || '350000',
      request_timeout: process.env.REQUEST_TIMEOUT || '300000',
      keep_alive_timeout: process.env.KEEP_ALIVE_TIMEOUT || '300000',
      headers_timeout: process.env.HEADERS_TIMEOUT || '310000'
    },
    memory_usage: {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`
    },
    server_info: {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid
    }
  };
};

/**
 * Timeout test endpoint - simulates a slow request
 */
export const timeoutTest = async (ctx: Context) => {
  const delay = parseInt(ctx.query.delay as string) || 5000; // Default 5 seconds
  const maxDelay = 120000; // Maximum 2 minutes
  
  // Limit delay to prevent abuse
  const actualDelay = Math.min(delay, maxDelay);
  
  console.log(`🕐 Starting timeout test with ${actualDelay}ms delay`);
  
  try {
    await new Promise(resolve => setTimeout(resolve, actualDelay));
    
    ctx.status = 200;
    ctx.body = {
      message: 'Timeout test completed',
      delay: actualDelay,
      timestamp: new Date().toISOString(),
      success: true
    };
    
    console.log(`✅ Timeout test completed successfully after ${actualDelay}ms`);
  } catch (error) {
    console.log(`❌ Timeout test failed: ${error}`);
    throw error;
  }
};

/**
 * Heavy computation test to simulate CPU-intensive operations
 */
export const heavyComputationTest = async (ctx: Context) => {
  const iterations = parseInt(ctx.query.iterations as string) || 1000000; // Default 1M iterations
  const maxIterations = 10000000; // Maximum 10M iterations
  
  const actualIterations = Math.min(iterations, maxIterations);
  
  console.log(`💻 Starting heavy computation test with ${actualIterations} iterations`);
  
  const startTime = Date.now();
  
  // Simulate heavy computation
  let result = 0;
  for (let i = 0; i < actualIterations; i++) {
    result += Math.sqrt(i) * Math.random();
    
    // Allow other operations to run every 100k iterations
    if (i % 100000 === 0) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  ctx.status = 200;
  ctx.body = {
    message: 'Heavy computation test completed',
    iterations: actualIterations,
    duration: `${duration}ms`,
    result: result.toFixed(2),
    timestamp: new Date().toISOString(),
    success: true
  };
  
  console.log(`✅ Heavy computation test completed in ${duration}ms`);
};

/**
 * Memory test to simulate memory-intensive operations
 */
export const memoryTest = async (ctx: Context) => {
  const sizeInMB = parseInt(ctx.query.size as string) || 10; // Default 10MB
  const maxSizeInMB = 100; // Maximum 100MB
  
  const actualSizeInMB = Math.min(sizeInMB, maxSizeInMB);
  const sizeInBytes = actualSizeInMB * 1024 * 1024;
  
  console.log(`🧠 Starting memory test with ${actualSizeInMB}MB allocation`);
  
  const startTime = Date.now();
  
  try {
    // Allocate memory
    const largeArray = new Array(sizeInBytes / 8); // 8 bytes per number
    
    // Fill array with data
    for (let i = 0; i < largeArray.length; i++) {
      largeArray[i] = Math.random();
      
      // Allow other operations to run every 100k items
      if (i % 100000 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Get memory usage
    const memUsage = process.memoryUsage();
    
    ctx.status = 200;
    ctx.body = {
      message: 'Memory test completed',
      allocated_mb: actualSizeInMB,
      duration: `${duration}ms`,
      memory_usage: {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`
      },
      timestamp: new Date().toISOString(),
      success: true
    };
    
    console.log(`✅ Memory test completed in ${duration}ms`);
    
    // Clean up
    largeArray.length = 0;
    
  } catch (error) {
    console.log(`❌ Memory test failed: ${error}`);
    throw error;
  }
};

/**
 * Server configuration debug endpoint
 */
export const configDebug = async (ctx: Context) => {
  ctx.status = 200;
  ctx.body = {
    message: 'Server configuration debug info',
    environment_variables: {
      NODE_ENV: process.env.NODE_ENV || 'not_set',
      PORT: process.env.PORT || 'not_set',
      SERVER_TIMEOUT: process.env.SERVER_TIMEOUT || 'not_set',
      REQUEST_TIMEOUT: process.env.REQUEST_TIMEOUT || 'not_set',
      KEEP_ALIVE_TIMEOUT: process.env.KEEP_ALIVE_TIMEOUT || 'not_set',
      HEADERS_TIMEOUT: process.env.HEADERS_TIMEOUT || 'not_set'
    },
    current_timeouts: {
      server_timeout: parseInt(process.env.SERVER_TIMEOUT || '350000'),
      request_timeout: parseInt(process.env.REQUEST_TIMEOUT || '300000'),
      keep_alive_timeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT || '300000'),
      headers_timeout: parseInt(process.env.HEADERS_TIMEOUT || '310000')
    },
    recommendations: {
      production: {
        SERVER_TIMEOUT: 120000,    // 2 minutes
        REQUEST_TIMEOUT: 90000,    // 1.5 minutes
        KEEP_ALIVE_TIMEOUT: 60000, // 1 minute
        HEADERS_TIMEOUT: 65000     // 65 seconds
      },
      development: {
        SERVER_TIMEOUT: 60000,     // 1 minute
        REQUEST_TIMEOUT: 45000,    // 45 seconds
        KEEP_ALIVE_TIMEOUT: 50000, // 50 seconds
        HEADERS_TIMEOUT: 55000     // 55 seconds
      }
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Memory statistics and management endpoint
 */
export const memoryStats = async (ctx: Context) => {
  const stats = memoryMonitor.getStats();
  
  ctx.status = 200;
  ctx.body = {
    message: 'Memory statistics',
    ...stats,
    memory_recommendations: {
      current_heap_mb: stats.currentMemory.heapUsed,
      recommended_max_heap_mb: 4096,
      status: stats.currentMemory.heapUsed > 2048 ? 'critical' : 
              stats.currentMemory.heapUsed > 1024 ? 'warning' : 'ok'
    },
    node_options: {
      current_max_old_space_size: process.env.NODE_OPTIONS?.includes('--max-old-space-size') ? 
        process.env.NODE_OPTIONS.match(/--max-old-space-size=(\d+)/)?.[1] : 'default (~1.4GB)',
      recommended: '--max-old-space-size=4096'
    },
    gc_available: typeof global.gc === 'function',
    timestamp: new Date().toISOString()
  };
};

/**
 * Force garbage collection endpoint (if available)
 */
export const forceGC = async (ctx: Context) => {
  const beforeGC = process.memoryUsage();
  
  if (typeof global.gc === 'function') {
    global.gc();
    
    const afterGC = process.memoryUsage();
    const freed = {
      heapUsed: Math.round((beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024),
      heapTotal: Math.round((beforeGC.heapTotal - afterGC.heapTotal) / 1024 / 1024),
      rss: Math.round((beforeGC.rss - afterGC.rss) / 1024 / 1024)
    };
    
    ctx.status = 200;
    ctx.body = {
      message: 'Garbage collection completed',
      before_gc: {
        heapUsed: Math.round(beforeGC.heapUsed / 1024 / 1024),
        heapTotal: Math.round(beforeGC.heapTotal / 1024 / 1024),
        rss: Math.round(beforeGC.rss / 1024 / 1024)
      },
      after_gc: {
        heapUsed: Math.round(afterGC.heapUsed / 1024 / 1024),
        heapTotal: Math.round(afterGC.heapTotal / 1024 / 1024),
        rss: Math.round(afterGC.rss / 1024 / 1024)
      },
      freed_mb: freed,
      timestamp: new Date().toISOString()
    };
    
    console.log(`🗑️ Manual GC: Freed ${freed.heapUsed}MB heap, ${freed.rss}MB RSS`);
  } else {
    ctx.status = 503;
    ctx.body = {
      error: 'Garbage collection not available',
      message: 'Start Node.js with --expose-gc flag to enable manual GC',
      example: 'node --expose-gc --max-old-space-size=4096 dist/index.js'
    };
  }
};