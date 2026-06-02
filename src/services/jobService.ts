import JobModel from "../models/JobsModel";
import JobApplyModel from "../models/JobApplyModel";
import { Op } from "sequelize";
import * as PushNotificationService from "../services/pushNotificationService";
import { getAllPushTokens } from "../repositories/pushTokenRepository";
import { Context } from "koa";
import * as NotificationsService from "../services/notificationsService";
import UserDeviceModel from "../models/UserDeviceModel";
import JobStatusModel from "../models/JobStatusModel";
import DepartmentModel from "../models/DepartmentModel";
import FacilityModel from "../models/FacilitiesModel";
import RoleModel from "../models/RolesModel";
import UserModel from "../models/UserModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import UserRoleModel from "../models/UserRolesModel";
import ScheduleShiftModel from "../models/ScheduleShiftsModel";
import NotificationsModel from "../models/NotificationsModel";
import WorkAreasModel from "../models/WorkAreasModel";
import { format, parseISO } from 'date-fns';
import { getUserAttributes, getBasicUserAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import { toLocalISOString } from "../utils/dateFormatter";
import UserExperienceModel from "../models/UserExperienceModel";
import UserCertificationModel from "../models/UserCertificationModel";
import CategoryMasterModel from "../models/CategoryMasterModel";
import SubCategoryMasterModel from "../models/SubCategoryMasterModel";
import CertificationModel from "../models/CertificationModel";
import DepartMentCategoryModel from "../models/DepartMentCategoryModel";
import DepartmentCertificationModel from "../models/DepartmentCertificationModel";
import GenderModel from "../models/GenderModel";
import InstitutionModel from "../models/InstitutionModel";
import ApplicantReviewModel from "../models/ApplicantReviewModel";
import { sequelize } from "../config/database";
import { UserNotificationPreferenceModel } from "../models/UserNotificationPreferenceModel";

interface JobQueryOptions {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  departmentId?: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

const parseExperienceRange = (range: string | null | undefined) => {
  if (!range) return null;

  if (range.includes('+')) {
    const min = parseFloat(range.replace('+', '').trim());
    return { min, max: 999 };
  }

  const parts = range.split('-');
  if (parts.length === 2) {
    return {
      min: parseFloat(parts[0].trim()),
      max: parseFloat(parts[1].trim())
    };
  }

  return null;
}



/**
 * Service หลักสำหรับส่ง Broadcast Notification ของงานที่กำหนด
 * Updated: Logic synchronized with getAudienceByPublishGroup
 * With Detailed Debug Logs
 * @param job
 */
export const sendJobBroadcast = async (job: JobModel) => {
  console.log(`[JobBroadcast] START - Processing Job ID: ${job.id}, Publish Group: ${job.publish_group}`);

  if (!job.required_department_id) {
    console.error(
      `[JobBroadcast] Error: Job ID ${job.id} ไม่มี required_department_id, ไม่สามารถส่ง Broadcast ได้`
    );
    return;
  }

  const department = await DepartmentModel.findByPk(
    job.required_department_id,
    {
      attributes: ["id", "facility_id", "role_tags", "name"],
      include: [
        {
          model: DepartMentCategoryModel,
          as: "department_categories",
          attributes: ["category_id", "sub_category_id"],
          where: { is_active: 1 },
          required: false,
          include: []
        },
        {
          model: DepartmentCertificationModel,
          as: "department_certifications",
          attributes: ["certification_id"],
          required: false,
        },
      ],
    }
  );
  if (!department) throw new Error("Department not found");

  const facility = await FacilityModel.findByPk(department.facility_id);
  if (!facility) throw new Error("Hospital not found");

  console.log(`[JobBroadcast] Context - Facility: ${facility.name} (${facility.id}), Department: ${department.name} (${department.id})`);

  // Format Message
  const startTime = new Date(`${job.work_date}T${job.start_time}`);
  const endTime = new Date(`${job.work_date}T${job.end_time}`);
  const formattedStartTime = format(startTime, "dd/MM/yyyy HH:mm");
  const formattedEndTime = format(endTime, "HH:mm");
  const message = `${formattedStartTime} - ${formattedEndTime}\n${facility.name}\n${department.name}\n`;

  let targetUserIds: number[] = [];
  const facilityId = department.facility_id;
  let intentTopicName: string | null = null;

  switch (job.publish_group) {
    case "hospital": {
      const preferenceKey = `jobs_facility_${facilityId}`;
      intentTopicName = preferenceKey;
      console.log(
        `[JobBroadcast] Querying users for 'hospital' group (Facility: ${facilityId}, Dept: ${department.id}, PrefKey: ${preferenceKey})`
      );

      // Criteria ต้องตรงกับ getAudienceByPublishGroup:
      // 1. Facility ID ตรง
      // 2. Department ID ตรง
      // 3. ไม่ใช่ applicant / part-time
      const potentialUsers = await UserEmploymentModel.findAll({
        where: {
          facility_id: facilityId,
          department_id: department.id,
          is_active: true,
          is_job_applicant: false,
          is_part_time: false
        },
        attributes: ['user_id'],
        include: [
          {
            model: UserModel,
            as: 'user',
            where: { status_id: 1 }, // Active User Only
            attributes: [],
            required: true
          }
        ],
        raw: true
      });

      const potentialUserIds = potentialUsers.map((emp: any) => emp.user_id);
      const totalPotentialCount = potentialUserIds.length;

      console.log(
        `[JobBroadcast-Hospital] 1. Total potential users in group: ${totalPotentialCount}`
      );

      if (totalPotentialCount === 0) {
        targetUserIds = [];
        console.log(`[JobBroadcast-Hospital] No users found in potential list. Aborting.`);
        break;
      }

      // กรอง User เฉพาะคนที่เปิดรับการแจ้งเตือนนี้
      const enabledUsers = await UserNotificationPreferenceModel.findAll({
        where: {
          user_id: { [Op.in]: potentialUserIds },
          preference_key: preferenceKey,
          is_enabled: true,
        },
        attributes: ["user_id"],
      });
      targetUserIds = enabledUsers.map((pref) => pref.user_id);
      console.log(`[JobBroadcast-Hospital] 2. Users enabled notification: ${targetUserIds.length}`);
      break;
    }

    case "part-time": {
      const preferenceKey = `jobs_facility_part_time_${facilityId}`;
      intentTopicName = preferenceKey;
      console.log(
        `[JobBroadcast] Querying users for 'part-time' group (Facility: ${facilityId}, PrefKey: ${preferenceKey})`
      );

      // Criteria ต้องตรงกับ getAudienceByPublishGroup:
      // 1. Facility ID ตรง
      // 2. เป็น applicant หรือ part-time
      const potentialUsers = await UserEmploymentModel.findAll({
        where: {
          facility_id: facilityId,
          is_active: true,
          [Op.or]: [
            { is_job_applicant: true },
            { is_part_time: true }
          ]
        },
        attributes: ['user_id'],
        include: [
          {
            model: UserModel,
            as: 'user',
            where: { status_id: 1 }, // Active User Only
            attributes: [],
            required: true
          }
        ],
        raw: true
      });

      const potentialUserIds = potentialUsers.map((emp: any) => emp.user_id);
      const totalPotentialCount = potentialUserIds.length;

      console.log(
        `[JobBroadcast-PartTime] 1. Total potential users in group: ${totalPotentialCount}`
      );

      if (totalPotentialCount === 0) {
        targetUserIds = [];
        console.log(`[JobBroadcast-PartTime] No users found in potential list. Aborting.`);
        break;
      }

      // กรอง User เฉพาะคนที่เปิดรับการแจ้งเตือนนี้
      const enabledUsers = await UserNotificationPreferenceModel.findAll({
        where: {
          user_id: { [Op.in]: potentialUserIds },
          preference_key: preferenceKey,
          is_enabled: true,
        },
        attributes: ["user_id"],
      });
      targetUserIds = enabledUsers.map((pref) => pref.user_id);
      console.log(`[JobBroadcast-PartTime] 2. Users enabled notification: ${targetUserIds.length}`);
      break;
    }

    case "system": {
      console.log(
        `[JobBroadcast] Querying users for 'system' group (Department: ${department.id})`
      );

      const facilityData = await FacilityModel.findByPk(facilityId, { attributes: ['province_code'] });
      const departmentProvinceCode = facilityData?.province_code || null;

      // --- Determine Role Criteria ---
      let requiredRoleIds: number[] = [];
      if (job.required_role_id) {
        // ใช้ Role ที่ระบุใน Job เป็นหลัก
        console.log(`[JobBroadcast] Using specific requiredRoleId: ${job.required_role_id}`);
        requiredRoleIds = [job.required_role_id];
      } else {
        // Fallback ไปใช้ Department Tags
        console.log(`[JobBroadcast] No specific roleId in Job, falling back to Department role_tags`);
        requiredRoleIds = (department.role_tags || "")
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id) && id > 0);
      }

      const requiredCertificationIds = [
        ...new Set(
          (department.department_certifications ?? []).map(
            (c: any) => c.certification_id
          )
        ),
      ];
      const requiredCategoryIds = [
        ...new Set(
          (department.department_categories ?? [])
            .map((c: any) => c.category_id)
            .filter(Boolean) as number[]
        ),
      ];
      const requiredSubCategoryIds = [
        ...new Set(
          (department.department_categories ?? [])
            .map((c: any) => c.sub_category_id)
            .filter(Boolean) as number[]
        ),
      ];

      // --- DEBUG LOGS FOR CRITERIA ---
      console.log('[JobBroadcast-System] Criteria:', {
        roleIds: requiredRoleIds,
        certIds: requiredCertificationIds,
        provinceCode: departmentProvinceCode,
        categoryIds: requiredCategoryIds,
        subCategoryIds: requiredSubCategoryIds,
        experienceRange: job.experience_range
      });

      // --- Experience Query Construction ---
      const expRangeConfig = parseExperienceRange(job.experience_range);

      const getExpWhere = () => {
        const expOrClause: any[] = [];
        if (requiredCategoryIds.length > 0) {
          expOrClause.push({
            category_master_id: { [Op.in]: requiredCategoryIds },
          });
        }
        if (requiredSubCategoryIds.length > 0) {
          expOrClause.push({
            sub_category_master_id: { [Op.in]: requiredSubCategoryIds },
          });
        }
        return expOrClause.length > 0 ? { [Op.or]: expOrClause } : null;
      };
      const expWhereClause = getExpWhere();

      console.log('[JobBroadcast-System] Experience Query Clause:', JSON.stringify(expWhereClause));

      // --- Fetch Matching User IDs (Parallel) ---
      const [roles, certs, workAreas, exps] = await Promise.all([
        // Role
        (requiredRoleIds.length > 0) ? UserRoleModel.findAll({
          where: { role_id: { [Op.in]: requiredRoleIds }, is_active: true },
          attributes: ['user_id'], raw: true
        }) : Promise.resolve(null),

        // Certification
        (requiredCertificationIds.length > 0) ? UserCertificationModel.findAll({
          where: { certification_id: { [Op.in]: requiredCertificationIds }, is_active: true },
          attributes: ['user_id'], raw: true
        }) : Promise.resolve(null),

        // Province
        (departmentProvinceCode) ? WorkAreasModel.findAll({
          where: { province_code: departmentProvinceCode },
          attributes: ['user_id'], raw: true
        }) : Promise.resolve(null),

        // Experience
        (expWhereClause) ? UserExperienceModel.findAll({
          attributes: [
            'user_id',
            [sequelize.literal('SUM(COALESCE(experience_years, 0) + (COALESCE(experience_months, 0) / 12.0))'), 'total_years']
          ],
          where: expWhereClause,
          group: ['user_id'],
          having: expRangeConfig
            ? sequelize.literal(`total_years >= ${expRangeConfig.min} AND total_years <= ${expRangeConfig.max}`)
            : undefined,
          raw: true
        }) : Promise.resolve(null)
      ]);

      // --- DEBUG LOGS FOR QUERY RESULTS ---
      console.log('[JobBroadcast-System] Individual Query Results:', {
        rolesMatchedCount: roles ? roles.length : 'Skipped (No Role IDs)',
        certsMatchedCount: certs ? certs.length : 'Skipped (No Cert IDs)',
        workAreasMatchedCount: workAreas ? workAreas.length : 'Skipped (No Province)',
        experienceMatchedCount: exps ? exps.length : 'Skipped (No Experience Criteria)'
      });

      // --- Intersection (Strict Match) ---
      // เหมือนใน getAudienceByPublishGroup: ต้องมีครบทุก Criteria ที่กำหนด
      let candidateUserIds: Set<number> | null = null;

      const intersect = (sourceIds: number[]) => {
        if (candidateUserIds === null) {
          candidateUserIds = new Set(sourceIds);
        } else {
          const incomingSet = new Set(sourceIds);
          for (const id of candidateUserIds) {
            if (!incomingSet.has(id)) {
              candidateUserIds.delete(id);
            }
          }
        }
      };

      if (roles !== null) intersect(roles.map((r: any) => r.user_id));
      if (certs !== null) intersect(certs.map((c: any) => c.user_id));
      if (workAreas !== null) intersect(workAreas.map((w: any) => w.user_id));
      if (exps !== null) intersect(exps.map((e: any) => e.user_id));

      const criteriaMatchedUserIds = candidateUserIds ? Array.from(candidateUserIds) : [];

      console.log(`[JobBroadcast-System] Found ${criteriaMatchedUserIds.length} users strictly matching ALL criteria (Intersection Result).`);

      if (criteriaMatchedUserIds.length === 0) {
        targetUserIds = [];
        console.log(`[JobBroadcast-System] No candidates left after intersection. Aborting.`);
        break;
      }

      // --- Exclude Current Facility Employees ---
      const facilityEmployeeUsers = await UserEmploymentModel.findAll({
        where: { facility_id: facilityId, is_active: true },
        attributes: ['user_id'], raw: true
      });
      const excludedUserIds = new Set(facilityEmployeeUsers.map((e: any) => e.user_id));
      console.log(`[JobBroadcast-System] Found ${excludedUserIds.size} users to exclude (Current Facility Employees).`);

      // --- Filter Active Status & Exclusions ---
      const finalWhereClause: any = {
        id: { [Op.in]: criteriaMatchedUserIds },
        status_id: 1, // Active User Only
      };

      if (excludedUserIds.size > 0) {
        finalWhereClause.id = {
          [Op.and]: [
            { [Op.in]: criteriaMatchedUserIds },
            { [Op.notIn]: Array.from(excludedUserIds) }
          ]
        };
      }

      const potentialUsers = await UserModel.findAll({
        attributes: ["id"],
        where: finalWhereClause,
        raw: true
      });

      const potentialUserIds = potentialUsers.map((u: any) => u.id);

      console.log(
        `[JobBroadcast-System] 1. Total potential users (matched + active + not in facility): ${potentialUserIds.length}`
      );

      if (potentialUserIds.length === 0) {
        targetUserIds = [];
        console.log(`[JobBroadcast-System] No potential users left after active/exclude check. Aborting.`);
        break;
      }

      // --- Notification Preference Check ---
      const preferenceKey = "jobs_public";
      intentTopicName = preferenceKey;

      const enabledUsers = await UserNotificationPreferenceModel.findAll({
        where: {
          user_id: { [Op.in]: potentialUserIds },
          preference_key: preferenceKey,
          is_enabled: true,
        },
        attributes: ["user_id"],
      });
      targetUserIds = enabledUsers.map((pref) => pref.user_id);
      console.log(`[JobBroadcast-System] 2. Users enabled notification: ${targetUserIds.length}`);
      break;
    }

    default: {
      console.error(
        `[JobBroadcast] Error: Job ID ${job.id} มี publish_group ที่ไม่รู้จัก: '${job.publish_group}', ไม่สามารถส่ง Broadcast ได้`
      );
      return;
    }
  }

  // --- Send Notification ---
  if (targetUserIds.length > 0 && intentTopicName) {
    const notificationBody = {
      data: {
        jobId: job.id,
        topic: "New Job",
        action: "open_job",
      },
      notification_type_id: 2,
      title: job.job_title,
      message,
      target_channel: "topic",
      target_value: intentTopicName,
      execution_user_ids: targetUserIds,
    };

    try {
      await NotificationsService.sendNotification(notificationBody as any);
      console.log(
        `[JobBroadcast] SUCCESS - Notification sent for Job ID: ${job.id} (Users: ${targetUserIds.length} คน, Intent: ${intentTopicName})`
      );
    } catch (err) {
      console.error(
        `[JobBroadcast] FAILED - Could not send notification for Job ID: ${job.id}`,
        err
      );
    }
  } else {
    console.log(
      `[JobBroadcast] FINISHED - Job ID: ${job.id} - ไม่พบ User เป้าหมาย (0 users) หรือ intentTopicName (null). No notification sent.`
    );
  }
};

