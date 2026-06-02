import { Context, Next } from 'koa';

interface TimeoutOptions {
  timeout?: number; // timeout in milliseconds
  excludePaths?: string[]; // paths to exclude from timeout
  customTimeouts?: { [path: string]: number }; // custom timeout for specific paths
}

/**
 * Timeout middleware for Koa
 * @param options Configuration options
 */
export const timeoutMiddleware = (options: TimeoutOptions = {}) => {
  const {
    timeout = 30000, // 30 seconds default
    excludePaths = [],
    customTimeouts = {}
  } = options;

  return async (ctx: Context, next: Next) => {
    const startTime = Date.now();
    
    // Check if path should be excluded from timeout
    if (excludePaths.some(path => ctx.path.startsWith(path))) {
      console.log(`⏭️ Path ${ctx.path} excluded from timeout`);
      return await next();
    }

    // Get timeout for current path
    const currentTimeout = customTimeouts[ctx.path] || timeout;
    
    console.log(`⏰ Setting timeout for ${ctx.method} ${ctx.path}: ${currentTimeout}ms`);
    
    let timeoutId: NodeJS.Timeout | null = null;
    let isTimedOut = false;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        isTimedOut = true;
        const duration = Date.now() - startTime;
        console.log(`💥 TIMEOUT: ${ctx.method} ${ctx.path} after ${duration}ms (limit: ${currentTimeout}ms)`);
        reject(new Error('Request timeout'));
      }, currentTimeout);
    });

    try {
      const result = await Promise.race([next(), timeoutPromise]);
      
      if (timeoutId && !isTimedOut) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        console.log(`✅ Completed: ${ctx.method} ${ctx.path} in ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      if (timeoutId && !isTimedOut) {
        clearTimeout(timeoutId);
      }
      
      if (error instanceof Error && error.message === 'Request timeout') {
        const duration = Date.now() - startTime;
        ctx.status = 408;
        ctx.body = {
          error: 'Request Timeout',
          message: `Request took longer than ${currentTimeout / 1000} seconds`,
          timeout: currentTimeout,
          duration: duration,
          path: ctx.path,
          method: ctx.method,
          timestamp: new Date().toISOString(),
          server_info: {
            node_env: process.env.NODE_ENV || 'development',
            server_timeout: process.env.SERVER_TIMEOUT || 'not_set',
            request_timeout: process.env.REQUEST_TIMEOUT || 'not_set'
          }
        };
        
        console.error(`❌ REQUEST TIMEOUT DETAILS:`, {
          path: ctx.path,
          method: ctx.method,
          duration: duration,
          timeout_limit: currentTimeout,
          user_agent: ctx.headers['user-agent'],
          ip: ctx.ip,
          query: ctx.query,
          env: process.env.NODE_ENV
        });
      } else {
        throw error;
      }
    }
  };
};

// Export default timeout configurations
export const defaultTimeoutConfig: TimeoutOptions = {
  timeout: 30000, // 30 seconds
  excludePaths: [
    '/health',
    '/ping',
    '/metrics',
    '/upload' // File uploads might take longer
  ],
  customTimeouts: {
    '/api/upload': 120000, // 2 minutes for file uploads
    '/api/reports': 60000,  // 1 minute for reports
    '/api/export': 90000,   // 1.5 minutes for exports
    '/api/import': 120000,  // 2 minutes for imports
    '/api/backup': 300000,  // 5 minutes for backups
  }
};