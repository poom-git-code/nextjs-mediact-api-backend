import JobApplyModel from "../models/JobApplyModel";
import JobModel from "../models/JobsModel";
import UserModel from "../models/UserModel";
import JobStatusModel from "../models/JobStatusModel";
import DepartmentModel from "../models/DepartmentModel";
import FacilityModel from "../models/FacilitiesModel";
import RoleModel from "../models/RolesModel";
import * as NotificationsService from "../services/notificationsService";
import { sequelize } from "../config/database";
import ScheduleShiftModel from "../models/ScheduleShiftsModel";
import { Op } from "sequelize";
import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import { getUserAttributes, getBasicUserAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import { PipedaUserDataHandler } from '../middleware/pipedaUserDataHandler';
import ScheduleMasterModel from "../models/ScheduleMasterModel";
import ShiftTypeModel from "../models/ShiftTypesModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import * as UserNotificationPreferenceService from "./userNotificationPreferenceService";

const JOB_STATUS = {
  OPEN: 1,
  FILLED: 2,
  CLOSED: 3,
  CANCELLED: 4
}

// export const createJobApply = async (data: any, userId: number) => {
//   let job: any = null;
//   let facility: any = null;
//   let newStatusId: any = null;

//   try {
//     const apply = await sequelize.transaction(async (t) => {
//       // ดึงข้อมูล Job
//       job = await JobModel.findByPk(data.job_id, {
//         lock: t.LOCK.UPDATE,
//         transaction: t
//       });

//       if (!job) {
//         throw new Error("Job not found");
//       }

//        if (job.status_id === 2) {
//         throw new Error("งานนี้มีผู้สมัครครบโควต้าแล้ว");
//       }

//       if (job.status_id === 3) {
//         throw new Error("งานนี้ถูกปิดรับสมัครแล้ว");
//       }

//       // ดึงข้อมูลโรงพยาบาล
//       const scheduleShift = await ScheduleShiftModel.findByPk(job.source_schedule_id, { transaction: t });
//       if (!scheduleShift) throw new Error("Schedule shift not found");

//       facility = await FacilityModel.findByPk(scheduleShift.facility_id, { transaction: t });
//       if (!facility) throw new Error("Hospital not found");

//       // การตรวจสอบสถานะและโควต้า
//       if (job.status_id === JOB_STATUS.CLOSED) {
//         throw new Error("Job is already closed");
//       }
//       if (job.auto_close_type === 'max_applicants' && job.max_applicants !== null) {
//         const currentCount = await JobApplyModel.count({
//           where: { job_id: data.job_id },
//           transaction: t
//         });

//         if (currentCount >= job.max_applicants) {
//           throw new Error("Job quota is full");
//         }
//       }

//       const newApply = await JobApplyModel.create({
//         ...data,
//         created_by: userId,
//         updated_by: userId
//       }, { transaction: t });

//       // การปิด Job เมื่อโควต้าเต็ม
//       if (job.auto_close_type === 'first_applicant') {
//         newStatusId = JOB_STATUS.CLOSED
//       }

//       else if (job.auto_close_type === 'max_applicants' && job.max_applicants !== null) {
//         const afterCount = await JobApplyModel.count({ where: { job_id: data.job_id }, transaction: t });

//         if (afterCount >= job.max_applicants) {
//           newStatusId = JOB_STATUS.FILLED;
//         }
//       }

//       if (newStatusId !== null) {
//         await job.update({ status_id: newStatusId }, { transaction: t });
//       }

//       return newApply;
//     });

//     // ส่ง Notification ไปยังผู้ดูแลหน่วยงาน
//     if (job && job.required_department_id) {
//       // console.log(`--- Debug Notification ---`);
//       // console.log(`Job requires department ID: ${job.required_department_id}`);

//       const supervisors = await DepartmentSupervisorModel.findAll({
//         where: {
//           department_id: job.required_department_id,
//           is_active: true,
//         }
//       });

//       // console.log(`Found ${supervisors.length} active supervisors.`);

//       if (supervisors && supervisors.length > 0) {
//         // ดึงข้อมูลผู้สมัครเพื่อนำชื่อไปใช้ในข้อความ
//         const applicantUser = await UserModel.findByPk(data.user_id);

//         // Decrypt user data for display
//         const decryptedApplicantUser = applicantUser ? decryptAndCleanUserData(applicantUser) : null;

//         const applicantName = decryptedApplicantUser
//           ? `${decryptedApplicantUser.first_name || ''} ${decryptedApplicantUser.last_name || ''}`.trim()
//           : 'ผู้สมัครใหม่';

//         const title = "มีผู้สมัครงานใหม่";
//         const message = `${applicantName} ได้สมัครงานในตำแหน่ง "${job.job_title}"`;

//         const supervisorUserIds = supervisors.map(supervisor => supervisor.user_id).join(',');
//         // console.log(`Target Supervisor User IDs: ${supervisorUserIds}`);

//         const notificationPayload = {
//           title: title,
//           message: message,
//           target_channel: "user",
//           target_value: supervisorUserIds,
//           data: {
//             topic: "New Applicant",
//             url: `https://partner.mediact.biz/partners/schedule/staff-schedule-manage/?departmentId=${job.required_department_id}`
//           },
//         };

//         // console.log('Sending notification with payload:', JSON.stringify(notificationPayload, null, 2));
//         await NotificationsService.sendNotification(notificationPayload);
//         // console.log(`--- End Debug Notification ---`);
//       }
//     }

//     return apply;

//   } catch (error: any) {
//     // const jobTitle = job ? `สำหรับตำแหน่ง "${job.job_title}"` : '';

//     // if (error.message === "Job is already closed") {
//     //   await NotificationsService.sendNotification({
//     //     title: "สมัครงานไม่สำเร็จ",
//     //     message: `งานนี้ถูกปิดรับสมัครแล้ว ${jobTitle}`,
//     //     target_channel: "user",
//     //     target_value: data.user_id?.toString(),
//     //     data: { jobId: data.job_id, action: "open_job", topic: "Job Apply" }
//     //   });
//     // } else if (error.message === "Job quota is full") {
//     //   await NotificationsService.sendNotification({
//     //     title: "สมัครงานไม่สำเร็จ",
//     //     message: `มีผู้สมัครครบตามโควต้าแล้ว ${jobTitle}`,
//     //     target_channel: "user",
//     //     target_value: data.user_id?.toString(),
//     //     data: { jobId: data.job_id, action: "open_job", topic: "Job Apply" }
//     //   });
//     // }

//     throw error;
//   }
// }

export const createJobApply = async (data: any, userId: number) => {
  let job: any = null;
  let facility: any = null;
  let newStatusId: any = null;

  try {
    const apply = await sequelize.transaction(async (t) => {
      // 1. Fetch Job data with a lock to prevent race conditions
      job = await JobModel.findByPk(data.job_id, {
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!job) {
        throw new Error("Job not found");
      }

      // 2. Validate current job status before proceeding
      if (job.status_id === 2) {
        throw new Error("งานนี้มีผู้สมัครครบโควต้าแล้ว");
      }

      if (job.status_id === 3) {
        throw new Error("งานนี้ถูกปิดรับสมัครแล้ว");
      }

      // 2.5. Check for shift time conflicts with existing user schedules
      const existingShifts = await ScheduleShiftModel.findAll({
        where: {
          employee_id: userId,
          shift_date: job.work_date,
          is_active: true,
        },
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "short_name"],
            required: false,
          }
        ],
        transaction: t
      });

      if (existingShifts.length > 0) {
        // Parse job time range
        const jobStart = job.start_time;
        const jobEnd = job.end_time;

        // Check for time overlap
        for (const shift of existingShifts) {
          const shiftStart = shift.start_time;
          const shiftEnd = shift.end_time;

          // Skip if shift times are not defined
          if (!shiftStart || !shiftEnd) continue;

          // Time overlap logic: (jobStart < shiftEnd) AND (jobEnd > shiftStart)
          if (jobStart < shiftEnd && jobEnd > shiftStart) {
            // Allow overlap if shift_type has short_name 'X' or 'V'
            const shiftType = (shift as any).shift_type;
            const shortName = shiftType?.short_name?.toUpperCase();
            
            if (shortName === 'X' || shortName === 'V') {
              continue; // Skip this conflict, allow apply
            }
            throw new Error("งานนี้มีเวลาที่ทับซ้อนกับเวรที่มีอยู่ของคุณแล้ว");
          }
        }
      }

      // 3. Fetch related schedule and facility info only if the job is linked to a schedule
      if (job.source_schedule_id) {
        const scheduleShift = await ScheduleShiftModel.findByPk(job.source_schedule_id, { transaction: t });
        if (!scheduleShift) throw new Error("Schedule shift not found");

        facility = await FacilityModel.findByPk(scheduleShift.facility_id, { transaction: t });
        if (!facility) throw new Error("Hospital not found");
      }

      // 4. Double-check status and quota within the transaction for data consistency
      if (job.status_id === JOB_STATUS.CLOSED) {
        throw new Error("Job is already closed");
      }
      if (job.auto_close_type === 'max_applicants' && job.max_applicants !== null) {
        const currentCount = await JobApplyModel.count({
          where: { job_id: data.job_id },
          transaction: t
        });

        if (currentCount >= job.max_applicants) {
          throw new Error("Job quota is full");
        }
      }

      // 5. Create the new job application record
      const newApply = await JobApplyModel.create({
        ...data,
        created_by: userId,
        updated_by: userId
      }, { transaction: t });

      // 6. Update job status if auto-close rules are met
      if (job.auto_close_type === 'first_applicant') {
        newStatusId = JOB_STATUS.CLOSED;
      } else if (job.auto_close_type === 'max_applicants' && job.max_applicants !== null) {
        const afterCount = await JobApplyModel.count({ where: { job_id: data.job_id }, transaction: t });

        if (afterCount >= job.max_applicants) {
          newStatusId = JOB_STATUS.FILLED;
        }
      }

      if (newStatusId !== null) {
        await job.update({ status_id: newStatusId }, { transaction: t });
      }

      return newApply;
    });

    // 7. Send notification to department supervisors if a department is specified
    if (job && job.required_department_id) {
      const supervisors = await DepartmentSupervisorModel.findAll({
        where: {
          department_id: job.required_department_id,
          is_active: true,
        }
      });

      if (supervisors && supervisors.length > 0) {
        // Fetch applicant's name for the notification message
        const applicantUser = await UserModel.findByPk(data.user_id);
        const decryptedApplicantUser = applicantUser ? decryptAndCleanUserData(applicantUser) : null;

        const applicantName = decryptedApplicantUser
          ? `${decryptedApplicantUser.first_name || ''} ${decryptedApplicantUser.last_name || ''}`.trim()
          : 'ผู้สมัครใหม่';

        const title = "มีผู้สมัครงานใหม่";
        const message = `${applicantName} ได้สมัครงานในตำแหน่ง "${job.job_title}"`;
        const supervisorUserIds = supervisors.map(supervisor => supervisor.user_id).join(',');

        const notificationPayload = {
          title: title,
          message: message,
          target_channel: "user",
          target_value: supervisorUserIds,
          notification_type_id: 2,
          data: {
            topic: "New Applicant",
            url: `https://partner.mediact.biz/partners/schedule/staff-schedule-manage/?departmentId=${job.required_department_id}`
          },
        };

        await NotificationsService.sendNotification(notificationPayload);
      }
    }

    return apply;

  } catch (error: any) {
    // Error handling logic (currently commented out, can be enabled if needed)
    // const jobTitle = job ? `สำหรับตำแหน่ง "${job.job_title}"` : '';
    // if (error.message === "Job is already closed" || error.message === "Job quota is full") {
    //   const message = error.message === "Job is already closed" 
    //     ? `งานนี้ถูกปิดรับสมัครแล้ว ${jobTitle}`
    //     : `มีผู้สมัครครบตามโควต้าแล้ว ${jobTitle}`;
    //   await NotificationsService.sendNotification({
    //     title: "สมัครงานไม่สำเร็จ",
    //     message: message,
    //     target_channel: "user",
    //     target_value: data.user_id?.toString(),
    //     data: { jobId: data.job_id, action: "open_job", topic: "Job Apply" }
    //   });
    // }
    throw error;
  }
}


