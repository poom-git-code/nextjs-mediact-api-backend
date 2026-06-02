# Memory Management Guide

## ปัญหา JavaScript Heap Out of Memory

### สาเหตุหลัก:
1. **Memory Leaks** - Objects ที่ไม่ถูก garbage collect
2. **Large Data Processing** - การประมวลผลข้อมูลขนาดใหญ่
3. **Insufficient Heap Size** - Node.js heap size เล็กเกินไป
4. **Poor Garbage Collection** - การจัดการ memory ไม่มีประสิทธิภาพ

## วิธีแก้ไข

### 1. เพิ่ม Node.js Heap Size

```bash
# Development
npm run dev  # จะใช้ --max-old-space-size=4096 อัตโนมัติ

# Production
npm run start  # จะใช้ --max-old-space-size=4096 อัตโนมัติ

# Manual
node --max-old-space-size=4096 dist/index.js
```

### 2. Environment Variables

เพิ่มใน `.env`:
```env
NODE_OPTIONS=--max-old-space-size=4096
MEMORY_MONITORING=true
MEMORY_LOG_INTERVAL=30000
```

### 3. PM2 Configuration

สร้างไฟล์ `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'mediact-api',
    script: 'dist/index.js',
    node_args: '--max-old-space-size=4096 --expose-gc',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    max_memory_restart: '3G',
    instances: 1,
    exec_mode: 'fork'
  }]
};
```

### 4. Docker Configuration

```dockerfile
# เพิ่มใน Dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV MEMORY_MONITORING=true

# Health check สำหรับ memory
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3600/debug/memory || exit 1
```

## การ Monitor Memory

### 1. Memory Statistics
```bash
# ตรวจสอบ memory usage
curl http://localhost:3600/debug/memory

# ตัวอย่าง response:
{
  "requestCount": 1245,
  "maxMemoryUsed": 512,
  "currentMemory": {
    "heapUsed": 256,
    "heapTotal": 512,
    "rss": 384,
    "external": 32
  },
  "memory_recommendations": {
    "status": "ok"
  }
}
```

### 2. Force Garbage Collection
```bash
# บังคับ garbage collection (ต้องเปิด --expose-gc)
curl -X POST http://localhost:3600/debug/gc
```

### 3. Memory Logs
แอปพลิเคชันจะ log memory usage ทุก 30 วินาที:
```
📊 Memory Usage: Heap 256/512MB, RSS 384MB, Requests: 1245, Max: 512MB
⚠️ Memory usage high: 768MB (threshold: 512MB)
🚨 Memory usage critical: 1024MB (alert: 1024MB)
```

## การป้องกัน Memory Leaks

### 1. Database Connections
```javascript
// ปิด connection หลังใช้งาน
try {
  const result = await sequelize.query(sql);
  return result;
} finally {
  // Sequelize จัดการ connection pool เอง
  // แต่ควรตรวจสอบ connection leaks
}
```

### 2. Event Listeners
```javascript
// เอา event listeners ออกเมื่อไม่ใช้
const cleanup = () => {
  process.removeAllListeners('SIGINT');
  process.removeAllListeners('SIGTERM');
};
```

### 3. Timers และ Intervals
```javascript
// Clear timers และ intervals
const timeoutId = setTimeout(() => {}, 1000);
const intervalId = setInterval(() => {}, 1000);

// ใน cleanup function
clearTimeout(timeoutId);
clearInterval(intervalId);
```

### 4. Large Objects
```javascript
// หลีกเลี่ยงการเก็บ large objects ใน memory นานเกินไป
const processLargeData = async (data) => {
  try {
    // ประมวลผลทีละส่วน
    for (let i = 0; i < data.length; i += 1000) {
      const chunk = data.slice(i, i + 1000);
      await processChunk(chunk);
      
      // ให้ event loop ทำงาน
      await new Promise(resolve => setImmediate(resolve));
    }
  } finally {
    // ล้าง reference
    data = null;
  }
};
```

## การใช้งาน Memory Profiling

### 1. เปิด Inspector
```bash
# Development with inspector
npm run dev:memory-profile

# Production with inspector
npm run start:memory-profile
```

### 2. เชื่อมต่อ Chrome DevTools
1. เปิด `chrome://inspect`
2. คลิก "Open dedicated DevTools for Node"
3. ไปที่ tab "Memory"
4. สร้าง heap snapshot

### 3. วิเคราะห์ Memory Usage
- **Heap Snapshot**: ดู objects ที่ใช้ memory มากที่สุด
- **Timeline**: ดู memory usage ตลอดเวลา
- **Comparison**: เปรียบเทียบ snapshots

## Best Practices

### 1. Regular Monitoring
```javascript
// ตรวจสอบ memory usage เป็นระยะ
setInterval(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed / 1024 / 1024 > 1024) { // > 1GB
    console.warn('High memory usage detected');
  }
}, 60000); // ทุก 1 นาที
```

### 2. Graceful Shutdown
```javascript
// ใน index.ts
process.on('SIGINT', async () => {
  console.log('Graceful shutdown...');
  
  // ปิด memory monitor
  memoryMonitor.stop();
  
  // ปิด database connections
  await sequelize.close();
  
  process.exit(0);
});
```

### 3. Production Settings
```bash
# Production environment variables
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
MEMORY_MONITORING=true
```

## Troubleshooting

### ปัญหา: Memory ขึ้นเรื่อยๆ ไม่ลง
**สาเหตุ**: Memory leak
**วิธีแก้**: 
1. ใช้ heap snapshot เปรียบเทียบ
2. ตรวจสอบ event listeners
3. ตรวจสอบ global variables

### ปัญหา: Garbage Collection ช้า
**สาเหตุ**: Heap size ใหญ่เกินไป
**วิธีแก้**: 
1. ลด max-old-space-size
2. เพิ่ม instances แทนการเพิ่ม memory
3. ใช้ cluster mode

### ปัญหา: Out of Memory ในระหว่าง startup
**สาเหตุ**: การ load modules หรือ initialization
**วิธีแก้**: 
1. เพิ่ม heap size ชั่วคราว
2. Lazy load modules
3. ลด memory usage ใน initialization