import SwapRequestModel from "../models/SwapRequestModel";
import UserModel from "../models/UserModel";
import ScheduleShiftModel from "../models/ScheduleShiftsModel";
import ShiftTypeModel from "../models/ShiftTypesModel";
import ShiftCommentsModel from "../models/ShiftCommentsModel";
import * as NotificationsService from "../services/notificationsService";
import { createShiftComment } from "./shiftCommentsService";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";
import { decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";
import { describe } from "node:test";

const notifySupervisors = async (
  userId: number,
  title: string,
  message: string,
  data: any
) => {
  try {
    const userWithEmployment = await UserModel.findOne({
      where: { id: userId },
      include: [
        {
          model: UserEmploymentModel,
          as: "user_employment",
          where: { is_active: true },
          required: false,
        },
      ],
    });

    const user_employment = userWithEmployment?.user_employment as
      | UserEmploymentModel[]
      | undefined;

    if (!user_employment || user_employment.length === 0) {
      console.log(`No employment data found for user ${userId}`);
      return;
    }

    const departmentId = user_employment[0].department_id;
    if (!departmentId) {
      console.log(`No department_id found for user ${userId}`);
      return;
    }

    const supervisors = await DepartmentSupervisorModel.findAll({
      where: { department_id: departmentId },
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: getBasicUserAttributes(),
          required: true,
        },
      ],
    });

    for (const supervisor of supervisors) {
      await NotificationsService.sendNotification({
        title,
        message,
        notification_type_id: 1,
        target_channel: "user",
        target_value: supervisor.user_id.toString(),
        data,
      });
    }
  } catch (error) {
    console.error("Error sending notification to supervisors:", error);
  }
};

export const createSwapRequest = async (data: any) => {
  const swap = await SwapRequestModel.create({
    ...data,
    target_user_id: data.target_user_id,
    swap_shift_id: data.swap_shift_id,
  });

  const requesterUser = await UserModel.findByPk(swap.user_id, {
    attributes: getUserAttributes(),
  });

  const targetUser = await UserModel.findByPk(swap.target_user_id, {
    attributes: getUserAttributes(),
  });

  // Decrypt user data for display
  const decryptedRequesterUser = requesterUser ? decryptAndCleanUserData(requesterUser) : null;
  const decryptedTargetUser = targetUser ? decryptAndCleanUserData(targetUser) : null;

  const requesterName = decryptedRequesterUser
    ? `${decryptedRequesterUser.first_name} ${decryptedRequesterUser.last_name}`
    : `User ${swap.user_id}`;

  const targetName = decryptedTargetUser
    ? `${decryptedTargetUser.first_name} ${decryptedTargetUser.last_name}`
    : `User ${swap.target_user_id}`;

  await NotificationsService.sendNotification({
    title: "มีคำขอสลับเวร",
    message: `มีคำขอสลับเวรใหม่จากคุณ ${requesterName} ถึงคุณ`,
    notification_type_id: 1,
    target_channel: "user",
    // target_value: swap.user_id.toString(),
    target_value: swap.target_user_id.toString(),
    data: {action: "open_swap_request_detail_friend", topic: "Swap Request", description: "WAITING FOR TARGET USER APPROVAL", swapRequestId: swap.id, shiftId: swap.shift_id },
  });

  return swap;
};

export const updateSwapRequest = async (
  id: number,
  updates: Partial<SwapRequestModel>
) => {
  const swap = await SwapRequestModel.findByPk(id);
  if (!swap) throw new Error("Swap request not found");
  const updated = await swap.update(updates);

  // await NotificationsService.sendNotification({
  //   title: "อัปเดตคำขอสลับเวร",
  //   message: `คำขอสลับเวร ${updated.id} ถูกอัปเดต`,
  //   target_channel: "user",
  //   target_value: updated.user_id.toString(),
  //   data: { swapRequestId: updated.id },
  // });

  return updated;
};

