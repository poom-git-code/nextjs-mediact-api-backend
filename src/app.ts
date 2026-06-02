import Koa from "koa";
import koaBody from "koa-body";
import cors from "@koa/cors";
import { errorHandler } from "./middlewares/error.middleware";
import { authenticate } from "./middlewares/auth.middleware";
import {
  timeoutMiddleware,
  defaultTimeoutConfig,
} from "./middlewares/timeout.middleware";
import { memoryMiddleware } from "./middlewares/memory.middleware";
import { autoAuditMiddleware } from "./middleware/autoAuditMiddleware";
import config from "./config/config";
import authRoutes from "./routes/authRoutes";
import { roleRoutes, publicRoleRoutes } from "./routes/roleRoutes";
import creditRoutes from "./routes/creditRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import facilityRoutes from "./routes/facilityRoutes";
import facilityAdminRoutes from "./routes/facilityAdminRoutes";
import facilityTypeRoutes from "./routes/facilityTypeRoutes";
import departmentTypeRoutes from "./routes/departmentTypeRoutes";
import userRoutes from "./routes/userRoutes";
import userRoleRoutes from "./routes/userRoleRoutes";
import userEmploymentRoutes from "./routes/userEmploymentRoutes";
import shiftTypeRoutes from "./routes/shiftTypeRoutes";
import scheduleMasterRoutes from "./routes/scheduleMasterRoutes";
import scheduleStatusRoutes from "./routes/scheduleStatusRoutes";
import scheduleShiftRoutes from "./routes/scheduleShiftRoutes";
import scheduleTemplateShiftRoutes from "./routes/scheduleTemplateShiftRoutes";
import shiftStatusRoutes from "./routes/shiftStatusRoutes";
import scheduleShiftSummaryRoutes from "./routes/scheduleShiftSummaryRoutes";
import addressTypeRoutes from "./routes/addressTypeRoutes";
import newsRoutes from "./routes/newsRoutes";
import eventRoutes from "./routes/eventRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import emailRouter from "./routes/emailRoutes";
import otpRouter from "./routes/otpRoutes";
import jobRoutes from "./routes/jobRoutes";
import jobTypeRoutes from "./routes/jobTypeRoutes";
import adsRoutes from "./routes/adsRoutes";
import addressRoutes from "./routes/addressRoutes";
import educationDegreesRoutes from "./routes/educationDegreesRoutes";
import educationRoutes from "./routes/educationRoutes";
import contentCategoryRoutes from "./routes/contentCategoryRoutes";
import categoryMasterRoutes from "./routes/CategoryMasterRoutes";
import appRoutes from "./routes/appVersionRoutes";
import educationInstitutionsRoutes from "./routes/educationInstitutionsRoutes";
import genderRoutes from "./routes/genderRoutes";
import provinceRoutes from "./routes/provinceRoutes";
import districtRoutes from "./routes/districtRoutes";
import subdistrictRoutes from "./routes/subdistrictRoutes";
import certificationRoutes from "./routes/certificationRoutes";
import institutionRoutes from "./routes/institutionRoutes";
import userCertificationRoutes from "./routes/userCertificationRoutes";
import userDeviceRoutes from "./routes/userDeviceRoutes";
import notificationsRoutes from "./routes/notificationsRoutes";
import notificationTypesRoutes from "./routes/notificationTypesRoutes";
import adClicksRoutes from "./routes/adClicksRoutes";
import adImpressionsRoutes from "./routes/adImpressionsRoutes";
import adMediaRoutes from "./routes/adMediaRoutes";
import adPartnerRoutes from "./routes/adPartnerRoutes";
import adTargetsRoutes from "./routes/adTargetsRoutes";
import adTypeRoutes from "./routes/adTypeRoutes";
import creditLogsRoutes from "./routes/creditLogsRoutes";
import partnertypeRoutes from "./routes/partnerTypeRoutes";
import userStatusRoutes from "./routes/userStatusRoutes";
import masterCountryRoutes from "./routes/masterCountryRoutes";
import jobStatusRoutes from "./routes/jobStatusRoutes";
import jobApplyRoutes from "./routes/jobApplyRoutes";
import jobCertificationRoutes from "./routes/jobCertificationRoutes";
import dayOffRoutes from "./routes/dayOffRoutes";
import leaveTypeRoutes from "./routes/leaveTypeRoutes";
import leaveRequestRoutes from "./routes/leaveRequestRoutes";
import leaveLimitsRoutes from "./routes/leaveLimitsRoutes";
import swapRequestRoutes from "./routes/swapRequestRoutes";
import partnerAddressRoutes from "./routes/partnerAddressRoutes";
import partnerStatusRoutes from "./routes/partnerStatusRoutes";
import partnerReferenceFileRoutes from "./routes/partnerReferenceFilesRoutes";
import partnerSubscriptionRoutes from "./routes/partnerSubscriptionRoutes";
import boothEventRoutes from "./routes/boothEventRoutes";
import boothEventListRoutes from "./routes/boothEventListRoutes";
import eventRewardsRoutes from "./routes/eventRewardsRoutes";
import userEventStampsRoutes from "./routes/userEventStampsRoutes";
import userProfileCompletenessRoutes from "./routes/userProfileCompletenessRoute";
import notificationBoothEventsRoutes from "./routes/notificationBoothEventsRoutes";
import notificationRecipientEventsRoutes from "./routes/notificationRecipientEventsRoutes";
import userExperienceRoutes from "./routes/userExperienceRoutes";
import checkInRoutes from "./routes/checkInRoutes";
import bonusDaysRoutes from "./routes/bonusDaysRoutes";
import checkInRewardRoutes from "./routes/checkInRewardRoutes";
import creditRequestRoutes from "./routes/creditRequestRoutes";
import creditApprovalLogRoutes from "./routes/creditApprovalLogRoutes";
import approverRoutes from "./routes/approverRoutes";
import departmentSupervisorRoutes from "./routes/departmentSupervisorRoutes";
import departmentOperatingHoursRoutes from "./routes/departmentOperatingHoursRoutes";
import dutyTypeRoutes from "./routes/dutyTypeRoutes";
import userDutyRoutes from "./routes/userDutyRoutes";
import exampleLanguageRoutes from "./routes/exampleLanguageRoutes";
import checkinRewardTypeRoutes from "./routes/checkinRewardTypeRoutes";
import facilityHolidayRoutes from "./routes/facilityHolidayRoutes";
import medicalStaffRoutes from "./routes/medicalStaffRoutes";
import ShiftCommentRoute from "./routes/shiftCommentsRoutes";
import luckyColorRoutes from "./routes/luckyColorRoutes";
import userGroupTagRoutes from "./routes/userGroupTagRoutes";
import ScheduleShiftLogsRoutes from "./routes/scheduleShiftLogsRoutes";
import workAreasRoutes from "./routes/workAreasRoutes";
import autoUnsubscribeRoutes from "./routes/autoUnsubscribeRoutes";
import eventCreditTypeRoute from "./routes/eventCreditTypeRoutes";
import productivityRoutes from "./routes/productivityRoutes";
import healthRoutes from "./routes/healthRoutes";
import healthRegionsRoutes from "./routes/HealthRegionsRoutes";
import DocumentTypeRoutes from "./routes/documentTypeRoutes";
import DocumentSubTypesRoutes from "./routes/documentSubTypesRoutes";
import UserDocumentRoutes from "./routes/userDocumentRoutes";
import SubCategoryMasterRoutes from "./routes/subCategoryMasterRoutes";
import ApplicantReviewRoutes from "./routes/applicantReviewRoutes";
import {
  mobileBrandsRoutes,
  backofficeBrandsRoutes,
} from "./routes/brandsRoutes";

