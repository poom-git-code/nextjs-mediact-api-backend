# DigitalOcean App Platform Deployment Guide

## ปัญหาที่พบบ่อยและการแก้ไข

### 1. Port Configuration
DigitalOcean App Platform จะตั้งค่า `PORT` environment variable เอง (โดยปกติจะเป็น 8080)

**ที่แก้ไขแล้ว:**
- ✅ `src/index.ts` ใช้ `config.server.port` ที่รับ `process.env.PORT`
- ✅ `ecosystem.config.js` เพิ่ม `PORT: process.env.PORT || 3600`

### 2. Build และ Start Commands
DigitalOcean ต้องการ commands ที่ชัดเจน

**ที่แก้ไขแล้ว:**
- ✅ เพิ่ม `prestart: "npm run build"` ใน package.json
- ✅ เพิ่ม `start:production` script
- ✅ สร้าง Dockerfile สำหรับ container deployment

### 3. Health Check
DigitalOcean ต้องการ simple health check endpoint

**ที่แก้ไขแล้ว:**
- ✅ เพิ่ม `simpleHealthCheck` function
- ✅ Route `/health` ให้ response แบบง่าย
- ✅ Route `/health/detailed` สำหรับ detailed info

### 4. Memory และ Timeout Configuration
DigitalOcean มีข้อจำกัดเรื่อง memory และ timeout

**ที่แก้ไขแล้ว:**
- ✅ ปรับ memory limit เป็น 1024MB สำหรับ production
- ✅ ตั้งค่า timeout ที่เหมาะสม (5-6 นาทีสำหรับ heavy operations)

## การ Deploy บน DigitalOcean App Platform

### 🚨 สำคัญ: แก้ไขปัญหา Memory Out of Memory

**ปัญหาที่พบ:**
- `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`
- Health checks ล้มเหลว: `dial tcp 10.244.114.178:8080: connect: connection refused`

**วิธีแก้ไข:**

### 1. ตั้งค่า Instance Size ที่เหมาะสม
```yaml
instance_size_slug: basic-xs  # อย่างน้อย 1GB RAM สำหรับ build
```

### 2. เพิ่ม Memory Limits
```yaml
envs:
- key: NODE_OPTIONS
  value: "--max-old-space-size=2048"  # 2GB สำหรับ build
```

### 3. ตั้งค่า Health Check ที่เหมาะสม
```yaml
health_check:
  http_path: /health
  initial_delay_seconds: 60  # รอ 1 นาทีก่อน health check
  period_seconds: 15
  timeout_seconds: 10
  failure_threshold: 5  # อดทนมากขึ้น
```

### วิธีที่ 1: ใช้ App Platform Console (แนะนำ)
1. ไปที่ DigitalOcean Console → Apps
2. สร้าง App ใหม่หรือแก้ไข app เดิม
3. ตั้งค่า:
   - **Repository**: `Medi-Health-Act/mediact-api-backend`
   - **Branch**: `development`
   - **Instance Size**: `basic-xs` (1GB RAM)
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`

4. **Environment Variables** (สำคัญ!):
   ```
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=2048
   PORT=8080
   ```

### วิธีที่ 2: ใช้ doctl CLI
```bash
# Install doctl
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-darwin-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Deploy using app spec
doctl apps create --spec .do-app-config.yaml
```

### วิธีที่ 3: ใช้ Docker (แนะนำ)
```bash
# Build และ push ไปยัง DigitalOcean Container Registry
doctl registry create mediact-registry
docker build -t registry.digitalocean.com/mediact-registry/api:latest .
docker push registry.digitalocean.com/mediact-registry/api:latest
```

## Environment Variables ที่ต้องตั้งในDigitalOcean

### Required Variables:
- `NODE_ENV=production`
- `PORT` (DigitalOcean จะตั้งให้เอง)
- `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`
- `JWT_SECRET`
- `ENCRYPTION_MASTER_KEY`
- `SEARCH_SALT`

### Optional Variables (มีค่า default):
- `SERVER_TIMEOUT=350000`
- `REQUEST_TIMEOUT=300000`
- `KEEP_ALIVE_TIMEOUT=300000`
- `HEADERS_TIMEOUT=310000`
- `NODE_OPTIONS=--max-old-space-size=1024`
- `MEMORY_MONITORING=true`

## การตรวจสอบ

### ตรวจสอบ Health Check:
```bash
curl https://your-app.ondigitalocean.app/health
```

### ตรวจสอบ Detailed Health:
```bash
curl https://your-app.ondigitalocean.app/health/detailed
```

### ตรวจสอบ Memory:
```bash
curl https://your-app.ondigitalocean.app/debug/memory
```

## ปัญหาที่อาจพบและการแก้ไข

### 1. Build Failed
- ตรวจสอบ dependencies ใน package.json
- ตรวจสอบ TypeScript compilation

### 2. Health Check Failed
- ตรวจสอบว่า `/health` endpoint ทำงาน
- ตรวจสอบ database connection

### 3. Memory Issues
- ลด `max-old-space-size` เป็น 512MB ถ้า 1024MB ไม่เพียงพอ
- ตรวจสอบ memory leaks

### 4. Timeout Issues
- เพิ่ม timeout values ใน environment variables
- ตรวจสอบ database query performance

## Logs และ Monitoring
```bash
# ดู logs
doctl apps logs <app-id>

# ดู app status
doctl apps get <app-id>
```