export const deleteSwapRequest = async (id: number) => {
  const swap = await SwapRequestModel.findByPk(id);
  if (!swap) throw new Error("Swap request not found");
  await swap.destroy();

  // await NotificationsService.sendNotification({
  //   title: "ลบคำขอสลับเวร",
  //   message: `คำขอสลับเวร ${swap.id} ถูกลบแล้ว`,
  //   target_channel: "user",
  //   target_value: swap.user_id.toString(),
  //   data: { swapRequestId: swap.id },
  // });

  return swap;
};


export const getSwapRequestByIdMobile = async (id: number, userId?: number) => {
  const swapRequest = await SwapRequestModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: ScheduleShiftModel,
        as: "swapShift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ShiftCommentsModel,
        as: "shift_comments",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
    ],
  });
  if (!swapRequest) throw new Error("Swap request not found");

  // Convert to plain object for processing
  const swapRequestData = swapRequest.get({ plain: true });

  // Decrypt user data
  if (swapRequestData.user) {
    swapRequestData.user = decryptAndCleanUserData(swapRequestData.user);
  }
  if (swapRequestData.approve_user) {
    swapRequestData.approve_user = decryptAndCleanUserData(swapRequestData.approve_user);
  }
  if (swapRequestData.targetUser) {
    swapRequestData.targetUser = decryptAndCleanUserData(swapRequestData.targetUser);
  }
  if (swapRequestData.shift && swapRequestData.shift.employee) {
    swapRequestData.shift.employee = decryptAndCleanUserData(swapRequestData.shift.employee);
  }
  if (swapRequestData.swapShift && swapRequestData.swapShift.employee) {
    swapRequestData.swapShift.employee = decryptAndCleanUserData(swapRequestData.swapShift.employee);
  }

  // Add role information if userId is provided
  if (userId) {
    // Determine current user's role
    let userCurrentRole = "supervisor";
    if (swapRequestData.user_id === userId) {
      userCurrentRole = "requester";
    } else if (swapRequestData.target_user_id === userId) {
      userCurrentRole = "targeter";
    }
    swapRequestData.user_current_role_in_swap = userCurrentRole;

    // Add role_in_swap to each comment user
    if (swapRequestData.shift_comments && swapRequestData.shift_comments.length > 0) {
      swapRequestData.shift_comments = swapRequestData.shift_comments.map((comment: any) => {
        if (comment.user) {
          // Decrypt comment user data
          comment.user = decryptAndCleanUserData(comment.user);
          
          // Determine comment user's role
          let commentUserRole = "supervisor";
          if (comment.user.id === swapRequestData.user_id) {
            commentUserRole = "requester";
          } else if (comment.user.id === swapRequestData.target_user_id) {
            commentUserRole = "targeter";
          }
          comment.user.role_in_swap = commentUserRole;
        }
        return comment;
      });
    }
  } else {
    // Decrypt comment users even without userId
    if (swapRequestData.shift_comments && swapRequestData.shift_comments.length > 0) {
      swapRequestData.shift_comments.forEach((comment: any) => {
        if (comment.user) {
          comment.user = decryptAndCleanUserData(comment.user);
        }
      });
    }
  }

  return swapRequestData;
};

export const getSwapRequestById = async (id: number) => {
  const swapRequest = await SwapRequestModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: ScheduleShiftModel,
        as: "swapShift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ShiftCommentsModel,
        as: "shift_comments",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
    ],
  });
  if (!swapRequest) throw new Error("Swap request not found");

  return swapRequest;
};