/**
 * Service สำหรับ Broadcast งานที่มีอยู่แล้วในระบบ
 * @param jobId
 */
export const broadcastJobNotification = async (jobId: number, userId: number) => {
  const job = await JobModel.findByPk(jobId);
  if (!job) {
    throw new Error(`ไม่พบงานที่มี ID: ${jobId}`);
  }

  await sendJobBroadcast(job);

  return { success: true, message: `Broadcast สำหรับ Job ID: ${jobId} ได้เริ่มขึ้นแล้ว` };
}

export const createJobAndNotify = async (jobData: any, userId: number) => {

  const publishGroup = jobData.publish_group;

  const isPublicValue = publishGroup === 'system';

  const job = await JobModel.create({
    ...jobData,
    is_public: isPublicValue,
    created_by: userId,
    updated_by: userId,
  });

  try {
    await sendJobBroadcast(job);
  } catch (error) {
    console.log(`สร้าง Job (ID: ${job.id}) สำเร็จ แต่ส่ง Notification ไม่สำเร็จ`, error);
  }

  return job;
}

export const updateJob = async (id: number, updates: Partial<JobModel>, userId: number) => {
  const job = await JobModel.findByPk(id);
  if (!job) throw new Error("Job not found");
  const updated = await job.update({
    ...updates,
    updated_by: userId,
  });

  return updated;
};

