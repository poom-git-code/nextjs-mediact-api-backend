import Router from 'koa-router';
import * as PrefController from '../controllers/userNotificationPreferenceController';
import { languageMiddleware } from '../middleware/languageMiddleware';

const router = new Router({ prefix: "/preferences" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.patch(
    '/me/by-key-type',
    PrefController.updateCurrentUserPreferencesByKeyType
);

// (ดึงการตั้งค่าทั้งหมดของ User ที่ล็อกอิน)
router.get(
    '/me',
    PrefController.getCurrentUserPreferences
);

// (อัปเดต/สร้าง (Upsert) การตั้งค่าของ User ที่ล็อกอิน)
router.post(
    '/me',
    PrefController.upsertCurrentUserPreference
);

// (ดึงการตั้งค่าทั้งหมด)
router.get(
    '/',
    PrefController.getAllPreferences
);

// (สร้างการตั้งค่า)
router.post(
    '/',
    PrefController.createPreference
);

// (ดึงการตั้งค่าด้วย ID)
router.get(
    '/:id',
    PrefController.getPreferenceById
);

// (อัปเดตการตั้งค่าด้วย ID)
router.put(
    '/:id',
    PrefController.updatePreference
);

// (เปิด (Enable) การตั้งค่าด้วย ID)
router.patch(
    '/:id/enable',
    PrefController.enablePreference
);

// (ปิด (Disable) การตั้งค่าด้วย ID)
router.patch(
    '/:id/disable',
    PrefController.disablePreference
);

// (ลบการตั้งค่าด้วย ID)
router.delete(
    '/:id',
    PrefController.deletePreference
);


export default router;