import departmentCertificationRoutes from "./routes/departmentCertificationRoutes";

import userInteractionContentRouters from "./routes/userInteractionContentRoutes";
import userNotificationPreferenceRoutes from "./routes/userNotificationPreferenceRoutes";

import requestShiftRoutes from "./routes/requestShiftRouter";
import giveShiftRequestRoutes from "./routes/giveShiftRequestRoutes";

import * as fs from "fs";
import * as path from "path";
const app = new Koa();

// กำหนด path ไปยังโฟลเดอร์ temp ที่ root ของโปรเจกต์
// (__dirname จะชี้ไปที่โฟลเดอร์ src, '..' คือการถอยกลับไปที่ root)
const tempUploadDir = path.join(__dirname, "..", "temp");

// ตรวจสอบว่าโฟลเดอร์ temp มีอยู่หรือไม่
if (!fs.existsSync(tempUploadDir)) {
  // ถ้าไม่มี ให้สร้างโฟลเดอร์
  fs.mkdirSync(tempUploadDir);
  console.log(`Created temporary upload directory at: ${tempUploadDir}`);
}

// Memory monitoring middleware
app.use(memoryMiddleware);

// Global timeout middleware with custom configuration
app.use(
  timeoutMiddleware({
    timeout: 300000, // 5 minutes default
    excludePaths: ["/health", "/ping", "/metrics", "/api/upload"],
    customTimeouts: {
      "/api/upload": 1800000, // 3 minutes for file uploads (increased)
      "/api/reports": 900000, // 1.5 minutes for reports (increased)
      "/api/export": 1200000, // 2 minutes for exports (increased)
      "/api/import": 1800000, // 3 minutes for imports (increased)
      "/api/productivity": 600000, // 1 minute for productivity calculations (increased)
      "/api/schedule": 600000, // 1 minute for schedule operations (increased)
      "/api/job-apply": 900000, // 1.5 minutes for job applications (increased)
      "/api/departments": 450000, // 45 seconds for department operations
      "/api/users": 450000, // 45 seconds for user operations
      "/api/shifts": 600000, // 1 minute for shift operations
      "/api/notifications": 300000, // 30 seconds for notifications
    },
  })
);