export const updateAndBroadcastJob = async (jobId: number, updates: Partial<JobModel>, userId: number) => {
  const job = await JobModel.findByPk(jobId);
  if (!job) {
    throw new Error(`ไม่พบงานที่มี ID: ${jobId}`);
  }

  const updatedJob = await job.update({
    ...updates,
    updated_by: userId,
  });

  await sendJobBroadcast(updatedJob);

  return { success: true, message: `บันทึกและส่ง Broadcast สำหรับ Job ID: ${jobId} สำเร็จ` };
};

export const deleteJob = async (id: number, userId: number) => {
  const job = await JobModel.findByPk(id);
  if (!job) throw new Error("Job not found");
  await job.destroy();

  await NotificationsService.sendNotification({
    title: "ลบงาน",
    message: `งาน ${job.job_title} ถูกลบแล้ว`,
    target_channel: "broadcast",
    data: { jobId: job.id },
    notification_type_id: 2,
  });

  return job;
};

export const getJobById = async (id: number, userId: number) => {
  // Load job 
  const job = await JobModel.findByPk(id, {
    include: [
      {
        model: JobStatusModel,
        as: "job_status",
        attributes: ["id", "name", "description", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name", "type_id", "facility_id", "is_active"],
        include: [
          {
            model: FacilityModel,
            as: "facility",
            attributes: [
              "id",
              "name",
              "type_id",
              "latitude",
              "longitude",
              "address",
              "is_active",
            ],
          },
          {
            model: DepartMentCategoryModel,
            as: "department_categories",
            required: false,
            attributes: ["id", "department_id", "category_id", "sub_category_id"],
            include: [
              {
                model: CategoryMasterModel,
                as: "category",
                attributes: ["id", "name_th", "name_en"],
                required: false,
              },
              {
                model: SubCategoryMasterModel,
                as: "sub_category",
                attributes: ["id", "name_th", "name_en"],
                required: false,
              },
            ],
          },
          {
            model: DepartmentCertificationModel,
            as: "department_certifications",
            required: false,
            attributes: ["id", "department_id", "certification_id"],
            include: [
              {
                model: CertificationModel,
                as: "certification",
                attributes: ["id", "name_th", "name_en", "role_id", "is_active"],
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: RoleModel,
        as: "role",
        attributes: ["id", "name", "description", "sort_order", "is_active"],
      },
      {
        model: JobApplyModel,
        as: "job_applies",
        required: false,
        where: { user_id: userId },
        attributes: [
          "id",
          "user_id",
          "status_id",
          "apply_date",
          "remark",
          "approve_user_id",
          "approve_date",
        ],
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserAttributes()
          },
          {
            model: UserModel,
            as: "approver",
            attributes: getUserAttributes()
          },
          {
            model: ApplicantReviewModel,
            as: "review",
            required: false,
            attributes: ["id", "job_apply_id", "reviewer_id", "rating", "comment", "created_at"],
            include: [
              {
                model: UserModel,
                as: "reviewer",
                attributes: ["id", "first_name", "last_name"],
                include: [
                  {
                    model: UserEmploymentModel,
                    as: "user_employment",
                    required: false,
                    where: { is_active: true },
                    attributes: ["facility_id"],
                    include: [
                      {
                        model: FacilityModel,
                        as: "facility",
                        attributes: ["id", "name"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // Decrypt user data in job_applies
  const jobData = job.toJSON();

  if (job.job_applies && job.job_applies.length > 0) {
    jobData.job_applies = job.job_applies.map((applyInstance) => {
      const applyJSON = applyInstance.toJSON();

      // Decrypt user data
      if (applyInstance.user) {
        applyJSON.user = applyInstance.user.toPipedaCompliantJSON();
      }
      if (applyInstance.approver) {
        applyJSON.approver = applyInstance.approver.toPipedaCompliantJSON();
      }

      // Process applicant_review with reviewer facility info
      if (applyInstance.review) {
        const reviewJSON = applyJSON.review;
        if (applyInstance.review.reviewer) {
          const reviewer = applyInstance.review.reviewer;
          reviewJSON.reviewer = {
            id: reviewer.id,
            first_name: reviewer.first_name,
            last_name: reviewer.last_name,
            facility: null as any
          };

          // Extract facility info from user_employment
          if (reviewer.user_employment && Array.isArray(reviewer.user_employment) && reviewer.user_employment.length > 0) {
            const employment = reviewer.user_employment[0];
            if (employment.facility) {
              reviewJSON.reviewer.facility = {
                id: employment.facility.id,
                name: employment.facility.name
              };
            }
          }
        }
        applyJSON.applicant_review = reviewJSON;
        delete applyJSON.review; // เปลี่ยนชื่อจาก review เป็น applicant_review
      } else {
        applyJSON.applicant_review = null;
      }

      return applyJSON;
    });
  }

  // Block job with status "Cancelled" (4) for everyone
  if (job.status_id === 4) {
    throw new Error("Job not found");
  }

  // fetch this user's apply for enrichment (if any)
  const userApply = await JobApplyModel.findOne({
    where: { job_id: id, user_id: userId },
    attributes: [
      "id",
      "job_id",
      "status_id",
      "apply_date",
      "remark",
      "approve_user_id",
      "approve_date",
    ],
  });

  const enrichJob = (j: any) => {
    const jobObj = j && typeof j.toJSON === "function" ? j.toJSON() : j;
    const userApplyInJob = jobObj.job_applies?.find((apply: any) => apply.user_id === userId);
    return {
      ...jobObj,
      applied: !!userApplyInJob,
      job_applies: jobObj.job_applies || []
    };
  };

  // closed job: allow access only for applicants (status_id = 3)
  if (jobData.status_id === 3) {
    const applied = await JobApplyModel.findOne({ where: { job_id: id, user_id: userId } });
    if (applied) return enrichJob(jobData);
    throw new Error("Job not found");
  }

  // Public job:
  if (jobData.is_public === true) {
    // case 1: allow access to all users
    // case 2: allow access to specific users
    return enrichJob(jobData);
  }

  // Private job: check role + facility like before
  if (job.is_public === false) {
    const userWithRolesAndFacility = await UserModel.findByPk(userId, {
      include: [
        {
          model: UserRoleModel,
          as: "user_role",
          where: { is_active: true },
          required: false,
          include: [
            {
              model: RoleModel,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: UserEmploymentModel,
          as: "user_employment",
          where: { is_active: true },
          required: false,
          attributes: ["facility_id"],
        },
      ],
    });

    if (!userWithRolesAndFacility) {
      throw new Error("Job not found");
    }

    const userRoles = userWithRolesAndFacility.user_role as any;
    const userRoleIds = Array.isArray(userRoles)
      ? userRoles.map((ur: any) => ur.role_id)
      : userRoles
        ? [userRoles.role_id]
        : [];

    const userEmployments = userWithRolesAndFacility.user_employment as any;
    const userFacilityIds = Array.isArray(userEmployments)
      ? userEmployments.map((ue: any) => ue.facility_id)
      : userEmployments
        ? [userEmployments.facility_id]
        : [];

    const hasRequiredRole = userRoleIds.includes(jobData.required_role_id);
    const jobDepartment = jobData.department;
    const jobFacilityId = jobDepartment?.facility_id;
    const hasSameFacility = jobFacilityId && userFacilityIds.includes(jobFacilityId);

    if (!hasRequiredRole || !hasSameFacility) {
      throw new Error("Job not found");
    }

    return enrichJob(jobData);
  }

  // fallback
  throw new Error("Job not found");
};

export const getJobByIdBackoffice = async (id: number) => {
  const job = await JobModel.findByPk(id, {
    include: [
      {
        model: JobStatusModel,
        as: "job_status",
        attributes: ["id", "name", "description", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name", "type_id", "facility_id", "is_active"],
        include: [
          {
            model: FacilityModel,
            as: "facility",
            attributes: [
              "id",
              "name",
              "type_id",
              "latitude",
              "longitude",
              "address",
              "is_active",
            ],
          },
        ],
      },
      {
        model: RoleModel,
        as: "role",
        attributes: ["id", "name", "description", "sort_order", "is_active"],
      },
      {
        model: JobApplyModel,
        as: "job_applies",
        required: false,
        attributes: [
          "id",
          "user_id",
          "status_id",
          "apply_date",
          "remark",
          "approve_user_id",
          "approve_date",
        ],
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserAttributes(),
          },
          {
            model: UserModel,
            as: "approver",
            attributes: getUserAttributes(),
          },
        ],
      },
    ],
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const jobData = job.toJSON();

  if (job.job_applies && job.job_applies.length > 0) {
    jobData.job_applies = job.job_applies.map((applyInstance) => {
      const applyJSON = applyInstance.toJSON();

      if (applyInstance.user) {
        applyJSON.user = applyInstance.user.toPipedaCompliantJSON();
      }
      if (applyInstance.approver) {
        applyJSON.approver = applyInstance.approver.toPipedaCompliantJSON();
      }
      return applyJSON;
    });
  }

  return jobData;
};

export const getAllJobs = async (options: PaginationOptions = {}) => {
  const { page = 1, limit = 25 } = options;
  const offset = (page - 1) * limit;

  const { count, rows: jobs } = await JobModel.findAndCountAll({
    order: [["created_at", "DESC"]],
    limit: limit,
    offset: offset,
    distinct: true,
    include: [
      {
        model: JobStatusModel,
        as: "job_status",
        attributes: ["id", "name", "description", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name", "type_id", "facility_id", "is_active"],
        include: [
          {
            model: FacilityModel,
            as: "facility",
            attributes: [
              "id",
              "name",
              "type_id",
              "latitude",
              "longitude",
              "address",
              "is_active",
            ],
          },
        ],
      },
      {
        model: RoleModel,
        as: "role",
        attributes: ["id", "name", "description", "sort_order", "is_active"],
      },
      {
        model: JobApplyModel,
        as: "job_applies",
        required: false,
        attributes: [
          "id",
          "user_id",
          "status_id",
          "apply_date",
          "remark",
          "approve_user_id",
          "approve_date",
        ],
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserAttributes(),
          },
          {
            model: UserModel,
            as: "approver",
            attributes: getUserAttributes(),
          },
        ],
      },
    ],
  });

  const processedJobs = jobs.map((job: any) => {
    const jobData = job.toJSON();

    if (job.job_applies && job.job_applies.length > 0) {
      jobData.job_applies = job.job_applies.map((applyInstance: any) => {
        const applyJSON = applyInstance.toJSON();

        if (applyInstance.user) {
          applyJSON.user = applyInstance.user.toPipedaCompliantJSON();
        }
        if (applyInstance.approver) {
          applyJSON.approver = applyInstance.approver.toPipedaCompliantJSON();
        }
        return applyJSON;
      });
    }

    return jobData;
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: processedJobs,
    pagination: {
      total: count,
      page: page,
      limit: limit,
      totalPages: totalPages,
    },
  };
};

export const getAvailableAndAppliedJobs = async (userId: number) => {
  const userWithRolesAndFacility = await UserModel.findByPk(userId, {
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { is_active: true },
        required: false,
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { is_active: true },
        required: false,
        attributes: ["facility_id"],
      },
    ],
  });

  if (!userWithRolesAndFacility) {
    throw new Error("User not found");
  }

  const userRoles = userWithRolesAndFacility.user_role as any;
  const userRoleIds = Array.isArray(userRoles)
    ? userRoles.map((ur: any) => ur.role_id)
    : userRoles
      ? [userRoles.role_id]
      : [];

  const userEmployments = userWithRolesAndFacility.user_employment as any;
  const userFacilityIds = Array.isArray(userEmployments)
    ? userEmployments.map((ue: any) => ue.facility_id)
    : userEmployments
      ? [userEmployments.facility_id]
      : [];


  const userAppliedJobs = await JobApplyModel.findAll({
    where: { user_id: userId },
    attributes: [
      "id",
      "job_id",
      "status_id",
      "apply_date",
      "remark",
      "approve_user_id",
      "approve_date",
    ],
  });
  const appliedJobIds = userAppliedJobs.map(apply => apply.job_id);

  // load user's work areas (if any)
  const userWorkAreas = await WorkAreasModel.findAll({ where: { user_id: userId } });


  const whereCondition = appliedJobIds.length > 0
    ? {
      [Op.or]: [
        { status_id: { [Op.notIn]: [3, 4] } },
        {
          [Op.and]: [
            { status_id: 3 },
            { id: { [Op.in]: appliedJobIds } },
          ],
        },
      ],
    }
    : { status_id: { [Op.notIn]: [3, 4] } };

  const jobs = await JobModel.findAll({
    where: whereCondition,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name", "type_id", "facility_id", "is_active"],
        include: [
          {
            model: FacilityModel,
            as: "facility",
            attributes: [
              "id",
              "name",
              "type_id",
              "latitude",
              "longitude",
              "address",
              "province_code",
              "district_code",
              "is_active",
            ],
          },
          {
            model: DepartMentCategoryModel,
            as: "department_categories",
            required: false,
            attributes: ["id", "department_id", "category_id", "sub_category_id"],
            include: [
              {
                model: CategoryMasterModel,
                as: "category",
                attributes: ["id", "name_th", "name_en"],
                required: false,
              },
              {
                model: SubCategoryMasterModel,
                as: "sub_category",
                attributes: ["id", "name_th", "name_en"],
                required: false,
              },
            ],
          },
          {
            model: DepartmentCertificationModel,
            as: "department_certifications",
            required: false,
            attributes: ["id", "department_id", "certification_id"],
            include: [
              {
                model: CertificationModel,
                as: "certification",
                attributes: ["id", "name_th", "name_en", "role_id", "is_active"],
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: JobApplyModel,
        as: "job_applies",
        where: { user_id: userId },
        required: false,
        attributes: [
          "id",
          "user_id",
          "status_id",
          "apply_date",
          "remark",
          "approve_user_id",
          "approve_date",
        ],
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: [
              "id",
              "username",
              "first_name",
              "last_name",
              "email",
              "phone_number",
              "profile_picture",
            ],
          },
          {
            model: UserModel,
            as: "approver",
            attributes: [
              "id",
              "username",
              "first_name",
              "last_name",
              "email",
              "phone_number",
              "profile_picture",
            ],
          },
          {
            model: ApplicantReviewModel,
            as: "review",
            required: false,
            attributes: ["id", "job_apply_id", "reviewer_id", "rating", "comment", "created_at"],
            include: [
              {
                model: UserModel,
                as: "reviewer",
                attributes: ["id", "first_name", "last_name"],
                include: [
                  {
                    model: UserEmploymentModel,
                    as: "user_employment",
                    required: false,
                    where: { is_active: true },
                    attributes: ["facility_id"],
                    include: [
                      {
                        model: FacilityModel,
                        as: "facility",
                        attributes: ["id", "name"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: RoleModel,
        as: "role",
        required: false,
        attributes: ["id", "name", "description", "sort_order", "is_active"],
      },
    ],
  });

  // สร้าง set สำหรับ lookup applied jobs
  const appliedSet = new Set<number>(appliedJobIds);

  // filter jobs
  const filteredJobs = jobs.filter((job) => {
    // Applied job: allow all
    if (appliedSet.has(job.id)) return true;

    // Public job: check role + work area
    if (job.is_public === true) {
      // return true;
      try {
        const jobDepartment = (job as any).department;
        const facility = jobDepartment?.facility;

        // case job no role required
        if (!job.required_role_id) return true;

        // case user role not match job role required
        const hasRequiredRole = userRoleIds.includes(job.required_role_id);
        if (!hasRequiredRole) return false;

        // case job no department or facility
        if (!jobDepartment || !facility) return true;

        // case user no work area
        if (!userWorkAreas || userWorkAreas.length === 0) return true;

        if (!jobDepartment || !facility) return true;

        const facilityProvince = facility?.province_code;
        // const facilityDistrict = facility?.district_code;

        // case facility no province_code
        if (!facilityProvince) return true;

        // Normalize facilityDistrict to number (disabled for now)
        // const facilityDistrictNum = Number(facilityDistrict);

        // check work areas with facility location
        for (const wa of userWorkAreas) {
          const waProvince = (wa as any).province_code;
          // let waDistrictsRaw = (wa as any).district;

          if (waProvince == null) continue;
          if (Number(waProvince) !== Number(facilityProvince)) continue;

          // for only province code match
          return true;

          // TODO: Enable district filtering later
          // if (!waDistrictsRaw) continue;

          // // waDistricts อาจเก็บเป็น JSON array หรือ CSV string
          // let districtsArr: number[] = [];
          // if (typeof waDistrictsRaw === "string") {
          //   const trimmed = waDistrictsRaw.trim();
          //   if (trimmed.startsWith("[")) {
          //     try {
          //       const parsed = JSON.parse(trimmed);
          //       districtsArr = parsed.map((d: any) => Number(d));
          //     } catch (e) {
          //       
          //       districtsArr = trimmed.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
          //     }
          //   } else {
          //     districtsArr = trimmed.split(",").map(s => Number(s.trim())).filter(n => !isNaN(n));
          //   }
          // } else if (Array.isArray(waDistrictsRaw)) {
          //   districtsArr = waDistrictsRaw.map((d: any) => Number(d)).filter(n => !isNaN(n));
          // }

          // if (districtsArr.includes(facilityDistrictNum)) return true;
        }

        return false;
      } catch (err) {
        // error case pass all
        console.warn("Work area filtering failed, allowing public job by default:", err);
        return true;
      }
    }

    // Private job: check role + facility 
    if (job.is_public === false) {
      const hasRequiredRole = userRoleIds.includes(job.required_role_id);

      const jobDepartment = (job as any).department;
      const jobFacilityId = jobDepartment?.facility_id;
      const hasSameFacility =
        jobFacilityId && userFacilityIds.includes(jobFacilityId);

      return hasRequiredRole && hasSameFacility;
    }

    return false;
  });

  // ใช้ userAppliedJobs ที่ดึงไว้ก่อนหน้า 
  const jobApplies = userAppliedJobs;

  // สร้าง map สำหรับ lookup
  const appliedMap = new Map<number, any>();
  jobApplies.forEach((apply) => {
    appliedMap.set(apply.job_id, apply);
  });

  const jobsWithApply = filteredJobs.map((job) => {
    const jobObj = job.toJSON();
    const userApply = jobObj.job_applies?.find((apply: any) => apply.user_id === userId);

    if (jobObj.job_applies && jobObj.job_applies.length > 0) {
      jobObj.job_applies = jobObj.job_applies.map((apply: any) => {
        // Process applicant_review with reviewer facility info
        if (apply.review) {
          const reviewJSON = apply.review;
          if (apply.review.reviewer) {
            const reviewer = apply.review.reviewer;
            reviewJSON.reviewer = {
              id: reviewer.id,
              first_name: reviewer.first_name,
              last_name: reviewer.last_name,
              facility: null as any
            };

            // Extract facility info from user_employment
            if (reviewer.user_employment && Array.isArray(reviewer.user_employment) && reviewer.user_employment.length > 0) {
              const employment = reviewer.user_employment[0];
              if (employment.facility) {
                reviewJSON.reviewer.facility = {
                  id: employment.facility.id,
                  name: employment.facility.name
                };
              }
            }
          }
          apply.applicant_review = reviewJSON;
          delete apply.review; // เปลี่ยนชื่อจาก review เป็น applicant_review
        } else {
          apply.applicant_review = null;
        }
        return apply;
      });
    }

    return {
      ...jobObj,
      experience_range: jobObj.experience_range || null,
      applied: !!userApply,
      job_applies: jobObj.job_applies || [],
    };
  });

  return jobsWithApply;
};

export const getAvailableAndAppliedJobsByPublishGroup = async (userId: number) => {
  const userWithRolesAndFacility = await UserModel.findByPk(userId, {
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { is_active: true },
        required: false,
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { is_active: true },
        required: false,
        attributes: ["facility_id", "department_id", "is_part_time", "is_job_applicant"],
      },
    ],
  });

  if (!userWithRolesAndFacility) {
    throw new Error("User not found");
  }

  const userEmployments = userWithRolesAndFacility.user_employment as any;
  const userEmploymentsArray = Array.isArray(userEmployments)
    ? userEmployments
    : userEmployments
      ? [userEmployments]
      : [];

  const userAppliedJobs = await JobApplyModel.findAll({
    where: { user_id: userId },
    attributes: [
      "id",
      "job_id",
      "status_id",
      "apply_date",
      "remark",
      "approve_user_id",
      "approve_date",
    ],
  });
  const appliedJobIds = userAppliedJobs.map(apply => apply.job_id);

  const whereCondition = appliedJobIds.length > 0
    ? {
      [Op.or]: [
        { status_id: { [Op.notIn]: [3, 4] } },
        {
          [Op.and]: [
            { status_id: 3 },
            { id: { [Op.in]: appliedJobIds } },
          ],
        },
      ],
    }
    : { status_id: { [Op.notIn]: [3, 4] } };

  const jobs = await JobModel.findAll({
    where: whereCondition,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name", "type_id", "facility_id", "is_active"],
        include: [
          {
            model: FacilityModel,
            as: "facility",
            attributes: [
              "id",
              "name",
              "type_id",
              "latitude",
              "longitude",
              "address",
              "province_code",
              "district_code",
              "is_active",
            ],
          },
          {
            model: DepartMentCategoryModel,
            as: "department_categories",
            required: false,
            attributes: ["id", "department_id", "category_id", "sub_category_id"],
            include: [
              {
                model: CategoryMasterModel,
                as: "category",
                attributes: ["id", "name_th", "name_en"],
                required: false,
              },
              {
                model: SubCategoryMasterModel,
                as: "sub_category",
                attributes: ["id", "name_th", "name_en"],
                required: false,
              },
            ],
          },
          {
            model: DepartmentCertificationModel,
            as: "department_certifications",
            required: false,
            attributes: ["id", "department_id", "certification_id"],
            include: [
              {
                model: CertificationModel,
                as: "certification",
                attributes: ["id", "name_th", "name_en", "role_id", "is_active"],
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: JobApplyModel,
        as: "job_applies",
        where: { user_id: userId },
        required: false,
        attributes: [
          "id",
          "user_id",
          "status_id",
          "apply_date",
          "remark",
          "approve_user_id",
          "approve_date",
        ],
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: [
              "id",
              "username",
              "first_name",
              "last_name",
              "email",
              "phone_number",
              "profile_picture",
            ],
          },
          {
            model: UserModel,
            as: "approver",
            attributes: [
              "id",
              "username",
              "first_name",
              "last_name",
              "email",
              "phone_number",
              "profile_picture",
            ],
          },
          {
            model: ApplicantReviewModel,
            as: "review",
            required: false,
            attributes: ["id", "job_apply_id", "reviewer_id", "rating", "comment", "created_at"],
            include: [
              {
                model: UserModel,
                as: "reviewer",
                attributes: ["id", "first_name", "last_name"],
                include: [
                  {
                    model: UserEmploymentModel,
                    as: "user_employment",
                    required: false,
                    where: { is_active: true },
                    attributes: ["facility_id"],
                    include: [
                      {
                        model: FacilityModel,
                        as: "facility",
                        attributes: ["id", "name"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: RoleModel,
        as: "role",
        required: false,
        attributes: ["id", "name", "description", "sort_order", "is_active"],
      },
    ],
  });

  const appliedSet = new Set<number>(appliedJobIds);

  // filter jobs by publish_group
  const filteredJobs = jobs.filter((job) => {
    // Applied job: allow all
    if (appliedSet.has(job.id)) return true;

    const jobDepartment = (job as any).department;
    const jobFacilityId = jobDepartment?.facility_id;
    const jobDepartmentId = jobDepartment?.id;

    // publish_group === 'system': show all jobs
    if (job.publish_group === 'system') {
      return true;
    }

    // publish_group === 'hospital': match facility + department, is_part_time & is_job_applicant must be false or null
    if (job.publish_group === 'hospital') {
      const matchingEmployment = userEmploymentsArray.find((emp: any) => {
        const facilityMatch = emp.facility_id === jobFacilityId;
        const departmentMatch = emp.department_id === jobDepartmentId;
        const isPartTime = emp.is_part_time === true;
        const isJobApplicant = emp.is_job_applicant === true;
        
        // ต้อง match ทั้ง facility และ department และไม่เป็น part-time หรือ job applicant
        return facilityMatch && departmentMatch && !isPartTime && !isJobApplicant;
      });

      return !!matchingEmployment;
    }

    // publish_group === 'part-time': match facility + department, is_part_time OR is_job_applicant must be true
    if (job.publish_group === 'part-time') {
      const matchingEmployment = userEmploymentsArray.find((emp: any) => {
        const facilityMatch = emp.facility_id === jobFacilityId;
        const departmentMatch = emp.department_id === jobDepartmentId;
        const isPartTime = emp.is_part_time === true;
        const isJobApplicant = emp.is_job_applicant === true;
        
        // ต้อง match ทั้ง facility และ department และเป็น part-time หรือ job applicant (อย่างใดอย่างหนึ่ง)
        return facilityMatch && departmentMatch && (isPartTime || isJobApplicant);
      });

      return !!matchingEmployment;
    }

    return false;
  });

  const jobApplies = userAppliedJobs;

  const appliedMap = new Map<number, any>();
  jobApplies.forEach((apply) => {
    appliedMap.set(apply.job_id, apply);
  });

  const jobsWithApply = filteredJobs.map((job) => {
    const jobObj = job.toJSON();
    const userApply = jobObj.job_applies?.find((apply: any) => apply.user_id === userId);

    if (jobObj.job_applies && jobObj.job_applies.length > 0) {
      jobObj.job_applies = jobObj.job_applies.map((apply: any) => {
        // Process applicant_review with reviewer facility info
        if (apply.review) {
          const reviewJSON = apply.review;
          if (apply.review.reviewer) {
            const reviewer = apply.review.reviewer;
            reviewJSON.reviewer = {
              id: reviewer.id,
              first_name: reviewer.first_name,
              last_name: reviewer.last_name,
              facility: null as any
            };

            // Extract facility info from user_employment
            if (reviewer.user_employment && Array.isArray(reviewer.user_employment) && reviewer.user_employment.length > 0) {
              const employment = reviewer.user_employment[0];
              if (employment.facility) {
                reviewJSON.reviewer.facility = {
                  id: employment.facility.id,
                  name: employment.facility.name
                };
              }
            }
          }
          if (reviewJSON.created_at) {
            reviewJSON.created_at = toLocalISOString(reviewJSON.created_at);
          }
          if (reviewJSON.updated_at) {
            reviewJSON.updated_at = toLocalISOString(reviewJSON.updated_at);
          }
          apply.applicant_review = reviewJSON;
          delete apply.review;
        } else {
          apply.applicant_review = null;
        }
        if (apply.created_at) {
          apply.created_at = toLocalISOString(apply.created_at);
        }
        if (apply.updated_at) {
          apply.updated_at = toLocalISOString(apply.updated_at);
        }
        
        return apply;
      });
    }

    if (jobObj.created_at) {
      jobObj.created_at = toLocalISOString(jobObj.created_at);
    }
    if (jobObj.updated_at) {
      jobObj.updated_at = toLocalISOString(jobObj.updated_at);
    }

    return {
      ...jobObj,
      experience_range: jobObj.experience_range || null,
      applied: !!userApply,
      job_applies: jobObj.job_applies || [],
    };
  });

  return jobsWithApply;
};

export const findActiveJobs = async () => {
  return await JobModel.findAll({
    where: {
      job_date: {
        [Op.gte]: new Date(),
      },
      is_active: true,
    },
  });
};

export const getJobsByUserFacility = async (userId: number, options: JobQueryOptions = {}) => {
  console.log("Fetching jobs for user ID:", userId);

  if (!userId || isNaN(userId) || userId <= 0) {
    throw new Error("Invalid user ID provided");
  }

  // ค้นหา "ทุก" facility_id ที่ user นี้สังกัดอยู่ และ is_active
  const activeEmployments = await UserEmploymentModel.findAll({
    where: {
      user_id: userId,
      is_active: true
    },
    attributes: ['facility_id'],
    group: ['facility_id'],
  });

  if (!activeEmployments || activeEmployments.length === 0) {
    return { data: [], pagination: { total: 0, page: options.page || 1, limit: options.limit || 25, totalPages: 0 } };
  }

  // สร้าง Array ของ facilityId ทั้งหมด
  const facilityIds = activeEmployments.map(emp => emp.facility_id);
  console.log("Active Facility IDs: ", facilityIds);

  // ส่ง Array ของ IDs ไปให้ฟังก์ชันหลัก
  return await getAllJobsByFacility(facilityIds, options);
};

export const getAllJobsByFacility = async (facilityId: number | number[], options: JobQueryOptions = {}) => {
  const {
    page = 1,
    limit = 25,
    month,
    year,
    departmentId
  } = options;
  const offset = (page - 1) * limit;

  const whereClause: any = {};

  if (departmentId) {
    whereClause.required_department_id = departmentId;
  }

  if (year && month) {
    whereClause[Op.and] = [
      sequelize.where(sequelize.fn('YEAR', sequelize.col('work_date')), year),
      sequelize.where(sequelize.fn('MONTH', sequelize.col('work_date')), month)
    ];
  }

  const { count, rows: jobs } = await JobModel.findAndCountAll({
    where: whereClause,
    order: [
      // ["work_date", "DESC"],
      ["created_at", "DESC"]
    ],
    limit: limit,
    offset: offset,
    distinct: true,
    include: [
      {
        model: JobStatusModel,
        as: "job_status",
        attributes: ["id", "name", "description", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        where: { facility_id: Array.isArray(facilityId) ? { [Op.in]: facilityId } : facilityId },
        attributes: ["id", "name", "type_id", "facility_id", "is_active"],
        include: [
          {
            model: FacilityModel,
            as: "facility",
            attributes: [
              "id",
              "name",
              "type_id",
              "latitude",
              "longitude",
              "address",
              "is_active",
            ],
          },
        ],
      },
      {
        model: RoleModel,
        as: "role",
        attributes: ["id", "name", "description", "sort_order", "is_active"],
      },
    ],
  });

  if (jobs.length === 0) {
    return {
      data: [],
      pagination: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  const jobIds = jobs.map((job) => job.id);

  const allJobApplies = await JobApplyModel.findAll({
    where: {
      job_id: { [Op.in]: jobIds },
    },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: [
          "id",
          "username",
          "profile_picture",
          "first_name",
          "last_name",
          "email",
          "phone_number",
          "is_verified_email",
          "is_verified_phone",
          "date_of_birth",
          "nickname",
          "ID_line",
          "first_name_encrypted",
          "last_name_encrypted",
          "email_encrypted",
          "phone_number_encrypted",
          "date_of_birth_encrypted",
        ],
        include: [
          // {
          //   model: UserExperienceModel,
          //   as: "user_experiences",
          //   attributes: [
          //     "id",
          //     "occupation_name",
          //     "occupation_place",
          //     "category_master_id",
          //     "sub_category_master_id",
          //     "experience_years",
          //     "experience_months",
          //   ],
          //   required: false,
          //   order: [
          //     ["experience_years", "DESC"],
          //     ["experience_months", "DESC"],
          //   ],
          //   limit: 1,
          //   separate: true,
          //   include: [
          //     {
          //       model: CategoryMasterModel,
          //       as: "category_master",
          //       attributes: ["name_th", "name_en"],
          //       required: false,
          //     },
          //     {
          //       model: SubCategoryMasterModel,
          //       as: "sub_category_master",
          //       attributes: ["name_th", "name_en"],
          //       required: false,
          //     },
          //   ],
          // },

          {
            model: UserEmploymentModel,
            as: "user_employment",
            where: { is_active: true },
            required: false,
            attributes: [
              "id", "facility_id", "department_id", "position_id",
              "is_part_time", "is_job_applicant", "start_date"
            ],
            include: [
              {
                model: FacilityModel,
                as: "facility",
                attributes: ["id", "name"], // ดึงชื่อ Facility
                required: false,
              },
              {
                model: DepartmentModel,
                as: "department",
                attributes: ["id", "name"], // ดึงชื่อ Department
                required: false,
              },
            ],
          },

          {
            model: UserCertificationModel,
            as: "user_certifications",
            where: { is_active: true },
            attributes: ["id", "certification_id", "institution_id", "start_date"],
            required: false,
            separate: true,
            include: [
              {
                model: CertificationModel,
                as: "certification_info",
                attributes: ["id", "name_th", "name_en"],
                required: false,
              },
              {
                model: InstitutionModel,
                as: "institution_info",
                attributes: ["id", "name_th", "name_en"],
                required: false,
              },
            ],
          },
          {
            model: UserRoleModel,
            as: "user_roles",
            attributes: ["is_active", "assigned_at"],
            required: false,
            separate: true,
            include: [
              {
                model: RoleModel,
                as: "role",
                attributes: ["id", "name", "description"],
                required: false,
              },
            ],
          },
          {
            model: GenderModel,
            as: "user_gender",
            attributes: ["id", "name"],
            required: false,
          },
        ]
      },
      {
        model: UserModel,
        as: "approver",
        attributes: [
          "id",
          "username",
          "profile_picture",
          "first_name",
          "last_name",
          "email",
          "phone_number",
          "first_name_encrypted",
          "last_name_encrypted",
          "email_encrypted",
          "phone_number_encrypted",
        ],
        include: [
          {
            model: UserRoleModel,
            as: "user_roles",
            attributes: ["is_active", "assigned_at"],
            required: false,
            separate: true,
            include: [
              {
                model: RoleModel,
                as: "role",
                attributes: ["id", "name", "description"],
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: ApplicantReviewModel,
        as: "review",
        required: false,
        attributes: ["id", "rating", "comment", "is_active", "created_at"],
      },
    ],
  });

  const userIds = [
    ...new Set(allJobApplies.map(apply => apply.user?.id).filter(id => id))
  ];

  const allExperiences = await UserExperienceModel.findAll({
    where: {
      user_id: { [Op.in]: userIds }
    },
    order: [
      ['user_id', 'ASC'],
      ['experience_years', 'DESC'],
      ['experience_months', 'DESC']
    ],
    include: [
      {
        model: CategoryMasterModel,
        as: "category_master",
        attributes: ["name_th", "name_en"],
        required: false,
      },
      {
        model: SubCategoryMasterModel,
        as: "sub_category_master",
        attributes: ["name_th", "name_en"],
        required: false,
      },
    ]
  });

  const topExperiencesMap = new Map<number, any>();
  for (const exp of allExperiences) {
    if (!topExperiencesMap.has(exp.user_id)) {
      topExperiencesMap.set(exp.user_id, exp);
    }
  }

  const appliesMap = new Map<number, JobApplyModel[]>();
  for (const apply of allJobApplies) {
    if (apply.user) {
      const topExp = topExperiencesMap.get(apply.user.id);
      apply.user.user_experiences = topExp ? [topExp] : [];
    }

    const list = appliesMap.get(apply.job_id) || [];
    list.push(apply);
    appliesMap.set(apply.job_id, list);
  }

  const processedJobs = jobs.map((job) => {
    const jobJSON = job.toJSON();
    const applies = appliesMap.get(job.id) || [];

    jobJSON.job_applies = applies.map((applyInstance) => {
      const applyJSON = applyInstance.toJSON();

      const topExperienceInstance = (applyInstance.user as any)
        ?.user_experiences?.[0];

      if (applyInstance.user) {
        applyJSON.user = applyInstance.user.toPipedaCompliantJSON();
      }

      if (applyJSON.user) {
        const userWithIncludes = applyInstance.user as any;

        applyJSON.user.user_employment = userWithIncludes.user_employment || [];

        if (topExperienceInstance) {
          applyJSON.user.user_experiences = [
            topExperienceInstance.get({ plain: true }),
          ];
        } else {
          applyJSON.user.user_experiences = [];
        }
      }

      if (applyInstance.approver) {
        applyJSON.approver = applyInstance.approver.toPipedaCompliantJSON();
      }
      return applyJSON;
    });

    return jobJSON;
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: processedJobs,
    pagination: {
      total: count,
      page: page,
      limit: limit,
      totalPages: totalPages
    }
  };
};

export const autoCloseJobsByTime = async () => {
  const now = new Date()
  console.log('[AutoClose] Checking for jobs with "time" expiration...')

  try {
    const [affectedCount] = await JobModel.update(
      { status_id: 3 },
      {
        where: {
          auto_close_type: 'time',
          application_deadline: {
            [Op.lte]: now,
          },
          status_id: {
            [Op.ne]: 3
          }
        }
      }
    )

    if (affectedCount > 0) {
      console.log(`[AutoClose] Successfully closed ${affectedCount} time-based jobs.`);
    }
  } catch (error) {
    console.error('[AutoClose] Error closing time-based jobs:', error);
  }
}

/**
 * นับจำนวนผู้สมัคร (Applicants) ที่มีสถานะเป็น Pending (status_id = 1)
 * ภายใต้งานของ Department, ปี, และเดือน ที่กำหนด
 * * @param departmentId - ID ของแผนก
 * @param year - ปี (เช่น 2025)
 * @param month - เดือน (1-12)
 * @returns {Promise<number>} - จำนวนผู้สมัครที่นับได้
 */
export const countPendingApplicantsByDepartment = async (
  departmentId: number,
  year: number,
  month: number
): Promise<number> => {

  const count = await JobApplyModel.count({
    where: {
      status_id: 1,
    },

    include: [
      {
        model: JobModel,
        as: 'job',
        required: true,
        where: {
          required_department_id: departmentId,

          [Op.and]: [
            sequelize.where(sequelize.fn('YEAR', sequelize.col('job.work_date')), year),
            sequelize.where(sequelize.fn('MONTH', sequelize.col('job.work_date')), month)
          ]
        }
      }
    ]
  });

  return count;
};