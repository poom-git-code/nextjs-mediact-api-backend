# Server Timeout Configuration Guide

## ปัญหา Timeout บน Server

หากคุณพบปัญหา timeout บน production server แต่ใน local ไม่มีปัญหา อาจเป็นเพราะสาเหตุต่อไปนี้:

### 1. Load Balancer / Reverse Proxy Timeout
- **Nginx**: Default timeout 60 วินาที
- **Cloudflare**: Default timeout 100 วินาที
- **AWS ALB**: Default timeout 60 วินาที
- **Digital Ocean Load Balancer**: Default timeout 60 วินาที

### 2. Server Environment Variables ไม่ตรงกับ Local

## วิธีแก้ไข

### ขั้นตอนที่ 1: ตั้งค่า Environment Variables บน Server

เพิ่มใน `.env` file บน server:

```env
# Timeout Configuration (in milliseconds)
SERVER_TIMEOUT=120000          # 2 minutes
REQUEST_TIMEOUT=90000          # 1.5 minutes  
KEEP_ALIVE_TIMEOUT=60000       # 1 minute
HEADERS_TIMEOUT=65000          # 65 seconds
```

### ขั้นตอนที่ 2: ตรวจสอบการตั้งค่าบน Server

```bash
# ตรวจสอบการตั้งค่าปัจจุบัน
curl https://your-server.com/debug/config

# ตรวจสอบ health check
curl https://your-server.com/health

# ทดสอบ timeout
curl "https://your-server.com/test/timeout?delay=30000"
```

### ขั้นตอนที่ 3: การตั้งค่า Nginx (ถ้าใช้)

เพิ่มใน nginx configuration:

```nginx
server {
    # เพิ่มการตั้งค่า timeout
    proxy_connect_timeout       180s;
    proxy_send_timeout          180s;
    proxy_read_timeout          180s;
    client_body_timeout         180s;
    client_header_timeout       180s;
    
    location / {
        proxy_pass http://localhost:3600;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### ขั้นตอนที่ 4: การตั้งค่า PM2 (ถ้าใช้)

```json
{
  "apps": [{
    "name": "mediact-api",
    "script": "dist/index.js",
    "env": {
      "NODE_ENV": "production",
      "SERVER_TIMEOUT": "120000",
      "REQUEST_TIMEOUT": "90000",
      "KEEP_ALIVE_TIMEOUT": "60000",
      "HEADERS_TIMEOUT": "65000"
    }
  }]
}
```

### ขั้นตอนที่ 5: การตั้งค่า Docker (ถ้าใช้)

```dockerfile
# ตั้งค่า environment variables
ENV SERVER_TIMEOUT=120000
ENV REQUEST_TIMEOUT=90000
ENV KEEP_ALIVE_TIMEOUT=60000
ENV HEADERS_TIMEOUT=65000

# เพิ่ม healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3600/health || exit 1
```

## การ Debug

### 1. ตรวจสอบ Log บน Server

```bash
# ดู logs สำหรับ timeout errors
tail -f /var/log/your-app.log | grep -i timeout

# ดู PM2 logs
pm2 logs your-app-name
```

### 2. ตรวจสอบ Network Latency

```bash
# ทดสอบความเร็วการเชื่อมต่อ
curl -w "@curl-format.txt" -o /dev/null -s https://your-server.com/health
```

สร้างไฟล์ `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### 3. ตรวจสอบ Database Performance

```bash
# ตรวจสอบ slow queries
SHOW FULL PROCESSLIST;

# ตรวจสอบ database connections
SHOW STATUS LIKE 'Threads_connected';
```

## แนวทางแก้ไขเฉพาะปัญหา

### ปัญหา: Database Query ช้า
```javascript
// เพิ่ม query timeout
const result = await sequelize.query(sql, {
  timeout: 30000, // 30 seconds
  type: QueryTypes.SELECT
});
```

### ปัญหา: External API calls ช้า
```javascript
// เพิ่ม axios timeout
const response = await axios.get(url, {
  timeout: 30000 // 30 seconds
});
```

### ปัญหา: File upload ช้า
```javascript
// เพิ่ม custom timeout สำหรับ upload
customTimeouts: {
  '/api/upload': 300000, // 5 minutes
}
```

## การ Monitor

### 1. ตั้งค่า Monitoring
```javascript
// เพิ่มใน app.js
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  
  if (duration > 10000) { // เกิน 10 วินาที
    console.warn(`Slow request: ${ctx.method} ${ctx.path} took ${duration}ms`);
  }
});
```

### 2. ตั้งค่า Alerts
```bash
# ส่ง alert เมื่อมี timeout
tail -f /var/log/app.log | grep -i "timeout" | while read line; do
  echo "TIMEOUT ALERT: $line" | mail -s "Server Timeout" admin@yoursite.com
done
```