// Test middleware to see if requests are coming in
app.use(async (ctx, next) => {
  console.log("🚨 REQUEST RECEIVED:", ctx.method, ctx.url);
  await next();
});

app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  koaBody({
    jsonLimit: "10mb",
    textLimit: "10mb",
    multipart: true,
    formidable: {
      uploadDir: tempUploadDir,
      maxFileSize: 20 * 1024 * 1024, // 20MB
      keepExtensions: true,
    },
  })
);
app.use(errorHandler);

// Add global request logging
app.use(async (ctx, next) => {
  console.log(`=== REQUEST: ${ctx.method} ${ctx.url} ===`);
  console.log("Headers:", ctx.headers);
  console.log("Body:", ctx.request.body);
  await next();
});

// เพิ่ม Auto Audit Middleware - เก็บ log ทุก API request อัตโนมัติ
app.use(
  autoAuditMiddleware({
    enabled: true,
    excludePaths: ["/health", "/ping", "/metrics"],
    excludeMethods: ["OPTIONS"],
    trackSelectQueries: true, // เปิดให้เก็บ GET requests ด้วย
    maxLogSize: 10000,
  })
);

// เส้นทางที่ไม่ต้องการการตรวจสอบสิทธิ์
app.use(healthRoutes.routes()).use(healthRoutes.allowedMethods()); // Health check routes (no auth)
app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(publicRoleRoutes.routes()).use(publicRoleRoutes.allowedMethods());
// app.use(adsRoutes.routes()).use(adsRoutes.allowedMethods());
app.use(provinceRoutes.routes()).use(provinceRoutes.allowedMethods());
app.use(districtRoutes.routes()).use(districtRoutes.allowedMethods());
app.use(subdistrictRoutes.routes()).use(subdistrictRoutes.allowedMethods());
app.use(institutionRoutes.routes()).use(institutionRoutes.allowedMethods());
app.use(healthRegionsRoutes.routes()).use(healthRegionsRoutes.allowedMethods()); // Health regions (no auth)
app
  .use(exampleLanguageRoutes.routes())
  .use(exampleLanguageRoutes.allowedMethods()); // Example language routes
app.use(appRoutes.routes()).use(appRoutes.allowedMethods());

// Middleware การตรวจสอบสิทธิ์
app.use(authenticate);

// เส้นทางที่ต้องการการตรวจสอบสิทธิ์
app.use(certificationRoutes.routes()).use(certificationRoutes.allowedMethods());
app.use(roleRoutes.routes()).use(roleRoutes.allowedMethods());
app.use(departmentRoutes.routes()).use(departmentRoutes.allowedMethods());
app.use(creditRoutes.routes()).use(creditRoutes.allowedMethods());
app.use(facilityRoutes.routes()).use(facilityRoutes.allowedMethods());
app.use(facilityAdminRoutes.routes()).use(facilityAdminRoutes.allowedMethods());
app.use(facilityTypeRoutes.routes()).use(facilityTypeRoutes.allowedMethods());
app
  .use(departmentTypeRoutes.routes())
  .use(departmentTypeRoutes.allowedMethods());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(userRoleRoutes.routes()).use(userRoleRoutes.allowedMethods());
app.use(userStatusRoutes.routes()).use(userStatusRoutes.allowedMethods());
app
  .use(userEmploymentRoutes.routes())
  .use(userEmploymentRoutes.allowedMethods());
app.use(shiftTypeRoutes.routes()).use(shiftTypeRoutes.allowedMethods());
app
  .use(scheduleMasterRoutes.routes())
  .use(scheduleMasterRoutes.allowedMethods());
app
  .use(scheduleStatusRoutes.routes())
  .use(scheduleStatusRoutes.allowedMethods());