export const updateJobApply = async (id: number, updates: Partial<JobApplyModel>) => {
  const apply = await JobApplyModel.findByPk(id);
  if (!apply) throw new Error("Job application not found");
  const updated = await apply.update(updates);

  await NotificationsService.sendNotification({
    title: "อัปเดตการสมัครงาน",
    message: `การสมัครงาน ${updated.id} ถูกอัปเดต`,
    notification_type_id: 2,
    target_channel: "user",
    target_value: updated.user_id?.toString(),
    data: { jobApplyId: updated.id },
  });

  return updated;
};

export const deleteJobApply = async (id: number) => {
  const apply = await JobApplyModel.findByPk(id);
  if (!apply) throw new Error("Job application not found");
  await apply.destroy();

  await NotificationsService.sendNotification({
    title: "ลบการสมัครงาน",
    message: `การสมัครงาน ${apply.id} ถูกลบแล้ว`,
    notification_type_id: 2,
    target_channel: "user",
    target_value: apply.user_id?.toString(),
    data: { jobApplyId: apply.id },
  });

  return apply;
};

export const getJobApplyById = async (id: number) => {
  const apply = await JobApplyModel.findByPk(id, {
    include: [
      {
        model: JobModel,
        as: "job",
        attributes: [
          "id", "job_title", "job_description", "work_date", "start_time", "end_time",
          "required_role_id", "required_department_id", "is_public", "status_id"
        ],
        include: [
          {
            model: JobStatusModel,
            as: "job_status",
            attributes: ["id", "name", "description", "is_active"]
          },
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["id", "name", "type_id", "facility_id", "is_active"],
            include: [
              {
                model: FacilityModel,
                as: "facility",
                attributes: ["id", "name", "type_id", "latitude", "longitude", "address", "is_active"]
              }
            ]
          },
          {
            model: RoleModel,
            as: "role",
            attributes: ["id", "name", "description", "sort_order", "is_active"]
          }
        ]
      },
      {
        model: UserModel,
        as: "user",
        attributes: getUserAttributes()
      },
      {
        model: UserModel,
        as: "approver",
        attributes: getUserAttributes()
      }
    ]
  });

  if (!apply) throw new Error("Job application not found");

  // Decrypt user data
  const applyData = apply.get({ plain: true });

  // Decrypt user data
  if (applyData.user) {
    applyData.user = decryptAndCleanUserData(applyData.user);
  }

  // Decrypt approver data
  if (applyData.approver) {
    applyData.approver = decryptAndCleanUserData(applyData.approver);
  }

  return applyData;
};

