// associations.ts
// This file sets up hasMany associations after all models are loaded
// to avoid circular dependency issues

import AdsModel from "./AdsModel";
import AdMediaModel from "./AdMediaModel";
import AddressModel from "./AddressesModel";
import DepartmentModel from "./DepartmentModel";
import DepartmentOperatingHoursModel from "./DepartmentOperatingHoursModel";
import DepartmentSupervisorModel from "./DepartmentSupervisorModel";
import FacilityModel from "./FacilitiesModel";
import FacilityAdminModel from "./FacilityAdminModel";
import FacilityLeaveLimitsModel from "./LeaveLimitsModel";
import ShiftTypeModel from "./ShiftTypesModel";
import UserModel from "./UserModel";
import UserEmploymentModel from "./UserEmploymentsModel";
import LeaveRequestModel from "./LeaveRequestModel";
import LeaveTypeModel from "./LeaveTypeModel";
import SwapRequestModel from "./SwapRequestModel";
import ScheduleShiftModel from "./ScheduleShiftsModel";
import ScheduleMasterModel from "./ScheduleMasterModel";
import ScheduleShiftSummaryModel from "./ScheduleShiftSummaryModel";
import CheckinReward from "./checkinRewardsModel";
import CheckinRewardType from "./checkinRewardTypesModel";
import CheckinRewardRedemption from "./checkinRewardRedemptionsModel";
import Brands from "./BrandsModel";
import DayOffModel from "./DayOffModel";
import ShiftCommentsModel from "./ShiftCommentsModel";
import JobModel from "./JobsModel";
import JobApplyModel from "./JobApplyModel";
import UserRoleModel from "./UserRolesModel";
import { setupShiftTypeAssociations } from "./shiftTypeAssociations";
import { setupUserGroupTagAssociations } from "./userGroupTagAssociations";
import WorkTypeModel from "./WorkTypeModel";
import ScheduleShiftLogsModel from "./ScheduleShiftLogsModel";
import AuditLogModel from "./AuditLogModel";
import EventModel from "./EventsModel";
import EventCreditModel from "./EventCreditModel";
import EventCreditTypeModel from "./EventCreditTypeModel";
import ProductivityRecordModel from "./ProductivityModels";
import { HealthRegionsModel } from "./HealthRegionsModel";
import { HealthRegionProvincesModel } from "./HealthRegionProvincesModel";
import ProvinceModel from "./ProvinceModel";
import UserDocumentModel from "./UserDocumentModel";
import DocumentTypeModel from "./DocumentTypeModel";
import DocumentSubTypeModel from "./DocumentSubTypesModel";
import RoleDocumentModel from "./RoleDocumentsModel";
import RoleModel from "./RolesModel";
import UserCertificationModel from "./UserCertificationModel";
import DepartmentTypeModel from "./DepartmentTypesModel";
import DepartMentCategoryModel from "./DepartMentCategoryModel";
import CertificationModel from "./CertificationModel";
import DepartmentCertificationModel from "./DepartmentCertificationModel";
import WorkAreasModel from "./WorkAreasModel";
import UserExperienceModel from "./UserExperienceModel";
import CategoryMasterModel from "./CategoryMasterModel";
import SubCategoryMasterModel from "./SubCategoryMasterModel";
import ApplicantReviewModel from "./ApplicantReviewModel";
import { UserNotificationPreferenceModel } from "./UserNotificationPreferenceModel";

