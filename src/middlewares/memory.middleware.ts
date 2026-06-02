import { Context, Next } from 'koa';

interface MemoryMonitorOptions {
  enabled?: boolean;
  logInterval?: number; // in milliseconds
  memoryThreshold?: number; // in MB
  alertThreshold?: number; // in MB
  gcThreshold?: number; // in MB
}

class MemoryMonitor {
  private options: MemoryMonitorOptions;
  private intervalId: NodeJS.Timeout | null = null;
  private requestCount = 0;
  private maxMemoryUsed = 0;

  constructor(options: MemoryMonitorOptions = {}) {
    this.options = {
      enabled: true,
      logInterval: 30000, // 30 seconds
      memoryThreshold: 512, // 512 MB warning
      alertThreshold: 1024, // 1 GB alert
      gcThreshold: 2048, // 2 GB force GC
      ...options
    };

    if (this.options.enabled) {
      this.startMonitoring();
    }
  }

  private startMonitoring() {
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, this.options.logInterval);
  }

  private checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);

    // Track max memory usage
    if (heapUsedMB > this.maxMemoryUsed) {
      this.maxMemoryUsed = heapUsedMB;
    }

    console.log(`📊 Memory Usage: Heap ${heapUsedMB}/${heapTotalMB}MB, RSS ${rssMB}MB, Requests: ${this.requestCount}, Max: ${this.maxMemoryUsed}MB`);

    // Warning threshold
    if (heapUsedMB > this.options.memoryThreshold!) {
      console.warn(`⚠️ Memory usage high: ${heapUsedMB}MB (threshold: ${this.options.memoryThreshold}MB)`);
    }

    // Alert threshold
    if (heapUsedMB > this.options.alertThreshold!) {
      console.error(`🚨 Memory usage critical: ${heapUsedMB}MB (alert: ${this.options.alertThreshold}MB)`);
      
      // Log potential memory leaks
      this.logPotentialLeaks();
    }

    // Force garbage collection if available and memory is very high
    if (heapUsedMB > this.options.gcThreshold! && global.gc) {
      console.log(`🗑️ Force garbage collection triggered at ${heapUsedMB}MB`);
      global.gc();
      
      // Check memory after GC
      const afterGC = process.memoryUsage();
      const newHeapUsedMB = Math.round(afterGC.heapUsed / 1024 / 1024);
      console.log(`🗑️ Memory after GC: ${newHeapUsedMB}MB (freed: ${heapUsedMB - newHeapUsedMB}MB)`);
    }
  }

  private logPotentialLeaks() {
    // Log some basic metrics that might indicate leaks
    console.log(`🔍 Potential leak indicators:`);
    console.log(`   - Total requests processed: ${this.requestCount}`);
    console.log(`   - Max memory used: ${this.maxMemoryUsed}MB`);
    console.log(`   - Memory per request: ${(this.maxMemoryUsed / (this.requestCount || 1)).toFixed(2)}MB`);
  }

  public middleware() {
    return async (ctx: Context, next: Next) => {
      if (!this.options.enabled) {
        return await next();
      }

      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      try {
        await next();
      } finally {
        this.requestCount++;
        
        const endTime = Date.now();
        const endMemory = process.memoryUsage();
        const duration = endTime - startTime;
        
        const memoryDiff = {
          heapUsed: Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024),
          heapTotal: Math.round((endMemory.heapTotal - startMemory.heapTotal) / 1024),
          rss: Math.round((endMemory.rss - startMemory.rss) / 1024)
        };

        // Log memory-intensive requests
        if (memoryDiff.heapUsed > 5000 || duration > 5000) { // 5MB or 5 seconds
          console.warn(`🐌 Heavy request: ${ctx.method} ${ctx.path}`);
          console.warn(`   Duration: ${duration}ms`);
          console.warn(`   Memory delta: Heap +${memoryDiff.heapUsed}KB, RSS +${memoryDiff.rss}KB`);
        }
      }
    };
  }

  public getStats() {
    const memUsage = process.memoryUsage();
    return {
      requestCount: this.requestCount,
      maxMemoryUsed: this.maxMemoryUsed,
      currentMemory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      uptime: process.uptime()
    };
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Export singleton instance
export const memoryMonitor = new MemoryMonitor({
  enabled: true,
  logInterval: 30000, // Log every 30 seconds
  memoryThreshold: 512, // Warn at 512MB
  alertThreshold: 1024, // Alert at 1GB
  gcThreshold: 2048 // Force GC at 2GB
});

export const memoryMiddleware = memoryMonitor.middleware();