import Router from 'koa-router';
import * as ProductivityController from '../controllers/productivityController';
import { languageMiddleware } from '../middleware/languageMiddleware';

const router = new Router({ prefix: "/productivity-records" });

router.use(languageMiddleware);

//--- Mobile ---
// Productivity Records CRUD
router.post('/mobile', ProductivityController.createRecord);
router.put('/mobile/:id', ProductivityController.updateRecord);
router.delete('/mobile/:id', ProductivityController.deleteRecord);

// router.get('/mobile', ProductivityController.getRecords);
router.get('/mobile/:id', ProductivityController.getRecordById);

// Dashboard endpoint
router.post('/mobile/dashboard', ProductivityController.getSumProductivityDashboard);
router.get('/dashboard/facility-summary', ProductivityController.getFacilityDailySummaryController)
router.post('/dashboard/facility-by-category', ProductivityController.getFacilityDashboardByCategory)

// Department productivity statistics
router.get('/mobile/departments-stats/:department_id', ProductivityController.getDepartmentStats);

// Audit logs for productivity records
router.get('/mobile/:record_id/audit-logs', ProductivityController.getRecordAuditLogs);

//--- Backoffice ---
// Productivity Records CRUD
router.post('/partner', ProductivityController.createRecord);
router.put('/partner/:id', ProductivityController.updateRecord);
router.delete('/partner/:id', ProductivityController.deleteRecord);

// router.get('/mobile', ProductivityController.getRecords);
router.get('/partner/:id', ProductivityController.getRecordById);

// Dashboard endpoint
router.post('/partner/dashboard', ProductivityController.getSumProductivityDashboard);

// Department productivity statistics
router.get('/partner/departments-stats/:department_id', ProductivityController.getDepartmentStats);

// Audit logs for productivity records
router.get('/partner/:record_id/audit-logs', ProductivityController.getRecordAuditLogs);

// ========== Graphs Head Nurse ========== //
router.post('/graph/productivity', ProductivityController.getSumProductivityGraph);
router.post('/graph/patient', ProductivityController.getSumPatientGraph);
router.post('/graph/staff', ProductivityController.getSumStaffGraph);
router.post('/graph/used-bed', ProductivityController.getSumUsedBedGraph);

// ========== Graphs Regional Health Director&Permanent Secretary ========== //
// --- group by health region and province ---
router.post('/dashboard/health-regions', ProductivityController.getHealthRegionDashboard);
router.post('/dashboard/provinces', ProductivityController.getProvinceDashboard);
router.post('/dashboard/facility-categories', ProductivityController.getFacilityCategoryDashboard);

// --- group by category ---
router.post('/dashboard/categories', ProductivityController.getCategoryDashboard);
router.post('/dashboard/provinces-by-category', ProductivityController.getProvinceDashboardByCategory);
router.post('/dashboard/facilities-by-province-category', ProductivityController.getFacilityDashboardGroupCategoryByProvince);

export default router;
