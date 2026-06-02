import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import AuditController from '../controllers/auditController';
// import { authMiddleware } from '../middleware/authMiddleware'; // ปรับ path ตาม middleware ที่มีอยู่

const router = new Router({ prefix: '/api/audit' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// ต้องมี authentication ทุก route (ใส่ middleware authentication ที่มีอยู่)
// router.use(authMiddleware);

// ดึงรายการ audit logs ทั้งหมด
router.get('/logs', AuditController.getAuditLogs);

// ดึง audit trail สำหรับ record เฉพาะ
router.get('/trail/:tableName/:recordId', AuditController.getRecordAuditTrail);

// ดึง audit trail สำหรับ user เฉพาะ
router.get('/user/:userId', AuditController.getUserAuditTrail);

// ดึงสถิติการใช้งาน
router.get('/stats', AuditController.getAuditStats);

export default router;