export const getAllJobApplies = async () => {
  const jobApplies = await JobApplyModel.findAll({
    order: [["created_at", "DESC"]],
    include: [
      {
        model: JobModel,
        as: "job",
        attributes: [
          "id", "job_title", "job_description", "work_date", "start_time", "end_time",
          "required_role_id", "required_department_id", "is_public", "status_id"
        ],
        include: [
          {
            model: JobStatusModel,
            as: "job_status",
            attributes: ["id", "name", "description", "is_active"]
          },
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["id", "name", "type_id", "facility_id", "is_active"],
            include: [
              {
                model: FacilityModel,
                as: "facility",
                attributes: ["id", "name", "type_id", "latitude", "longitude", "address", "is_active"]
              }
            ]
          },
          {
            model: RoleModel,
            as: "role",
            attributes: ["id", "name", "description", "sort_order", "is_active"]
          }
        ]
      },
      {
        model: UserModel,
        as: "user",
        attributes: getUserAttributes()
      },
      {
        model: UserModel,
        as: "approver",
        attributes: getUserAttributes()
      }
    ]
  });

  // Decrypt user data
  const processedJobApplies = jobApplies.map((jobApply: any) => {
    const jobApplyData = jobApply.get({ plain: true });

    // Decrypt user data
    if (jobApplyData.user) {
      jobApplyData.user = decryptAndCleanUserData(jobApplyData.user);
    }

    // Decrypt approver data
    if (jobApplyData.approver) {
      jobApplyData.approver = decryptAndCleanUserData(jobApplyData.approver);
    }

    return jobApplyData;
  });

  return processedJobApplies;
};