// Set up associations
export const setupAssociations = () => {
  // RewardType -> Reward
  CheckinRewardType.hasMany(CheckinReward, {
    foreignKey: "type_id",
    as: "Rewards",
  });
  CheckinReward.belongsTo(CheckinRewardType, {
    foreignKey: "type_id",
    as: "RewardType",
  });

  // Brand -> Reward
  Brands.hasMany(CheckinReward, {
    foreignKey: "brand_id",
    as: "Rewards",
  });
  CheckinReward.belongsTo(Brands, {
    foreignKey: "brand_id",
    as: "Brand",
  });

  // Reward -> Redemption
  CheckinReward.hasMany(CheckinRewardRedemption, {
    foreignKey: "reward_id",
    as: "Redemptions",
    onDelete: "SET NULL",
  });
  CheckinRewardRedemption.belongsTo(CheckinReward, {
    foreignKey: "reward_id",
    as: "Reward",
    onDelete: "SET NULL",
  });

  // Ads associations
  AdMediaModel.belongsTo(AdsModel, {
    foreignKey: "ad_id",
    as: "ad",
    targetKey: "id",
  });

  AdsModel.hasMany(AdMediaModel, {
    foreignKey: "ad_id",
    as: "ad_media",
    sourceKey: "id",
  });

  // Department belongsTo User associations for created_by and updated_by
  DepartmentModel.belongsTo(UserModel, {
    as: "created_by_user",
    foreignKey: "created_by",
    targetKey: "id",
  });
  DepartmentModel.belongsTo(UserModel, {
    as: "updated_by_user",
    foreignKey: "updated_by",
    targetKey: "id",
  });

  // Facility belongsTo User associations for created_by and updated_by
  FacilityModel.belongsTo(UserModel, {
    as: "created_by_user",
    foreignKey: "created_by",
    targetKey: "id",
  });
  FacilityModel.belongsTo(UserModel, {
    as: "updated_by_user",
    foreignKey: "updated_by",
    targetKey: "id",
  });

  // User belongsTo User associations for created_by and updated_by (self-referencing)
  UserModel.belongsTo(UserModel, {
    as: "created_by_user",
    foreignKey: "created_by",
    targetKey: "id",
  });
  UserModel.belongsTo(UserModel, {
    as: "updated_by_user",
    foreignKey: "updated_by",
    targetKey: "id",
  });

  // User hasMany Addresses
  UserModel.hasMany(AddressModel, {
    as: "user_addresses",
    foreignKey: "reference_id",
    sourceKey: "id",
  });

  // Address belongsTo User
  AddressModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "reference_id",
    targetKey: "id",
  });

  // Department hasMany associations
  DepartmentModel.hasMany(DepartmentOperatingHoursModel, {
    as: "department_operating_hours",
    foreignKey: "department_id",
  });

  DepartmentModel.hasMany(DepartmentSupervisorModel, {
    as: "department_supervisors",
    foreignKey: "department_id",
  });

  DepartmentModel.hasMany(ShiftTypeModel, {
    as: "shift_types",
    foreignKey: "department_id",
  });

  // Department hasMany UserEmployments (members)
  DepartmentModel.hasMany(UserEmploymentModel, {
    as: "department_members",
    foreignKey: "department_id",
  });

  // UserEmployment belongsTo User
  UserEmploymentModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "user_id",
    targetKey: "id",
  });

  // LeaveRequest associations
  LeaveRequestModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "user_id",
    targetKey: "id",
  });

  LeaveRequestModel.belongsTo(LeaveTypeModel, {
    as: "leave_type",
    foreignKey: "leave_type_id",
    targetKey: "id",
  });

  // Approve user association
  LeaveRequestModel.belongsTo(UserModel, {
    as: "approve_user",
    foreignKey: "approve_user_id",
    targetKey: "id",
  });

  // FacilityLeaveLimits associations
  FacilityLeaveLimitsModel.belongsTo(FacilityModel, {
    as: "facility",
    foreignKey: "facility_id",
    targetKey: "id",
  });

  FacilityLeaveLimitsModel.belongsTo(LeaveTypeModel, {
    as: "leave_type",
    foreignKey: "leave_type_id",
    targetKey: "id",
  });

  // Optional: User associations for created_by and updated_by
  FacilityLeaveLimitsModel.belongsTo(UserModel, {
    as: "created_by_user",
    foreignKey: "created_by",
    targetKey: "id",
  });

  FacilityLeaveLimitsModel.belongsTo(UserModel, {
    as: "updated_by_user",
    foreignKey: "updated_by",
    targetKey: "id",
  });

  // Reverse associations
  FacilityModel.hasMany(FacilityLeaveLimitsModel, {
    as: "leave_limits",
    foreignKey: "facility_id",
    sourceKey: "id",
  });

  LeaveTypeModel.hasMany(FacilityLeaveLimitsModel, {
    as: "facility_limits",
    foreignKey: "leave_type_id",
    sourceKey: "id",
  });

  // SwapRequest associations
  SwapRequestModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "user_id",
    targetKey: "id",
  });

  SwapRequestModel.belongsTo(ScheduleShiftModel, {
    as: "shift",
    foreignKey: "shift_id",
    targetKey: "id",
  });

  // Approve user association for SwapRequest
  SwapRequestModel.belongsTo(UserModel, {
    as: "approve_user",
    foreignKey: "approve_user_id",
    targetKey: "id",
  });

  // ScheduleShift associations
  ScheduleShiftModel.belongsTo(ShiftTypeModel, {
    as: "shift_type",
    foreignKey: "shift_type_id",
    targetKey: "id",
  });

  ScheduleShiftModel.belongsTo(UserModel, {
    as: "employee",
    foreignKey: "employee_id",
    targetKey: "id",
  });

  ScheduleShiftModel.belongsTo(UserModel, {
    as: "init_employee",
    foreignKey: "init_employee_id",
    targetKey: "id",
  });

  // FacilityAdmin associations
  FacilityAdminModel.belongsTo(FacilityModel, {
    as: "facility",
    foreignKey: "facility_id",
    targetKey: "id",
  });

  FacilityAdminModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "user_id",
    targetKey: "id",
  });

  // Facility hasMany FacilityAdmins
  FacilityModel.hasMany(FacilityAdminModel, {
    as: "facility_admins",
    foreignKey: "facility_id",
  });

  // User hasMany FacilityAdmins
  UserModel.hasMany(FacilityAdminModel, {
    as: "facility_admin_assignments",
    foreignKey: "user_id",
  });

  // DayOff associations
  // DayOff belongs to User (request_user)
  DayOffModel.belongsTo(UserModel, {
    as: "request_user",
    foreignKey: "request_user_id",
  });

  // DayOff belongs to User (assign_user)
  DayOffModel.belongsTo(UserModel, {
    as: "assign_user",
    foreignKey: "assign_user_id",
  });

  // DayOff belongs to User (approve_user)
  DayOffModel.belongsTo(UserModel, {
    as: "approve_user",
    foreignKey: "approve_user_id",
  });

  // User has many DayOffs (as request_user)
  UserModel.hasMany(DayOffModel, {
    as: "requested_day_offs",
    foreignKey: "request_user_id",
  });

  // User has many DayOffs (as assign_user)
  UserModel.hasMany(DayOffModel, {
    as: "assigned_day_offs",
    foreignKey: "assign_user_id",
  });

  // User has many DayOffs (as approve_user)
  UserModel.hasMany(DayOffModel, {
    as: "approved_day_offs",
    foreignKey: "approve_user_id",
  });

  // ScheduleMaster associations
  // ScheduleMaster belongs to Department
  ScheduleMasterModel.belongsTo(DepartmentModel, {
    as: "department",
    foreignKey: "department_id",
  });

  // ScheduleMaster belongs to Facility
  ScheduleMasterModel.belongsTo(FacilityModel, {
    as: "facility",
    foreignKey: "facility_id",
  });

  // ScheduleMaster belongs to User (created_by)
  ScheduleMasterModel.belongsTo(UserModel, {
    as: "created_by_user",
    foreignKey: "created_by",
  });

  // ScheduleMaster belongs to User (updated_by)
  ScheduleMasterModel.belongsTo(UserModel, {
    as: "updated_by_user",
    foreignKey: "updated_by",
  });

  // ScheduleMaster has many ScheduleShifts
  ScheduleMasterModel.hasMany(ScheduleShiftModel, {
    as: "schedule_shifts",
    foreignKey: "schedule_master_id",
  });

  // ScheduleMaster has many ScheduleShiftSummaries
  ScheduleMasterModel.hasMany(ScheduleShiftSummaryModel, {
    as: "schedule_shift_summaries",
    foreignKey: "schedule_master_id",
  });

  // ScheduleShift belongs to ScheduleMaster
  ScheduleShiftModel.belongsTo(ScheduleMasterModel, {
    as: "schedule_master",
    foreignKey: "schedule_master_id",
  });

  // ScheduleShiftSummary belongs to ScheduleMaster
  ScheduleShiftSummaryModel.belongsTo(ScheduleMasterModel, {
    as: "schedule_master",
    foreignKey: "schedule_master_id",
  });

  // Department has many ScheduleMasters
  DepartmentModel.hasMany(ScheduleMasterModel, {
    as: "schedule_masters",
    foreignKey: "department_id",
  });

  // Facility has many ScheduleMasters
  FacilityModel.hasMany(ScheduleMasterModel, {
    as: "schedule_masters",
    foreignKey: "facility_id",
  });

  // SwapRequest has many ShiftComments
  SwapRequestModel.hasMany(ShiftCommentsModel, {
    as: "shift_comments",
    foreignKey: "swap_request_id",
    sourceKey: "id",
  });

  // ShiftComments belongs to SwapRequest
  ShiftCommentsModel.belongsTo(SwapRequestModel, {
    as: "swap_request",
    foreignKey: "swap_request_id",
    targetKey: "id",
  });

  UserModel.hasMany(UserRoleModel, {
    as: "user_role",
    foreignKey: "user_id",
    sourceKey: "id",
  });

  UserRoleModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "user_id",
  });

  // Job has many JobApplies
  JobModel.hasMany(JobApplyModel, {
    as: "job_applies",
    foreignKey: "job_id",
  });

  // WorkType has many ScheduleShiftLogs
  WorkTypeModel.hasMany(ScheduleShiftLogsModel, {
    foreignKey: "work_type_id",
    as: "schedule_shift_logs",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  // Set up shift type associations
  setupShiftTypeAssociations();

  // Set up user group tag associations
  setupUserGroupTagAssociations();

  // Set up audit log associations
  UserModel.hasMany(AuditLogModel, {
    foreignKey: "user_id",
    as: "auditLogs",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  AuditLogModel.belongsTo(UserModel, {
    foreignKey: "user_id",
    as: "user",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  EventModel.hasMany(EventCreditModel, {
    foreignKey: "event_id",
    as: "credits",
  });
  EventCreditModel.belongsTo(EventModel, {
    foreignKey: "event_id",
    as: "event",
  });

  EventCreditTypeModel.hasMany(EventCreditModel, {
    foreignKey: "credit_type_id",
    as: "eventCredits",
  });
  EventCreditModel.belongsTo(EventCreditTypeModel, {
    foreignKey: "credit_type_id",
    as: "creditType",
  });

  EventModel.belongsToMany(EventCreditTypeModel, {
    through: EventCreditModel,
    foreignKey: "event_id",
    otherKey: "credit_type_id",
    as: "creditTypes",
  });
  EventCreditTypeModel.belongsToMany(EventModel, {
    through: EventCreditModel,
    foreignKey: "credit_type_id",
    otherKey: "event_id",
    as: "events",
  });

  // ProductivityRecord
  ProductivityRecordModel.belongsTo(DepartmentModel, {
    as: "department",
    foreignKey: "department_id",
    targetKey: "id",
  });

  ProductivityRecordModel.belongsTo(ShiftTypeModel, {
    as: "shiftType",
    foreignKey: "shift_type_id",
    targetKey: "id",
  });

  HealthRegionsModel.hasMany(HealthRegionProvincesModel, {
    as: "provinces",
    foreignKey: "health_region_id",
    sourceKey: "id",
  });

  HealthRegionProvincesModel.belongsTo(HealthRegionsModel, {
    as: "region",
    foreignKey: "health_region_id",
    targetKey: "id",
  });

  HealthRegionProvincesModel.belongsTo(ProvinceModel, {
    as: "province",
    foreignKey: "province_geocode",
    targetKey: "province_code",
  });

  UserModel.hasMany(DepartmentSupervisorModel, {
    as: "supervisor_roles",
    foreignKey: "user_id",
  });

  // UserDocument associations
  UserModel.hasMany(UserDocumentModel, {
    as: "user_documents",
    foreignKey: "user_id",
    sourceKey: "id",
  });

  UserDocumentModel.belongsTo(UserModel, {
    as: "document_owner",
    foreignKey: "user_id",
    targetKey: "id",
  });

  // DocumentType associations
  UserDocumentModel.belongsTo(DocumentTypeModel, {
    as: "documentType",
    foreignKey: "document_type_id",
    targetKey: "id",
  });

  DocumentTypeModel.hasMany(UserDocumentModel, {
    as: "user_documents",
    foreignKey: "document_type_id",
    sourceKey: "id",
  });

  // DocumentSubType associations  
  UserDocumentModel.belongsTo(DocumentSubTypeModel, {
    as: "documentSubType",
    foreignKey: "document_sub_type_id",
    targetKey: "id",
  });

  DocumentSubTypeModel.hasMany(UserDocumentModel, {
    as: "user_documents",
    foreignKey: "document_sub_type_id",
    sourceKey: "id",
  });

  // UserCertification - UserDocument associations
  UserCertificationModel.belongsTo(UserDocumentModel, {
    as: "document",
    foreignKey: "document_id",
    targetKey: "id",
  });

  UserDocumentModel.hasMany(UserCertificationModel, {
    as: "certifications",
    foreignKey: "document_id",
    sourceKey: "id",
  });

  // Associations for DepartmentModel
  DepartmentModel.belongsTo(FacilityModel, { as: 'facility', foreignKey: 'facility_id' });
  DepartmentModel.belongsTo(DepartmentTypeModel, { as: 'type', foreignKey: 'type_id' });
  DepartmentModel.belongsTo(DepartmentModel, { as: 'parent_department', foreignKey: 'parent_department_id' });
  DepartmentModel.hasMany(DepartMentCategoryModel, {
    foreignKey: 'department_id',
    as: 'department_categories',
  });

  // Associations for CertificationModel
  CertificationModel.belongsTo(RoleModel, {
    as: 'role',
    foreignKey: 'role_id',
    targetKey: 'id',
  });

  // Associations for DepartmentCertificationModel (Junction Table)
  DepartmentCertificationModel.belongsTo(DepartmentModel, {
    as: 'department',
    foreignKey: 'department_id',
  });
  DepartmentCertificationModel.belongsTo(CertificationModel, {
    as: 'certification',
    foreignKey: 'certification_id',
  });
  DepartmentCertificationModel.belongsTo(UserModel, {
    as: 'created_by_user',
    foreignKey: 'created_by',
  });

  // Department <-> Certification
  DepartmentModel.belongsToMany(CertificationModel, {
    through: DepartmentCertificationModel,
    foreignKey: 'department_id',
    otherKey: 'certification_id',
    as: 'certifications',
  });

  CertificationModel.belongsToMany(DepartmentModel, {
    through: DepartmentCertificationModel,
    foreignKey: 'certification_id',
    otherKey: 'department_id',
    as: 'departments',
  });

  DepartmentModel.hasMany(DepartmentCertificationModel, {
    as: 'department_certifications',
    foreignKey: 'department_id',
  });

  UserModel.hasMany(WorkAreasModel, {
    as: "work_areas",
    foreignKey: "user_id",
    sourceKey: "id",
  });

  WorkAreasModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "user_id",
    targetKey: "id",
  });

  UserModel.hasMany(CheckinRewardRedemption, {
    foreignKey: "user_id",
    as: "Redemptions",
  });

  CheckinRewardRedemption.belongsTo(UserModel, {
    foreignKey: "user_id",
    as: "User",
  });

  RoleModel.belongsToMany(DocumentSubTypeModel, {
    through: RoleDocumentModel,
    as: "required_document_sub_types",
    foreignKey: "role_id",
    otherKey: "document_sub_type_id",
  });

  DocumentSubTypeModel.belongsToMany(RoleModel, {
    through: RoleDocumentModel,
    as: "roles_requiring_this_sub_type",
    foreignKey: "document_sub_type_id",
    otherKey: "role_id",
  });

  RoleDocumentModel.belongsTo(RoleModel, {
    as: "role",
    foreignKey: "role_id",
    targetKey: "id",
  });

  RoleDocumentModel.belongsTo(DocumentSubTypeModel, {
    as: "document_sub_type",
    foreignKey: "document_sub_type_id",
    targetKey: "id",
  });

  UserModel.hasMany(UserCertificationModel, {
    as: "user_certifications",
    foreignKey: "user_id",
    sourceKey: "id",
  });

  UserExperienceModel.belongsTo(CategoryMasterModel, {
    as: "category_master",
    foreignKey: "category_master_id",
    targetKey: "id",
  });

  UserExperienceModel.belongsTo(SubCategoryMasterModel, {
    as: "sub_category_master",
    foreignKey: "sub_category_master_id",
    targetKey: "id",
  });

  // รีวิวนี้เป็นของ Application (JobApply) ใด
  ApplicantReviewModel.belongsTo(JobApplyModel, {
    as: "application",
    foreignKey: "job_apply_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // รีวิวนี้ถูกสร้างโดย User (Reviewer) ใด
  ApplicantReviewModel.belongsTo(UserModel, {
    as: "reviewer",
    foreignKey: "reviewer_id",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });

  JobApplyModel.hasOne(ApplicantReviewModel, { as: "review", foreignKey: "job_apply_id" });

  UserModel.hasMany(JobApplyModel, {
    as: "job_applies",
    foreignKey: "user_id",
  });

  UserModel.hasMany(UserNotificationPreferenceModel, {
    as: 'notification_preferences',
    foreignKey: 'user_id',
    sourceKey: 'id',
  });

  console.log("Model associations set up successfully");
};