export const getAllSwapRequests = async () => {
  const swapRequests = await SwapRequestModel.findAll({
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: ScheduleShiftModel,
        as: "swapShift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ShiftCommentsModel,
        as: "shift_comments",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Decrypt user data in swap requests
  const processedRequests = swapRequests.map((request: any) => {
    const requestData = request.get({ plain: true });
    
    if (requestData.user) {
      requestData.user = decryptAndCleanUserData(requestData.user);
    }
    if (requestData.approve_user) {
      requestData.approve_user = decryptAndCleanUserData(requestData.approve_user);
    }
    if (requestData.targetUser) {
      requestData.targetUser = decryptAndCleanUserData(requestData.targetUser);
    }
    if (requestData.shift && requestData.shift.employee) {
      requestData.shift.employee = decryptAndCleanUserData(requestData.shift.employee);
    }
    if (requestData.swapShift && requestData.swapShift.employee) {
      requestData.swapShift.employee = decryptAndCleanUserData(requestData.swapShift.employee);
    }
    if (requestData.shift_comments && requestData.shift_comments.length > 0) {
      requestData.shift_comments.forEach((comment: any) => {
        if (comment.user) {
          comment.user = decryptAndCleanUserData(comment.user);
        }
      });
    }

    return requestData;
  });

  return processedRequests;
};

export const getSwapRequestsByDepartmentMonthYear = async (
  departmentId: number,
  month: number,
  year: number
) => {
  const swapRequests = await SwapRequestModel.findAll({
    where: {
      month,
      year,
    },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        where: { department_id: departmentId },
        required: true,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: ScheduleShiftModel,
        as: "swapShift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ShiftCommentsModel,
        as: "shift_comments",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return swapRequests;
};

export const getSwapRequestsByUserId = async (user_id: number) => {
  const swapRequests = await SwapRequestModel.findAll({
    where: { user_id },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: ScheduleShiftModel,
        as: "swapShift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ShiftCommentsModel,
        as: "shift_comments",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return swapRequests;
};

export const getSwapRequestsFromFriend = async (target_user_id: number) => {
  const swapRequests = await SwapRequestModel.findAll({
    where: { target_user_id },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: ScheduleShiftModel,
        as: "swapShift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ShiftCommentsModel,
        as: "shift_comments",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return swapRequests;
};

export const getSwapRequestsForSupervisor = async (userId: number) => {
  // Get user's supervised departments
  const supervisedDepartments = await DepartmentSupervisorModel.findAll({
    where: {
      user_id: userId,
      is_active: true,
    },
    attributes: ["department_id"],
  });

  if (!supervisedDepartments || supervisedDepartments.length === 0) {
    return [];
  }

  const departmentIds = supervisedDepartments.map((dept) => dept.department_id);

  // Get swap requests where shift's department matches supervised departments
  const swapRequests = await SwapRequestModel.findAll({
    where: {
      target_approve_status: "APPROVED",
    },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: true,
        where: {
          department_id: departmentIds,
        },
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: ScheduleShiftModel,
        as: "swapShift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ShiftCommentsModel,
        as: "shift_comments",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserWithUsernameAttributes(),
            required: false,
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Decrypt user data in swap requests
  const processedRequests = swapRequests.map((request: any) => {
    const requestData = request.get({ plain: true });

    // Decrypt user data
    if (requestData.user) {
      requestData.user = decryptAndCleanUserData(requestData.user);
    }
    if (requestData.approve_user) {
      requestData.approve_user = decryptAndCleanUserData(requestData.approve_user);
    }
    if (requestData.targetUser) {
      requestData.targetUser = decryptAndCleanUserData(requestData.targetUser);
    }
    if (requestData.shift && requestData.shift.employee) {
      requestData.shift.employee = decryptAndCleanUserData(requestData.shift.employee);
    }
    if (requestData.swapShift && requestData.swapShift.employee) {
      requestData.swapShift.employee = decryptAndCleanUserData(requestData.swapShift.employee);
    }

    // Decrypt shift comments users
    if (requestData.shift_comments && Array.isArray(requestData.shift_comments)) {
      requestData.shift_comments = requestData.shift_comments.map((comment: any) => {
        if (comment.user) {
          comment.user = decryptAndCleanUserData(comment.user);
        }
        return comment;
      });
    }

    return requestData;
  });

  return processedRequests;
};

export const updateApproveSwapRequest = async (
  swapShiftId: number,
  comment: string,
  userId: number
) => {
  const swapRequest = await SwapRequestModel.findOne({
    where: { swap_shift_id: swapShiftId },
  });

  if (!swapRequest) {
    throw new Error("Swap request not found");
  }

  swapRequest.target_approve_status = "APPROVED";
  swapRequest.target_approve_date = new Date();
  await swapRequest.save();

  await createShiftComment(
    swapRequest.shift_id,
    userId,
    swapRequest.id,
    comment
  );

  const targetUser = await UserModel.findByPk(swapRequest.target_user_id, {
    attributes: getUserAttributes(),
  });

  // Decrypt user data for display
  const decryptedTargetUser = targetUser ? decryptAndCleanUserData(targetUser) : null;

  const targetName = decryptedTargetUser
    ? `${decryptedTargetUser.first_name} ${decryptedTargetUser.last_name}`
    : `User ${swapRequest.target_user_id}`;

  await NotificationsService.sendNotification({
    title: "คำขอสลับเวรได้รับการอนุมัติ",
    message: `${targetName} ได้อนุมัติการสลับเวรของคุณแล้ว รอการอนุมัติจากหัวหน้าแผนก`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: swapRequest.user_id.toString(),
    data: {
      action: "open_swap_request_detail",
      topic: "Swap Request",
      description: "TARGET APPROVED, WAITING FOR SUPERVISOR APPROVAL",
      swapRequestId: swapRequest.id,
      shiftId: swapRequest.shift_id,
      swapShiftId: swapRequest.swap_shift_id,
      status: "TARGET_APPROVED",
      target_approve_status: "APPROVED",
    },
  });

  const requesterUser = await UserModel.findByPk(swapRequest.user_id, {
    attributes: getUserAttributes(),
  });

  // Decrypt user data for display
  const decryptedRequesterUser = requesterUser ? decryptAndCleanUserData(requesterUser) : null;

  const requesterName = decryptedRequesterUser
    ? `${decryptedRequesterUser.first_name} ${decryptedRequesterUser.last_name}`
    : `User ${swapRequest.user_id}`;

  await notifySupervisors(
    swapRequest.user_id,
    "แจ้งขออนุมัติสลับเวร",
    `มีคำขอสลับเวรจากคุณ ${requesterName} กับ ${targetName} รอการอนุมัติจากท่าน`,
    {
      action: "open_swap_request_detail_supervisor",
      topic: "Swap Request",
      description: "WAITING FOR SUPERVISOR APPROVAL",
      swapRequestId: swapRequest.id,
      shiftId: swapRequest.shift_id,
      swapShiftId: swapRequest.swap_shift_id,
      requesterUserId: swapRequest.user_id,
      targetUserId: swapRequest.target_user_id,
      status: "WAITING_SUPERVISOR_APPROVAL",
    }
  );

  return swapRequest;
};

export const updateRejectSwapRequest = async (
  swapShiftId: number,
  comment: string,
  userId: number
) => {
  const swapRequest = await SwapRequestModel.findOne({
    where: { swap_shift_id: swapShiftId },
  });

  if (!swapRequest) {
    throw new Error("Swap request not found");
  }

  swapRequest.target_approve_status = "DECLINED";
  swapRequest.target_approve_date = new Date();
  await swapRequest.save();

  await createShiftComment(
    swapRequest.shift_id,
    userId,
    swapRequest.id,
    comment
  );

  const targetUser = await UserModel.findByPk(swapRequest.target_user_id, {
    attributes: getUserAttributes(),
  });

  // Decrypt user data for display
  const decryptedTargetUser = targetUser ? decryptAndCleanUserData(targetUser) : null;

  const targetName = decryptedTargetUser
    ? `${decryptedTargetUser.first_name} ${decryptedTargetUser.last_name}`
    : `User ${swapRequest.target_user_id}`;

  await NotificationsService.sendNotification({
    title: "คำขอสลับเวรไม่สำเร็จ",
    message: `${targetName} ไม่ประสงค์สลับเวรกับคุณ`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: swapRequest.user_id.toString(),
    data: {
      action: "open_swap_request_detail",
      topic: "Swap Request",
      description: "TARGET REJECTED",
      swapRequestId: swapRequest.id,
      shiftId: swapRequest.shift_id,
      swapShiftId: swapRequest.swap_shift_id,
      status: "TARGET_REJECTED",
      target_approve_status: "DECLINED",
      reason: comment,
      is_approved: false,
    },
  });

  // ส่ง notification ให้ supervisor เพื่อแจ้งว่าคำขอสลับเวรถูกปฏิเสธ
  const requesterUser = await UserModel.findByPk(swapRequest.user_id, {
    attributes: getUserAttributes(),
  });

  // Decrypt user data for display
  const decryptedRequesterUser = requesterUser ? decryptAndCleanUserData(requesterUser) : null;

  const requesterName = decryptedRequesterUser
    ? `${decryptedRequesterUser.first_name} ${decryptedRequesterUser.last_name}`
    : `User ${swapRequest.user_id}`;

  // await notifySupervisors(
  //   swapRequest.user_id,
  //   "คำขอสลับเวรถูกปฏิเสธ",
  //   `คำขอสลับเวรจาก ${requesterName} กับ ${targetName} ถูกปฏิเสธแล้ว เหตุผล: ${comment}`,
  //   {
  //     swapRequestId: swapRequest.id,
  //     shiftId: swapRequest.shift_id,
  //     swapShiftId: swapRequest.swap_shift_id,
  //     requesterUserId: swapRequest.user_id,
  //     targetUserId: swapRequest.target_user_id,
  //     status: "TARGET_REJECTED",
  //     reason: comment,
  //   }
  // );

  return swapRequest;
};

export const updateApproveSwapRequestSupervisor = async (
  // swapShiftId: number,
  swapRequestId: number,
  comment: string,
  userId: number
) => {
  const swapRequest = await SwapRequestModel.findOne({
    where: {
      id: swapRequestId,
      // swap_shift_id: swapShiftId,
    },
  });

  if (!swapRequest) {
    throw new Error("Swap request not found");
  }

  // Check if swap request is already approved or rejected
  if (swapRequest.status === "REJECTED" || swapRequest.status === "APPROVED") {
    throw new Error("Swap request has already been approved or rejected");
  }

  const originalShift = await ScheduleShiftModel.findByPk(swapRequest.shift_id);
  const swapShift = await ScheduleShiftModel.findByPk(
    swapRequest.swap_shift_id
  );

  if (!originalShift || !swapShift) {
    throw new Error("Shifts not found");
  }

  if (
    originalShift.employee_id !== swapRequest.user_id ||
    swapShift.employee_id !== swapRequest.target_user_id
  ) {
    throw new Error("Employee assignments do not match swap request");
  }

  // สลับ employee_id
  await originalShift.update({
    employee_id: swapRequest.target_user_id,
  });

  await swapShift.update({
    employee_id: swapRequest.user_id,
  });

  // อัปเดตสถานะ swap request
  swapRequest.status = "APPROVED";
  swapRequest.approve_user_id = userId;
  swapRequest.approve_date = new Date();
  await swapRequest.save();

  // เพิ่ม comment
  await createShiftComment(
    swapRequest.shift_id,
    userId,
    swapRequest.id,
    comment
  );

  const requesterUser = await UserModel.findByPk(swapRequest.user_id, {
    attributes: getUserAttributes(),
  });
  const targetUser = await UserModel.findByPk(swapRequest.target_user_id, {
    attributes: getUserAttributes(),
  });

  // Decrypt user data for display
  const decryptedRequesterUser = requesterUser ? decryptAndCleanUserData(requesterUser) : null;
  const decryptedTargetUser = targetUser ? decryptAndCleanUserData(targetUser) : null;

  const requesterName = decryptedRequesterUser
    ? `${decryptedRequesterUser.first_name} ${decryptedRequesterUser.last_name}`
    : `User ${swapRequest.user_id}`;
  const targetName = decryptedTargetUser
    ? `${decryptedTargetUser.first_name} ${decryptedTargetUser.last_name}`
    : `User ${swapRequest.target_user_id}`;

  // to requester user
  await NotificationsService.sendNotification({
    title: "อนุมัติการสลับเวร",
    message: `การสลับเวรของคุณกับ ${targetName} ได้รับอนุมัติแล้ว`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: swapRequest.user_id.toString(),
    data: {
      action: "open_swap_request_detail",
      topic: "Swap Request",
      description: "SUPERVISOR APPROVED",
      swapRequestId: swapRequest.id,
      originalShiftId: swapRequest.shift_id,
      newShiftId: swapRequest.swap_shift_id,
      status: "APPROVED",
      is_approved: true,
    },
  });

  // to target user
  await NotificationsService.sendNotification({
    title: "อนุมัติการสลับเวร",
    message: `การสลับเวรกับ ${requesterName} ได้รับอนุมัติแล้ว`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: swapRequest.target_user_id.toString(),
    data: {
      action: "open_swap_request_detail_friend",
      topic: "Swap Request",
      description: "SUPERVISOR APPROVED",
      swapRequestId: swapRequest.id,
      originalShiftId: swapRequest.swap_shift_id,
      newShiftId: swapRequest.shift_id,
      status: "APPROVED",
      is_approved: true,
    },
  });

  return {
    swapRequest,
    originalShift: await ScheduleShiftModel.findByPk(swapRequest.shift_id),
    swapShift: await ScheduleShiftModel.findByPk(swapRequest.swap_shift_id),
  };
};

export const updateRejectSwapRequestSupervisor = async (
  // swapShiftId: number,
  swapRequestId: number,
  comment: string,
  userId: number
) => {
  const swapRequest = await SwapRequestModel.findOne({
    // where: { swap_shift_id: swapShiftId },
    where: { id: swapRequestId },
  });

  if (!swapRequest) {
    throw new Error("Swap request not found");
  }

  // Check if swap request is already approved or rejected
  if (swapRequest.status === "REJECTED" || swapRequest.status === "APPROVED") {
    throw new Error("Swap request has already been approved or rejected");
  }

  swapRequest.status = "REJECTED";
  swapRequest.approve_user_id = userId;
  swapRequest.approve_date = new Date();
  await swapRequest.save();

  await createShiftComment(
    swapRequest.shift_id,
    userId,
    swapRequest.id,
    comment
  );

  const requesterUser = await UserModel.findByPk(swapRequest.user_id, {
    attributes: getUserAttributes(),
  });
  const targetUser = await UserModel.findByPk(swapRequest.target_user_id, {
    attributes: getUserAttributes(),
  });

  // Decrypt user data for display
  const decryptedRequesterUser = requesterUser ? decryptAndCleanUserData(requesterUser) : null;
  const decryptedTargetUser = targetUser ? decryptAndCleanUserData(targetUser) : null;

  const requesterName = decryptedRequesterUser
    ? `${decryptedRequesterUser.first_name} ${decryptedRequesterUser.last_name}`
    : `User ${swapRequest.user_id}`;
  const targetName = decryptedTargetUser
    ? `${decryptedTargetUser.first_name} ${decryptedTargetUser.last_name}`
    : `User ${swapRequest.target_user_id}`;

  // to requester user
  await NotificationsService.sendNotification({
    title: "ปฏิเสธการสลับเวร",
    message: `การสลับเวรของคุณกับ ${targetName} ถูกปฏิเสธ`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: swapRequest.user_id.toString(),
    data: {
      action: "open_swap_request_detail",
      topic: "Swap Request",
      description: "SUPERVISOR REJECTED",
      swapRequestId: swapRequest.id,
      originalShiftId: swapRequest.shift_id,
      newShiftId: swapRequest.swap_shift_id,
      status: "REJECTED",
      is_approved: false,
    },
  });

  // to target user
  await NotificationsService.sendNotification({
    title: "ปฏิเสธการสลับเวร",
    message: `การสลับเวรกับ ${requesterName} ถูกปฏิเสธ`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: swapRequest.target_user_id.toString(),
    data: {
      action: "open_swap_request_detail_friend",
      topic: "Swap Request",
      description: "SUPERVISOR REJECTED",
      swapRequestId: swapRequest.id,
      originalShiftId: swapRequest.swap_shift_id,
      newShiftId: swapRequest.shift_id,
      status: "REJECTED",
      is_approved: false,
    },
  });

  return swapRequest;
};