const APPLY_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3
};

interface JobApplyWithJob extends JobApplyModel {
  job: JobModel;
}

export const approveJobApply = async (id: number, approveUserId: number, remark?: string) => {
  let rejectedUserIds: number[] = [];
  let jobDetails: any = null;

  const updatedApply = await sequelize.transaction(async (t) => {

    // ดึงข้อมูลใบสมัครและ Job
    const apply = await JobApplyModel.findByPk(id, {
      include: [
        {
          model: JobModel,
          as: 'job',
          include: [
            { model: DepartmentModel, as: 'department' } // Include department to get facility_id easily
          ]
        }
      ],
      transaction: t,
    }) as any;

    if (!apply || !apply.job) {
      throw new Error('Application or associated job not found');
    }

    jobDetails = apply.job as JobModel;
    const department = (apply.job as any).department as DepartmentModel;

    if (!department) {
      throw new Error('Department associated with the job not found');
    }

    // อัปเดตสถานะใบสมัคร
    const result = await apply.update({
      status_id: APPLY_STATUS.APPROVED,
      approve_user_id: approveUserId,
      approve_date: new Date(),
      remark: remark || null,
      updated_by: approveUserId,
    }, { transaction: t });

    await UserEmploymentModel.findOrCreate({
      where: {
        user_id: apply.user_id,
        department_id: jobDetails.required_department_id!,
        is_active: true
      },
      defaults: {
        facility_id: department.facility_id,
        position_id: (jobDetails as any).job_title || 'Part-time Staff',
        start_date: jobDetails.work_date,
        is_part_time: false,
        is_job_applicant: true,
        created_by: approveUserId,
        updated_by: approveUserId,
      },
      transaction: t
    });

    const jobDate = new Date(jobDetails.work_date);
    const jobMonth = jobDate.getMonth() + 1; // 1-12
    const jobYear = jobDate.getFullYear();

    let scheduleMaster = await ScheduleMasterModel.findOne({
      where: {
        department_id: jobDetails.required_department_id,
        month: jobMonth,
        year: jobYear
      },
      transaction: t
    });

    if (!scheduleMaster) {
      scheduleMaster = await ScheduleMasterModel.create({
        department_id: jobDetails.required_department_id!,
        facility_id: department.facility_id,
        date: new Date(jobYear, jobMonth - 1, 1), // วันที่ 1 ของเดือน
        month: jobMonth,
        year: jobYear,
        status_id: 1, // Draft
        is_active: true,
        created_by: approveUserId
      } as any, { transaction: t });
    }

    const shiftType = await ShiftTypeModel.findOne({
      where: {
        department_id: jobDetails.required_department_id,
        start_time: jobDetails.start_time,
        end_time: jobDetails.end_time,
        is_active: true
      },
      transaction: t
    });

    if (!shiftType) {
      throw new Error(`No matching Shift Type found for time ${jobDetails.start_time}-${jobDetails.end_time} in this department`);
    }

    const createdShift = await ScheduleShiftModel.create({
      schedule_master_id: scheduleMaster.id,
      shift_type_id: shiftType.id,
      employee_id: apply.user_id, // User ID ของผู้สมัครที่ถูก Approve
      facility_id: department.facility_id,
      department_id: jobDetails.required_department_id!,
      shift_date: jobDetails.work_date,
      status_id: 1, // 1 = Scheduled/Active
      start_time: jobDetails.start_time,
      end_time: jobDetails.end_time,
      total_hours: shiftType.total_hours, // ดึงจาก Shift Type
      normal_hours: shiftType.normal_hours, // ดึงจาก Shift Type
      ot_hours: shiftType.ot_hours, // ดึงจาก Shift Type
      is_active: true,
      created_by: approveUserId,
      remarks: `Created from Job Application ID: ${apply.id}`, // Optional reference

      is_job_broadcast: true,
      job_apply_id: apply.id
    }, { transaction: t });

    await jobDetails.update({
      source_schedule_id: createdShift.id,
      status_id: JOB_STATUS.CLOSED,
    }, { transaction: t });

    if (jobDetails.max_applicants !== null && jobDetails.auto_close_type !== 'max_applicants') {

      // ค้นหาใบสมัครอื่น ๆ ที่ยังรอการพิจารณา
      const otherApplies = await JobApplyModel.findAll({
        where: {
          job_id: jobDetails.id,
          id: { [Op.ne]: id }, // ไม่รวมใบสมัครที่เพิ่งอนุมัติไป
          status_id: APPLY_STATUS.PENDING
        },
        transaction: t
      });

      if (otherApplies.length > 0) {
        const idsToReject = otherApplies.map(a => a.id);
        rejectedUserIds = otherApplies.map(a => a.user_id);

        // ปฏิเสธใบสมัครอื่น ๆ ทั้งหมด
        await JobApplyModel.update({
          status_id: APPLY_STATUS.REJECTED,
          approve_user_id: approveUserId,
          approve_date: new Date(),
          remark: 'ตำแหน่งงานนี้มีผู้ได้รับการคัดเลือกแล้ว',
          updated_by: approveUserId
        }, {
          where: {
            id: { [Op.in]: idsToReject }
          },
          transaction: t
        });
      }
    }

    return result;
  });

  if (jobDetails && updatedApply) {
    // Notification สำหรับผู้สมัครที่ได้รับการอนุมัติ
    await NotificationsService.sendNotification({
      title: 'การสมัครงานได้รับการอนุมัติ',
      message: `การสมัครงานสำหรับตำแหน่ง "${(jobDetails as JobModel).job_title}" ได้รับการอนุมัติแล้ว`,
      notification_type_id: 2,
      target_channel: 'user',
      target_value: updatedApply.user_id?.toString(),
      data: { jobId: updatedApply.job_id, action: "open_job", topic: "Job Apply", is_approved: true, notification_type_id: 2 },
    });

    const department = (jobDetails as any).department as DepartmentModel;
    if (department && department.facility_id) {
      try {
        await UserNotificationPreferenceService.upsertUserPreference(
          updatedApply.user_id,
          `jobs_facility_part_time_${department.facility_id}`,
          true
        );
      } catch (error) {
        console.error("Error upserting jobs_facility_part_time preference:", error);
      }
    }

    // Notification สำหรับผู้สมัครที่ถูกปฏิเสธโดยอัตโนมัติ
    for (const userId of rejectedUserIds) {
      await NotificationsService.sendNotification({
        title: 'แจ้งผลการสมัครงาน',
        message: `ขอขอบคุณสำหรับความสนใจในงาน "${(jobDetails as JobModel).job_title}" ขณะนี้มีผู้ได้รับการคัดเลือกแล้ว`,
        notification_type_id: 2,
        target_channel: 'user',
        target_value: userId.toString(),
        data: { jobId: (jobDetails as JobModel).id, action: "open_job", topic: "Job Apply", is_approved: false, notification_type_id: 2 },
      })
    }
  }

  return updatedApply;
}