app.use(scheduleShiftRoutes.routes()).use(scheduleShiftRoutes.allowedMethods());
app
  .use(scheduleTemplateShiftRoutes.routes())
  .use(scheduleTemplateShiftRoutes.allowedMethods());
app.use(shiftStatusRoutes.routes()).use(shiftStatusRoutes.allowedMethods());
app
  .use(scheduleShiftSummaryRoutes.routes())
  .use(scheduleShiftSummaryRoutes.allowedMethods());
app.use(addressTypeRoutes.routes()).use(addressTypeRoutes.allowedMethods());
app.use(addressRoutes.routes()).use(addressRoutes.allowedMethods());
app
  .use(educationDegreesRoutes.routes())
  .use(educationDegreesRoutes.allowedMethods());
app
  .use(educationInstitutionsRoutes.routes())
  .use(educationInstitutionsRoutes.allowedMethods());
app.use(educationRoutes.routes()).use(educationRoutes.allowedMethods());
app.use(newsRoutes.routes()).use(newsRoutes.allowedMethods());
app.use(eventRoutes.routes()).use(eventRoutes.allowedMethods());
app.use(uploadRoutes.routes()).use(uploadRoutes.allowedMethods());
app.use(emailRouter.routes()).use(emailRouter.allowedMethods());
app.use(otpRouter.routes()).use(otpRouter.allowedMethods());
app.use(jobRoutes.routes()).use(jobRoutes.allowedMethods());
app
  .use(contentCategoryRoutes.routes())
  .use(contentCategoryRoutes.allowedMethods());
app
  .use(categoryMasterRoutes.routes())
  .use(categoryMasterRoutes.allowedMethods());
app.use(genderRoutes.routes()).use(genderRoutes.allowedMethods());
app
  .use(userCertificationRoutes.routes())
  .use(userCertificationRoutes.allowedMethods());
app.use(userDeviceRoutes.routes()).use(userDeviceRoutes.allowedMethods());
app.use(notificationsRoutes.routes()).use(notificationsRoutes.allowedMethods());
app
  .use(notificationTypesRoutes.routes())
  .use(notificationTypesRoutes.allowedMethods());
app.use(adClicksRoutes.routes()).use(adClicksRoutes.allowedMethods());
app.use(adImpressionsRoutes.routes()).use(adImpressionsRoutes.allowedMethods());
app.use(adMediaRoutes.routes()).use(adMediaRoutes.allowedMethods());
app.use(adPartnerRoutes.routes()).use(adPartnerRoutes.allowedMethods());
app.use(adPartnerRoutes.routes()).use(adPartnerRoutes.allowedMethods());
app.use(adsRoutes.routes()).use(adsRoutes.allowedMethods());
app.use(adTargetsRoutes.routes()).use(adTargetsRoutes.allowedMethods());
app.use(adTypeRoutes.routes()).use(adTypeRoutes.allowedMethods());
app.use(creditLogsRoutes.routes()).use(creditLogsRoutes.allowedMethods());
app.use(partnertypeRoutes.routes()).use(partnertypeRoutes.allowedMethods());
app.use(masterCountryRoutes.routes()).use(masterCountryRoutes.allowedMethods());
// app.use(jobRoutes.routes()).use(jobRoutes.allowedMethods());
app.use(jobTypeRoutes.routes()).use(jobTypeRoutes.allowedMethods());
app.use(jobStatusRoutes.routes()).use(jobStatusRoutes.allowedMethods());
app.use(jobApplyRoutes.routes()).use(jobApplyRoutes.allowedMethods());
app
  .use(jobCertificationRoutes.routes())
  .use(jobCertificationRoutes.allowedMethods());
app.use(dayOffRoutes.routes()).use(dayOffRoutes.allowedMethods());
app.use(leaveTypeRoutes.routes()).use(leaveTypeRoutes.allowedMethods());
app.use(leaveRequestRoutes.routes()).use(leaveRequestRoutes.allowedMethods());
app.use(leaveLimitsRoutes.routes()).use(leaveLimitsRoutes.allowedMethods());
app.use(swapRequestRoutes.routes()).use(swapRequestRoutes.allowedMethods());
app
  .use(partnerAddressRoutes.routes())
  .use(partnerAddressRoutes.allowedMethods());
app.use(partnerStatusRoutes.routes()).use(partnerStatusRoutes.allowedMethods());
app
  .use(partnerReferenceFileRoutes.routes())
  .use(partnerReferenceFileRoutes.allowedMethods());
