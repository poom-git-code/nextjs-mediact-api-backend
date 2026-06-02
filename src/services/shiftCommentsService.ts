import SwapRequestModel from "../models/SwapRequestModel";
import ShiftComment from "../models/ShiftCommentsModel";
import ShiftTypeModel from "../models/ShiftTypesModel";
import SwapRequest from "../models/SwapRequestModel";
import { Op } from "sequelize";
import UserModel from "../models/UserModel";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";
import { decryptAndCleanUserData, getUserAttributes } from "../utils/encryptedFieldMapping";

export const createShiftComment = async (
  shift_id: number,
  user_id: number,
  swap_request_id: number | null,
  description: string
) => {
  return await ShiftComment.create({
    shift_id,
    user_id,
    swap_request_id,
    description,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

export const getShiftComments = async () => {
  return await ShiftComment.findAll();
};

export const getShiftCommentsByShiftId = async (
  userId: number,
  shift_id: number
) => {
  const shiftComments = await ShiftComment.findAll({
    where: { shift_id },
    include: [
      {
        association: "user",
        attributes: getUserAttributes(),
      },
      {
        association: "swap_request",
        attributes: ["id", "status", "approve_date", "target_approve_status", "target_approve_date", "created_at", "updated_at"],
      },
    ],
  });

  if (!shiftComments || shiftComments.length === 0) {
    throw new Error("No comments found for this shift.");
  }

  return shiftComments.map((comment) => {
    // Decrypt user data if available
    const decryptedUser = comment.user ? decryptAndCleanUserData(comment.user) : null;
    
    return {
      user: decryptedUser,
      swap_request: comment.swap_request,
      shift_comment: {
        id: comment.id,
        description: comment.description,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
      },
    };
  });
};

// Master
export const getShiftCommentsByShiftIdMaster = async (
  userId: number,
  shift_id: number
) => {
  // 1. หา swap_requests ที่ user เป็น requester โดยใช้ shift_id หรือ swap_shift_id
  const requesterSwapRequests = await SwapRequest.findAll({
    where: {
      [Op.or]: [
        {
          user_id: userId,
          shift_id: shift_id,
        },
        {
          user_id: userId,
          swap_shift_id: shift_id,
        },
      ],
    },
    order: [["created_at", "DESC"]],
  });

  // 2. หา swap_request ที่ user เป็น target โดยใช้ shift_id หรือ swap_shift_id
  const targeterSwapRequests = await SwapRequest.findAll({
    where: {
      [Op.or]: [
        {
          target_user_id: userId,
          shift_id: shift_id,
        },
        {
          target_user_id: userId,
          swap_shift_id: shift_id,
        },
      ],
    },
    order: [["created_at", "DESC"]],
  });

  let swapRequestIds: number[] = [];
  let currentSwapRequest: any = null;
  let commentsArray: any[] = [];

  // 3. ดึง swap_request_id ตามเงื่อนไข
  if (requesterSwapRequests.length > 0) {
    // ประมวลผลแต่ละ swap request
    for (const swapRequest of requesterSwapRequests) {
      currentSwapRequest = swapRequest;
      swapRequestIds.push(swapRequest.id);

      // ดึง comments ของ swap_request นี้ ยกเว้นของตัวเอง
      const comments = await ShiftComment.findAll({
        where: {
          swap_request_id: swapRequest.id,
          user_id: { [Op.ne]: userId },
        },
        include: [
          {
            association: "user",
            attributes: getUserAttributes(),
          },
          {
            association: "swap_request",
            attributes: [
              "id",
              "status",
              "approve_date",
              "user_id",
              "target_user_id",
              "target_approve_status",
              "target_approve_date",
              "created_at",
              "updated_at",
            ],
          },
        ],
        order: [["created_at", "ASC"]],
      });

      // เพิ่ม comments ที่มีอยู่แล้วเข้าไปใน array
      commentsArray.push(...comments);

      // ตรวจสอบว่ามี targeter comment สำหรับ swap_request นี้หรือไม่
      const hasTargeterComment = comments.some(
        (comment) => comment.user.id === currentSwapRequest.target_user_id
      );

      if (!hasTargeterComment) {
        const targetUser = await UserModel.findByPk(
          currentSwapRequest.target_user_id,
          {
            attributes: getUserAttributes(),
          }
        );

        if (targetUser) {
          let placeholderDescription = "รอการตอบรับจาก ผู้ที่ถูกขอ";

          // ถ้า status เป็น DECLINED ให้แสดงข้อความที่เหมาะสม
          if (
            currentSwapRequest.target_approve_status?.toLowerCase() ===
            "declined"
          ) {
            placeholderDescription = "ปฏิเสธการสลับเวร";
          } else if (
            currentSwapRequest.target_approve_status?.toLowerCase() ===
            "approved"
          ) {
            placeholderDescription = "อนุมัติการสลับเวร";
          }

          // Decrypt user data before adding to array
          const decryptedTargetUser = decryptAndCleanUserData(targetUser);

          commentsArray.push({
            user: {
              ...decryptedTargetUser,
              role_in_swap: "targeter",
            },
            swap_request: {
              id: currentSwapRequest.id,
              status: currentSwapRequest.status,
              approve_date: currentSwapRequest.approve_date,
              user_id: currentSwapRequest.user_id,
              target_user_id: currentSwapRequest.target_user_id,
              target_approve_status: currentSwapRequest.target_approve_status,
              target_approve_date: currentSwapRequest.target_approve_date,
              created_at: currentSwapRequest.created_at,
              updated_at: currentSwapRequest.updated_at,
            },
            shift_comment: {
              id: null,
              description: placeholderDescription,
              created_at: currentSwapRequest.created_at,
              updated_at: currentSwapRequest.updated_at,
            },
          } as any);
        }
      }

      // เพิ่ม Supervisor placeholder ถ้า status เป็น approved และยังไม่มี supervisor comment
      if (
        currentSwapRequest.target_approve_status?.toLowerCase() === "approved"
      ) {
        const hasSupervisorComment = comments.some((comment) => {
          const userRole =
            comment.user.id === currentSwapRequest.target_user_id
              ? "targeter"
              : comment.user.id === currentSwapRequest.user_id
              ? "requester"
              : "supervisor";
          return (
            userRole === "supervisor" &&
            comment.swap_request.id === currentSwapRequest.id
          );
        });

        if (!hasSupervisorComment) {
          commentsArray.push({
            user: {
              id: 0, // placeholder id
              username: "supervisor",
              first_name: "Supervisor",
              last_name: "",
              email: "",
              profile_picture: null,
              role_in_swap: "supervisor",
            },
            swap_request: {
              id: currentSwapRequest.id,
              status: currentSwapRequest.status,
              approve_date: currentSwapRequest.approve_date,
              user_id: currentSwapRequest.user_id,
              target_user_id: currentSwapRequest.target_user_id,
              target_approve_status: currentSwapRequest.target_approve_status,
              target_approve_date: currentSwapRequest.target_approve_date,
              created_at: currentSwapRequest.created_at,
              updated_at: currentSwapRequest.updated_at,
            },
            shift_comment: {
              id: null,
              description: "รอความเห็นจาก หัวหน้าแผนก",
              created_at: "",
              updated_at: currentSwapRequest.updated_at,
            },
          } as any);
        }
      }
    }

    // เรียงลำดับ comments ตาม created_at
    commentsArray.sort((a, b) => {
      const dateA = new Date(
        (a as any).shift_comment?.created_at || a.created_at
      );
      const dateB = new Date(
        (b as any).shift_comment?.created_at || b.created_at
      );
      return dateA.getTime() - dateB.getTime();
    });

    const mappedComments = commentsArray.map((comment) => {
      let userRole = "supervisor";

      // ตรวจสอบว่าเป็น placeholder comment หรือ real comment
      const isPlaceholder =
        (comment as any).shift_comment &&
        (comment as any).shift_comment.id === null;

      if (isPlaceholder) {
        // สำหรับ placeholder comments ใช้ role ที่กำหนดไว้แล้ว
        userRole = comment.user.role_in_swap || "supervisor";
      } else {
        // สำหรับ real comments ใช้ comment.swap_request
        if (comment.swap_request) {
          if (comment.user.id === comment.swap_request.target_user_id) {
            userRole = "targeter";
          } else if (comment.user.id === comment.swap_request.user_id) {
            userRole = "requester";
          }
        }
      }

      return {
        user: {
          ...decryptAndCleanUserData(comment.user.toJSON ? comment.user.toJSON() : comment.user),
          role_in_swap: userRole,
        },
        swap_request: comment.swap_request,
        shift_comment: (comment as any).shift_comment || {
          id: comment.id,
          description: comment.description,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
        },
      };
    });

    return {
      user_current_role_in_swap: "requester",
      comments: mappedComments,
    };
  } else if (targeterSwapRequests.length > 0) {
    // Logic เดียวกันสำหรับ targeter case แต่ใช้ [Op.or] condition
    const swapRequestId = targeterSwapRequests[0].id;
    currentSwapRequest = targeterSwapRequests[0];

    const comments = await ShiftComment.findAll({
      where: {
        swap_request_id: swapRequestId,
        user_id: { [Op.ne]: userId },
      },
      include: [
        {
          association: "user",
          attributes: getUserAttributes(),
        },
        {
          association: "swap_request",
          attributes: [
              "id",
              "status",
              "approve_date",
              "user_id",
              "target_user_id",
              "target_approve_status",
              "target_approve_date",
              "created_at",
              "updated_at",
            ],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    const mappedComments = comments.map((comment) => {
      let userRole = "supervisor";

      // ตรวจสอบว่าเป็น placeholder comment หรือ real comment
      const isPlaceholder =
        (comment as any).shift_comment &&
        (comment as any).shift_comment.id === null;

      if (isPlaceholder) {
        // for placeholder comments use role_
        userRole = comment.user.role_in_swap || "supervisor";
      } else {
        // for real comments use comment.swap_request
        if (comment.swap_request) {
          if (comment.user.id === comment.swap_request.target_user_id) {
            userRole = "targeter";
          } else if (comment.user.id === comment.swap_request.user_id) {
            userRole = "requester";
          }
        }
      }

      return {
        user: {
          ...decryptAndCleanUserData(comment.user.toJSON ? comment.user.toJSON() : comment.user),
          role_in_swap: userRole,
        },
        swap_request: comment.swap_request,
        shift_comment: {
          id: comment.id,
          description: comment.description,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
        },
      };
    });

    return {
      user_current_role_in_swap: "targeter",
      comments: mappedComments,
    };
  } else {
    return {
      user_current_role_in_swap: "supervisor",
      comments: [],
    };
  }
};

// not test yet
export const getShiftCommentById = async (id: number) => {
  const shiftComment = await ShiftComment.findByPk(id);
  if (!shiftComment) {
    throw new Error("Shift comment not found.");
  }
  return shiftComment;
};

// not test yet
export const updateShiftComment = async (id: number, description: string) => {
  const shiftComment = await ShiftComment.findByPk(id);
  if (!shiftComment) {
    throw new Error("Shift comment not found.");
  }
  shiftComment.description = description;
  shiftComment.updated_at = new Date();
  return await shiftComment.save();
};

// not test yet
export const deleteShiftComment = async (id: number) => {
  const shiftComment = await ShiftComment.findByPk(id);
  if (!shiftComment) {
    throw new Error("Shift comment not found.");
  }
  return await shiftComment.destroy();
};

export const getSwapRequestCommentsToTarget = async (
  swapRequestId: number,
  userId: number
) => {
  const swapRequest = await SwapRequestModel.findOne({
    where: { id: swapRequestId },
    attributes: [
      "id",
      "shift_id",
      "swap_shift_id",
      "user_id",
      "target_user_id",
      "status",
      "target_approve_status",
    ],
    include: [
      {
        association: "requester",
        attributes: getUserAttributes(),
      },
      {
        association: "targetUser",
        attributes: getUserAttributes(),
      },
      {
        association: "requestShift",
        attributes: [
          "id",
          "shift_date",
          "start_time",
          "end_time",
          "shift_type_id",
        ],
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
          },
        ],
      },
      {
        association: "swapShift",
        attributes: [
          "id",
          "shift_date",
          "start_time",
          "end_time",
          "shift_type_id",
        ],
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
          },
        ],
      },
    ],
  });

  if (!swapRequest) {
    throw new Error("Swap request not found");
  }

  const shiftComments = await ShiftComment.findAll({
    where: { swap_request_id: swapRequestId },
    include: [
      {
        association: "user",
        attributes: getUserAttributes(),
      },
    ],
    order: [["created_at", "ASC"]],
  });

  // กำหนด role ของ current user
  let currentUserRole = "supervisor"; // default
  if (userId === swapRequest.target_user_id) {
    currentUserRole = "targeter";
  } else if (userId === swapRequest.user_id) {
    currentUserRole = "requester";
  }

  // กำหนด role_in_swap สำหรับแต่ละ comment
  const commentsWithRole = shiftComments.map((comment) => {
    let userRole = "supervisor"; // default

    if (comment.user.id === swapRequest.target_user_id) {
      userRole = "targeter";
    } else if (comment.user.id === swapRequest.user_id) {
      userRole = "requester";
    }

    return {
      id: comment.id,
      description: comment.description,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        ...decryptAndCleanUserData(comment.user.toJSON ? comment.user.toJSON() : comment.user),
        role_in_swap: userRole,
      },
    };
  });

  return {
    current_user_role: currentUserRole,
    swap_request: {
      id: swapRequest.id,
      status: swapRequest.status,
      target_approve_status: swapRequest.target_approve_status,
      requester: {
        ...decryptAndCleanUserData(swapRequest.requester?.toJSON
          ? swapRequest.requester.toJSON()
          : swapRequest.requester || {}),
        role_in_swap: "requester",
      },
      target_user: {
        ...decryptAndCleanUserData(swapRequest.targetUser?.toJSON
          ? swapRequest.targetUser.toJSON()
          : swapRequest.targetUser || {}),
        role_in_swap: "targeter",
      },
      shift: swapRequest.requestShift,
      swap_shift: swapRequest.swapShift,
    },
    comments: commentsWithRole,
  };
};