export const rejectJobApply = async (id: number, approveUserId: number, remark?: string) => {
  const updatedApply = await sequelize.transaction(async (t) => {

    // ดึงข้อมูลใบสมัครและ Job
    const apply = await JobApplyModel.findByPk(id, {
      include: [{ model: JobModel, as: 'job' }],
      transaction: t,
    }) as JobApplyWithJob;

    if (!apply) {
      throw new Error('Job application not found');
    }

    if (!apply.job) {
      throw new Error('Associated job not found for this application');
    }

    // อัปเดตสถานะใบสมัคร
    const result = await apply.update({
      status_id: APPLY_STATUS.REJECTED,
      approve_user_id: approveUserId,
      approve_date: new Date(),
      remark: remark || null,
      updated_by: approveUserId,
    }, { transaction: t });

    return result;
  });

  await NotificationsService.sendNotification({
    title: 'แจ้งผลการสมัครงาน',
    message: `ขอขอบคุณสำหรับความสนใจของคุณในงาน "${updatedApply.job.job_title}" ครั้งนี้ใบสมัครของคุณยังไม่ผ่านการพิจารณา `,
    notification_type_id: 2,
    target_channel: 'user',
    target_value: updatedApply.user_id?.toString(),
    data: { jobId: updatedApply.job_id, action: "open_job", topic: "Job Apply", is_approved: false, notification_type_id: 2 },
  });

  return updatedApply;
}