app
  .use(partnerSubscriptionRoutes.routes())
  .use(partnerSubscriptionRoutes.allowedMethods());

app.use(boothEventRoutes.routes()).use(boothEventRoutes.allowedMethods());
app
  .use(boothEventListRoutes.routes())
  .use(boothEventListRoutes.allowedMethods());
app.use(eventRewardsRoutes.routes()).use(eventRewardsRoutes.allowedMethods());
app
  .use(userEventStampsRoutes.routes())
  .use(userEventStampsRoutes.allowedMethods());
app
  .use(userProfileCompletenessRoutes.routes())
  .use(userProfileCompletenessRoutes.allowedMethods());
app
  .use(notificationBoothEventsRoutes.routes())
  .use(notificationBoothEventsRoutes.allowedMethods());
app
  .use(notificationRecipientEventsRoutes.routes())
  .use(notificationRecipientEventsRoutes.allowedMethods());
app
  .use(userExperienceRoutes.routes())
  .use(userExperienceRoutes.allowedMethods());
app.use(checkInRoutes.routes()).use(checkInRoutes.allowedMethods());
app.use(bonusDaysRoutes.routes()).use(bonusDaysRoutes.allowedMethods());
app.use(checkInRewardRoutes.routes()).use(checkInRewardRoutes.allowedMethods());
app.use(creditRequestRoutes.routes()).use(creditRequestRoutes.allowedMethods());
app
  .use(creditApprovalLogRoutes.routes())
  .use(creditApprovalLogRoutes.allowedMethods());
app.use(approverRoutes.routes()).use(approverRoutes.allowedMethods());
app
  .use(departmentSupervisorRoutes.routes())
  .use(departmentSupervisorRoutes.allowedMethods());
app
  .use(departmentOperatingHoursRoutes.routes())
  .use(departmentOperatingHoursRoutes.allowedMethods());
app.use(dutyTypeRoutes.routes()).use(dutyTypeRoutes.allowedMethods());
app.use(userDutyRoutes.routes()).use(userDutyRoutes.allowedMethods());
app
  .use(checkinRewardTypeRoutes.routes())
  .use(checkinRewardTypeRoutes.allowedMethods());
app
  .use(facilityHolidayRoutes.routes())
  .use(facilityHolidayRoutes.allowedMethods());
app.use(medicalStaffRoutes.routes()).use(medicalStaffRoutes.allowedMethods());
app.use(ShiftCommentRoute.routes()).use(ShiftCommentRoute.allowedMethods());
app.use(luckyColorRoutes.routes()).use(luckyColorRoutes.allowedMethods());
app.use(userGroupTagRoutes.routes()).use(userGroupTagRoutes.allowedMethods());
app
  .use(ScheduleShiftLogsRoutes.routes())
  .use(ScheduleShiftLogsRoutes.allowedMethods());
app.use(workAreasRoutes.routes()).use(workAreasRoutes.allowedMethods());
app
  .use(autoUnsubscribeRoutes.routes())
  .use(autoUnsubscribeRoutes.allowedMethods());
app
  .use(eventCreditTypeRoute.routes())
  .use(eventCreditTypeRoute.allowedMethods());
app.use(productivityRoutes.routes()).use(productivityRoutes.allowedMethods());
app.use(DocumentTypeRoutes.routes()).use(DocumentTypeRoutes.allowedMethods());
app
  .use(DocumentSubTypesRoutes.routes())
  .use(DocumentSubTypesRoutes.allowedMethods());
app.use(UserDocumentRoutes.routes()).use(UserDocumentRoutes.allowedMethods());
app
  .use(SubCategoryMasterRoutes.routes())
  .use(SubCategoryMasterRoutes.allowedMethods());
app.use(userInteractionContentRouters.routes());
app
  .use(ApplicantReviewRoutes.routes())
  .use(ApplicantReviewRoutes.allowedMethods());
app
  .use(departmentCertificationRoutes.routes())
  .use(departmentCertificationRoutes.allowedMethods());
app
  .use(userNotificationPreferenceRoutes.routes())
  .use(userNotificationPreferenceRoutes.allowedMethods());
app.use(mobileBrandsRoutes.routes()).use(mobileBrandsRoutes.allowedMethods());
app
  .use(backofficeBrandsRoutes.routes())
  .use(backofficeBrandsRoutes.allowedMethods());

app.use(requestShiftRoutes.routes()).use(requestShiftRoutes.allowedMethods());
app
  .use(giveShiftRequestRoutes.routes())
  .use(giveShiftRequestRoutes.allowedMethods());

export default app;
