import Rewards from "../models/checkinRewardsModel";
import RewardRedemptions from "../models/checkinRewardRedemptionsModel";
import UserPoints from "../models/userPointsModel";
import UserModel from "../models/UserModel";
import RewardTypes from "../models/checkinRewardTypesModel";
import Brands from "../models/BrandsModel";
import { Op } from "sequelize";
import * as xlsx from "xlsx";
import { CreationAttributes } from "sequelize";
import * as fs from "fs";
import * as path from "path";
import { sequelize } from "../config/database";

export const getRewards = async () => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  return await Rewards.findAll({
    where: {
      // is_active: true,
      status_redeem: "available",
      [Op.or]: [{ expiry_date: null }, { expiry_date: { [Op.gte]: today } }],
    },
  });
};

export const getAllRewards = async () => {
  return await Rewards.findAll({
    include: [
      {
        model: RewardTypes,
        as: "RewardType",
        required: false,
      },
      {
        model: Brands,
        as: "Brand",
        attributes: ["id", "name_th", "name_en", "logo_url"],
        required: false,
      },
    ],
  });
};

export const redeemReward = async (userId: number, rewardId: number) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. หารางวัลที่ active และยังไม่หมดอายุ
  const reward = await Rewards.findOne({
    where: {
      id: rewardId,
      is_active: true,
      status_redeem: "available",
      [Op.or]: [{ expiry_date: null }, { expiry_date: { [Op.gte]: today } }],
    },
  });
  if (!reward) throw new Error("Reward not found, inactive, or expired");

  const pointsRequired = reward.points_required;

  // 2. เช็คคะแนนของ user
  const userPoints = await UserPoints.findOne({ where: { user_id: userId } });
  if (!userPoints) throw new Error("User points not found");

  // 3. ถ้าคะแนนไม่พอ → return error
  if (userPoints.total_points < pointsRequired) {
    return {
      success: false,
      message: "Insufficient points",
      requiredPoints: pointsRequired,
      userPoints: userPoints.total_points,
    };
  }

  // 4. หักคะแนน user
  userPoints.total_points -= pointsRequired;
  await userPoints.save();

  // 5. ปิด is_active ของรางวัล
  // reward.is_active = false;
  reward.status_redeem = "redeemed";
  reward.redeem_date = new Date(); // บันทึกเวลาปัจจุบัน
  await reward.save();

  // 6. สร้าง redemption record พร้อมสถานะ "completed" ทันที
  const redemption = await RewardRedemptions.create({
    user_id: userId,
    reward_id: rewardId,
    points_used: pointsRequired,
    status: "completed",
  });

  return {
    success: true,
    message: "Reward redeemed successfully",
    redemption,
    rewardUpdate: {
      // Optional: ส่งกลับไปให้ frontend รู้ว่าอัปเดตแล้ว
      status_redeem: reward.status_redeem,
      redeem_date: reward.redeem_date,
    },
  };
};

export const getUserRedemptions = async (userId: number) => {
  const redemptions = await RewardRedemptions.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Rewards,
        as: "Reward",
        attributes: [
          "title",
          "description",
          "conditions",
          "image_url",
          "points_required",
          "expiry_date",
          "brand_id",
        ],
        include: [
          {
            model: Brands,
            as: "Brand",
            attributes: ["id", "name_th", "name_en", "logo_url"],
            required: false,
          },
        ],
      },
    ],
  });

  return redemptions.map((redemption) => ({
    id: redemption.id,
    rewardId: redemption.reward_id,
    status: redemption.status,
    pointsUsed: redemption.points_used,
    reward: redemption.Reward,
  }));
};

/**
 * ดึงข้อมูลรางวัลทั้งหมดของ user แบ่งเป็น 3 ชุด (ปรับปรุง Logic)
 * 1. completed - รางวัลที่แลกแล้ว และ **ยังไม่หมดอายุ**
 * 2. can_redeem - รางวัลที่แลกได้ (แต้มพอ + ยังไม่หมดอายุ) **(แสดงแบบ Grouping ซ้ำกันโชว์การ์ดเดียว)**
 * 3. can_redeem_expired - รางวัลที่ **แลกแล้ว และ หมดอายุแล้ว**
 */
export const getUserRewardsOverview = async (userId: number) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. ดึงแต้มรวมของ user
  const userPoints = await UserPoints.findOne({ where: { user_id: userId } });
  const totalPoints = userPoints ? userPoints.total_points : 0;

  // 2. ดึงประวัติการแลกทั้งหมดของ User (ใช้สำหรับ Group 1 และ Group 3)
  const allUserRedemptions = await RewardRedemptions.findAll({
    where: {
      user_id: userId,
      status: "completed",
    },
    include: [
      {
        model: Rewards,
        as: "Reward",
        include: [
          {
            model: Brands,
            as: "Brand",
            attributes: ["id", "name_th", "name_en", "logo_url"],
            required: false,
          },
          {
            model: RewardTypes,
            as: "RewardType",
            attributes: ["id", "name_th", "name_en"],
            required: false,
          },
        ],
      },
    ],
    order: [["redeemed_at", "DESC"]],
  });

  // แยก Group 1 (Active) และ Group 3 (Expired) จากประวัติการแลก
  const activeRedeemedList: any[] = [];
  const expiredRedeemedList: any[] = [];
  const redeemedRewardIds: number[] = []; // เก็บ ID ที่แลกไปแล้วเพื่อไป filter ออกจาก Group 2

  allUserRedemptions.forEach((redemption) => {
    redeemedRewardIds.push(redemption.reward_id); // เก็บ ID ที่แลกแล้ว

    const rewardExpiry = redemption.Reward?.expiry_date;

    // Logic เช็ควันหมดอายุ
    let isExpired = false;
    if (rewardExpiry) {
      const expiryDateStr = new Date(rewardExpiry).toISOString().split("T")[0];
      if (expiryDateStr < today) {
        isExpired = true;
      }
    }

    if (isExpired) {
      // Group 3: แลกแล้ว + หมดอายุ
      expiredRedeemedList.push(redemption);
    } else {
      // Group 1: แลกแล้ว + ยังไม่หมดอายุ
      activeRedeemedList.push(redemption);
    }
  });

  // 3. ดึงรางวัลที่แลกได้ (Group 2) -> ต้อง Grouping ข้อมูลซ้ำ
  const availableRewards = await Rewards.findAll({
    where: {
      is_active: true,
      status_redeem: "available",
      points_required: { [Op.lte]: totalPoints }, // แต้มพอ
      id: {
        [Op.notIn]: redeemedRewardIds.length > 0 ? redeemedRewardIds : [0],
      }, // ไม่เอา ID ที่แลกไปแล้ว
      [Op.or]: [
        { expiry_date: null }, // ไม่มีวันหมดอายุ
        { expiry_date: { [Op.gte]: today } }, // หรือยังไม่หมดอายุ
      ],
    },
    include: [
      {
        model: Brands,
        as: "Brand",
        attributes: ["id", "name_th", "name_en", "logo_url"],
        required: false,
      },
      {
        model: RewardTypes,
        as: "RewardType",
        attributes: ["id", "name_th", "name_en"],
        required: false,
      },
    ],
    order: [
      ["points_required", "ASC"],
      ["expiry_date", "ASC"], // เรียงตามวันหมดอายุด้วย เพื่อให้ user ได้ใบที่ใกล้หมดอายุก่อน
    ],
  });

  // Logic Grouping สำหรับ Group 2 (แสดงแค่ 1 การ์ดสำหรับรางวัลที่เหมือนกัน)
  const groupedRewardsMap = new Map<string, any>();

  availableRewards.forEach((reward) => {
    // สร้าง Unique Key สำหรับตรวจสอบความซ้ำ
    // ใช้ข้อมูลสำคัญ: Title, Desc, Condition, Image, Points, Expiry, Type, Brand
    const uniqueKey = JSON.stringify({
      t: reward.title,
      d: reward.description,
      c: reward.conditions,
      img: reward.image_url,
      p: reward.points_required,
      e: reward.expiry_date
        ? new Date(reward.expiry_date).toISOString().split("T")[0]
        : "no_expiry",
      tid: reward.type_id,
      bid: reward.brand_id,
    });

    // ถ้า Key นี้ยังไม่มีใน Map ให้ใส่เข้าไป (จะได้ ID แรกสุดที่ Query มา เพราะเรา Order มาแล้ว)
    // ถ้ามีแล้ว ข้ามไปเลย (User จะเห็นแค่ ID แรก ถ้าแลกไปแล้ว รอบหน้า Query มา ID ถัดไปจะกลายเป็นใบแรกแทน)
    if (!groupedRewardsMap.has(uniqueKey)) {
      groupedRewardsMap.set(uniqueKey, reward);
    }
  });

  // แปลงจาก Map กลับเป็น Array
  const distinctCanRedeemRewards = Array.from(groupedRewardsMap.values());

  return {
    userPoints: totalPoints,

    // Group 1: แลกแล้ว (Active)
    completed: activeRedeemedList.map((redemption) => ({
      redemptionId: redemption.id,
      rewardId: redemption.reward_id,
      status: redemption.status,
      pointsUsed: redemption.points_used,
      redeemedAt: redemption.redeemed_at,
      expiresAt: redemption.expires_at,
      reward: redemption.Reward,
    })),

    // Group 2: แลกได้ (Unique Card) - ถ้ากดแลกจะส่ง ID ของใบนี้ไป ใบถัดไปจะขึ้นมาแทนในการโหลดครั้งหน้า
    can_redeem: distinctCanRedeemRewards.map((reward) => ({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      conditions: reward.conditions,
      image_url: reward.image_url,
      // redeem_code: reward.redeem_code, // ซ่อน Code ในหน้า Overview เพื่อความปลอดภัย
      points_required: reward.points_required,
      expiry_date: reward.expiry_date,
      stock_quantity: reward.stock_quantity,
      brand_id: reward.brand_id,
      type_id: reward.type_id,
      Brand: reward.brand,
      RewardType: reward.reward_type,
      can_redeem: true,
      is_completed: false,
    })),

    // Group 3: แลกแล้ว (Expired) - ย้ายมาจาก Group 1 ที่หมดอายุแล้ว
    redeem_expired: expiredRedeemedList.map((redemption) => ({
      redemptionId: redemption.id,
      rewardId: redemption.reward_id,
      status: "expired", // บังคับแสดงสถานะ expired
      pointsUsed: redemption.points_used,
      redeemedAt: redemption.redeemed_at,
      reward: redemption.Reward,
      // Mapping ให้โครงสร้างคล้าย Rewards object
      id: redemption.Reward?.id,
      title: redemption.Reward?.title,
      description: redemption.Reward?.description,
      image_url: redemption.Reward?.image_url,
      expiry_date: redemption.Reward?.expiry_date,
      can_redeem_expired: true,
    })),
  };
};

export const getAllRedemptions = async () => {
  return await RewardRedemptions.findAll({
    include: [
      {
        model: Rewards,
        as: "Reward",
        attributes: ["title", "image_url", "expiry_date", "brand_id"],
        include: [
          {
            model: Brands,
            as: "Brand",
            attributes: ["id", "name_th", "name_en", "logo_url"],
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "User",
        attributes: ["id", "first_name", "last_name", "email"],
      },
    ],
    order: [["redeemed_at", "DESC"]],
  });
};

export const getRedemptionDetails = async (redemptionId: number) => {
  return await RewardRedemptions.findOne({ where: { id: redemptionId } });
};

export const rejectRefund = async (redemptionId: number) => {
  const redemption = await RewardRedemptions.findOne({
    where: { id: redemptionId },
  });
  if (!redemption) throw new Error("Redemption not found");

  if (redemption.status !== "pending") {
    throw new Error("Refund can only be rejected for pending redemptions");
  }

  // Refund points to user's total
  const userPoints = await UserPoints.findOne({
    where: { user_id: redemption.user_id },
  });
  if (!userPoints) throw new Error("User points not found");

  userPoints.total_points += redemption.points_used;
  await userPoints.save();

  redemption.status = "rejected";
  await redemption.save();

  return redemption;
};

export const completeRedemption = async (redemptionId: number) => {
  const redemption = await RewardRedemptions.findOne({
    where: { id: redemptionId },
  });
  if (!redemption) throw new Error("Redemption not found");

  const reward = await Rewards.findOne({
    where: { id: redemption.reward_id },
  });
  if (!reward) throw new Error("Reward not found");
  // Update stock quantity
  if (reward.stock_quantity > 0) {
    reward.stock_quantity -= 1;
    await reward.save();
  }
  // Update redemption status
  redemption.status = "completed";
  await redemption.save();

  return redemption;
};

export const initializeCheckInRewardService = () => {
  console.log("CheckInRewardService initialize");
};

export const createReward = async (data: {
  title: string;
  description?: string;
  conditions?: string;
  image_url?: string;
  points_required: number;
  expiry_date?: string | null;
  is_active?: boolean;
  stock_quantity?: number;
  type_id?: number;
  brand_id?: number;
  redeem_code?: string;
  created_by?: number;
  updated_by?: number;
}) => {
  // 1. เช็คก่อนว่ามี redeem_code ส่งมาหรือไม่ และซ้ำกับที่มีอยู่ไหม
  if (data.redeem_code) {
    const existingReward = await Rewards.findOne({
      where: { redeem_code: data.redeem_code },
    });

    if (existingReward) {
      throw new Error(`Redeem code "${data.redeem_code}" already exists.`);
    }
  }

  const reward = await Rewards.create({
    title: data.title,
    description: data.description || "",
    conditions: data.conditions || null,
    image_url: data.image_url || "",
    redeem_code: data.redeem_code || null,
    points_required: data.points_required,
    expiry_date: data.expiry_date || null,
    is_active: data.is_active ?? true,
    stock_quantity: data.stock_quantity ?? -1,
    type_id: data.type_id,
    brand_id: data.brand_id || null,
    created_by: data.created_by,
    updated_by: data.updated_by,
  });

  return reward;
};

export const updateReward = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    conditions?: string;
    image_url?: string;
    redeem_code?: string;
    points_required?: number;
    expiry_date?: string | null;
    is_active?: boolean;
    stock_quantity?: number;
    type_id?: number;
    brand_id?: number;
    updated_by?: number;
  }
) => {
  const reward = await Rewards.findByPk(id);
  if (!reward) throw new Error("Reward not found");

  // 1. เช็คเรื่อง redeem_code ซ้ำ (เฉพาะกรณีมีการส่ง code ใหม่มา และไม่ตรงกับ code เดิม)
  if (data.redeem_code && data.redeem_code !== reward.redeem_code) {
    const existingReward = await Rewards.findOne({
      where: {
        redeem_code: data.redeem_code,
        id: { [Op.ne]: id }, // ตรวจสอบว่ามี id อื่นที่ใช้ code นี้ไหม (ไม่นับตัวเอง)
      },
    });

    if (existingReward) {
      throw new Error(`Redeem code "${data.redeem_code}" already exists.`);
    }
  }

  reward.title = data.title ?? reward.title;
  reward.description = data.description ?? reward.description;
  reward.conditions = data.conditions ?? reward.conditions;
  reward.image_url = data.image_url ?? reward.image_url;
  reward.redeem_code = data.redeem_code ?? reward.redeem_code;
  reward.points_required = data.points_required ?? reward.points_required;
  if (data.expiry_date !== undefined) {
    reward.expiry_date = data.expiry_date ? new Date(data.expiry_date) : null;
  }
  reward.is_active = data.is_active ?? reward.is_active;
  reward.stock_quantity = data.stock_quantity ?? reward.stock_quantity;
  reward.type_id = data.type_id ?? reward.type_id;
  reward.brand_id = data.brand_id ?? reward.brand_id;
  reward.updated_by = data.updated_by ?? reward.updated_by;

  await reward.save();
  return reward;
};

export const deleteReward = async (id: number) => {
  const reward = await Rewards.findByPk(id);
  if (!reward) throw new Error("Reward not found");

  await reward.destroy();
  return { message: "Reward deleted successfully" };
};

export const getRewardById = async (id: number, userId?: number) => {
  const reward = await Rewards.findByPk(id, {
    include: [
      {
        model: RewardTypes,
        as: "RewardType",
        required: false,
      },
      {
        model: Brands,
        as: "Brand",
        attributes: ["id", "name_th", "name_en", "logo_url"],
        required: false,
      },
    ],
  });
  if (!reward) {
    throw new Error("Reward not found");
  }

  let isCompleted = false;
  if (userId) {
    const completedRedemption = await RewardRedemptions.findOne({
      where: {
        user_id: userId,
        reward_id: id,
        status: "completed",
      },
    });
    isCompleted = !!completedRedemption;
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  let isExpired = false;
  if (reward.expiry_date) {
    const expiryDateStr = new Date(reward.expiry_date)
      .toISOString()
      .split("T")[0];
    isExpired = expiryDateStr < today;
  }

  return {
    ...reward.toJSON(),
    is_completed: isCompleted,
    is_expired: isExpired,
  };
};

/**
 * ปิดสถานะ is_active ของรางวัลที่หมดอายุ
 * @returns ผลลัพธ์การปิดรางวัล
 */
export const deactivateExpiredRewards = async () => {
  console.log(`[${new Date().toISOString()}] Running reward expiry check...`);

  try {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    // ค้นหารางวัลที่หมดอายุแล้วและยังคงเป็น active อยู่
    const expiredRewards = await Rewards.findAll({
      where: {
        is_active: true,
        expiry_date: {
          [Op.lt]: currentDateString, // expiry_date < current_date
          [Op.ne]: null, // ไม่เป็น null
        },
      },
    });

    if (expiredRewards.length > 0) {
      console.log(
        `Found ${expiredRewards.length} expired rewards to deactivate:`
      );

      // อัพเดทสถานะรางวัลที่หมดอายุ
      const updateResult = await Rewards.update(
        {
          is_active: false,
          updated_at: new Date(),
        },
        {
          where: {
            is_active: true,
            expiry_date: {
              [Op.lt]: currentDateString,
              [Op.ne]: null,
            },
          },
        }
      );

      console.log(
        `Successfully deactivated ${updateResult[0]} expired rewards`
      );

      // แสดงรายการรางวัลที่ถูกปิด
      expiredRewards.forEach((reward) => {
        console.log(
          `- Reward ID ${reward.id}: "${reward.title}" (expired: ${reward.expiry_date})`
        );
      });

      return {
        success: true,
        deactivatedCount: updateResult[0],
        expiredRewards: expiredRewards.map((r) => ({
          id: r.id,
          title: r.title,
          expiry_date: r.expiry_date,
        })),
      };
    } else {
      console.log("No expired rewards found to deactivate");
      return {
        success: true,
        deactivatedCount: 0,
        expiredRewards: [],
      };
    }
  } catch (error) {
    console.error("Error in reward expiry check:", error);
    throw error;
  }
};

export const importRewards = async (
  filePath: string,
  dataconfig: {
    image_url: string;
    is_active: boolean;
    created_by: number;
    updated_by: number;
  }
) => {
  if (!filePath) {
    throw new Error("File path is missing.");
  }

  try {
    // อ่านไฟล์ Excel
    const normalizedFilePath = path.normalize(filePath);
    const fileBuffer = fs.readFileSync(normalizedFilePath);

    const workbook = xlsx.read(fileBuffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // อ่านข้อมูลดิบทั้งหมดมาก่อน
    const rawExcelData: any[] = xlsx.utils.sheet_to_json(worksheet);

    if (rawExcelData.length === 0) {
      throw new Error("ไฟล์ Excel ไม่มีข้อมูล");
    }

    // คัดกรองเอาเฉพาะแถวที่เป็น "รางวัล" จริงๆ โดยดูจาก 'title'
    // แถวที่เป็น Reference (1=MK, etc.) จะไม่มี title ดังนั้นจะถูกกรองออกไปอัตโนมัติ
    const excelData = rawExcelData.filter((row) => {
      // เช็คแค่ว่ามี title ก็ถือว่าเป็น row ข้อมูลที่จะนำเข้า
      // ส่วน redeem_code ถ้าไม่มี เดี๋ยวไปแจ้งเตือนในขั้น Validation แทน
      return row.title && String(row.title).trim() !== "";
    });

    if (excelData.length === 0) {
      throw new Error("ไม่พบข้อมูลรางวัลในไฟล์ (กรุณาตรวจสอบคอลัมน์ title)");
    }

    // VALIDATION: ตรวจสอบ Template Headers
    const requiredHeaders = [
      "title",
      "description",
      "redeem_code",
      "points_required",
      "expiry_date",
      "type_id",
      "brand_id",
    ];

    const firstRowKeys = Object.keys(rawExcelData[0]);

    // หาเฉพาะ Header ที่จำเป็นแต่ "ขาดหายไป"
    const missingHeaders = requiredHeaders.filter(
      (header) => !firstRowKeys.includes(header)
    );

    if (missingHeaders.length > 0) {
      throw new Error(
        `รูปแบบไฟล์ไม่ถูกต้อง ขาดคอลัมน์สำคัญ: ${missingHeaders.join(", ")}`
      );
    }

    //  DUPLICATE CHECK: ตรวจสอบ Redeem Code ซ้ำ
    const duplicateErrors: string[] = [];
    const codeRowMap = new Map<string, number[]>();
    const allCodesInFile: string[] = [];

    excelData.forEach((row, index) => {
      // index นี้คือ index ใน array ที่กรองแล้ว
      const code = row.redeem_code ? String(row.redeem_code).trim() : "";

      if (code) {
        if (!codeRowMap.has(code)) {
          codeRowMap.set(code, []);
          allCodesInFile.push(code);
        }
        codeRowMap.get(code)?.push(index + 1);
      }
    });

    //  ซ้ำในไฟล์
    codeRowMap.forEach((rows, code) => {
      if (rows.length > 1) {
        duplicateErrors.push(
          `- Code "${code}" ซ้ำกันภายในไฟล์ (รายการที่: ${rows.join(", ")})`
        );
      }
    });

    //  ซ้ำใน DB
    if (allCodesInFile.length > 0) {
      const existingRewards = await Rewards.findAll({
        where: {
          redeem_code: {
            [Op.in]: allCodesInFile,
          },
        },
        attributes: ["redeem_code"],
      });

      if (existingRewards.length > 0) {
        existingRewards.forEach((reward) => {
          const existingCode = reward.redeem_code!;
          duplicateErrors.push(`- Code "${existingCode}" มีอยู่แล้วในระบบ`);
        });
      }
    }

    if (duplicateErrors.length > 0) {
      const maxErrors = 10;
      let msg = `พบ Redeem Code ซ้ำกัน ${duplicateErrors.length} รายการ:\n`;
      msg += duplicateErrors.slice(0, maxErrors).join("\n");
      if (duplicateErrors.length > maxErrors) {
        msg += `\n...และอีก ${duplicateErrors.length - maxErrors} รายการ`;
      }
      throw new Error(msg);
    }

    // ROW DATA VALIDATION: ตรวจสอบค่าว่าง (เฉพาะ 7 คอลัมน์หลัก)
    const validationErrors: string[] = [];
    const rewardsPayload: CreationAttributes<Rewards>[] = [];

    const formatDate = (dateVal: any): string | null => {
      if (!dateVal) return null;
      let dateObj: Date | null = null;
      if (dateVal instanceof Date) {
        dateObj = new Date(dateVal);
      } else {
        dateObj = new Date(dateVal);
      }
      if (dateObj && !isNaN(dateObj.getTime())) {
        dateObj.setHours(dateObj.getHours() + 12);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
      return null;
    };

    // วนลูปเฉพาะข้อมูลที่ผ่านการกรอง (มี Title)
    excelData.forEach((row, index) => {
      const itemNumber = index + 1;
      const missingFields: string[] = [];

      // 1. Title
      if (!row.title) missingFields.push("title");

      // 2. Description
      if (!row.description) missingFields.push("description");

      // 3. Redeem Code
      if (!row.redeem_code) missingFields.push("redeem_code");

      // 4. Points Required (Allow 0)
      if (
        row.points_required === undefined ||
        row.points_required === null ||
        row.points_required === ""
      ) {
        missingFields.push("points_required");
      }

      // 5. Expiry Date
      if (!row.expiry_date) missingFields.push("expiry_date");

      // 6. Type ID
      if (!row.type_id) missingFields.push("type_id");

      // 7. Brand ID
      if (!row.brand_id) missingFields.push("brand_id");

      if (missingFields.length > 0) {
        validationErrors.push(
          `รายการที่ ${itemNumber} ("${
            row.title || "ไม่มีชื่อ"
          }"): ขาดข้อมูล [${missingFields.join(", ")}]`
        );
      } else {
        const codeValue = String(row.redeem_code).trim();

        rewardsPayload.push({
          title: row.title,
          description: row.description,
          redeem_code: codeValue,
          points_required: Number(row.points_required),
          expiry_date: formatDate(row.expiry_date),
          type_id: Number(row.type_id),
          brand_id: Number(row.brand_id),

          // Field เสริม (ถ้ามีใน excel ก็ใส่ ถ้าไม่มีก็ null ไม่ error)
          conditions: row.conditions || null,

          // Config
          image_url: dataconfig.image_url,
          is_active: dataconfig.is_active,
          status_redeem: "available",
          redeem_date: null,
          stock_quantity: 1,
          created_by: dataconfig.created_by,
          updated_by: dataconfig.updated_by,
        } as CreationAttributes<Rewards>);
      }
    });

    if (validationErrors.length > 0) {
      const maxErrorsToShow = 5;
      let errorMessage = `พบข้อมูลไม่ครบถ้วน ${validationErrors.length} รายการ:\n`;
      errorMessage += validationErrors.slice(0, maxErrorsToShow).join("\n");
      if (validationErrors.length > maxErrorsToShow) {
        errorMessage += `\n...และอีก ${
          validationErrors.length - maxErrorsToShow
        } รายการ`;
      }
      throw new Error(errorMessage);
    }

    // บันทึกลง Database
    let importedCount = 0;
    await sequelize.transaction(async (t) => {
      const createdRewards = await Rewards.bulkCreate(rewardsPayload, {
        transaction: t,
        validate: true,
      });
      importedCount = createdRewards.length;
    });

    return {
      message: "Rewards imported successfully",
      importedCount,
      totalRecords: rewardsPayload.length,
    };
  } catch (error: any) {
    console.error("Error during importRewards:", error);
    throw error;
  }
};
/**
 * ดึงรายการรางวัลแบบไม่ซ้ำ
 * ถ้ามีรางวัลเหมือนกัน จะแสดงแค่ 1 ใบ
 * เมื่อ User แลกไปแล้ว จะแสดงใบถัดไปในคิวแทน
 */
export const getDistinctRewards = async (userId: number) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  //  หา ID รางวัลที่ User คนนี้แลกไปแล้ว (เพื่อไม่ให้แสดงซ้ำ / หรือไม่ให้เอามาคำนวณ)
  const userRedemptions = await RewardRedemptions.findAll({
    attributes: ["reward_id"],
    where: {
      user_id: userId,
      status: { [Op.ne]: "rejected" }, // ไม่นับรายการที่ถูก reject
    },
  });

  const redeemedRewardIds = userRedemptions.map((r) => r.reward_id);

  //  ดึงรางวัลทั้งหมดที่ Active, ยังไม่ถูกแลก (ในระบบ), และยังไม่หมดอายุ
  const rewards = await Rewards.findAll({
    where: {
      is_active: true,
      status_redeem: "available",
      id: {
        [Op.notIn]: redeemedRewardIds.length > 0 ? redeemedRewardIds : [0],
      }, // User ต้องไม่เคยแลกใบนี้
      [Op.or]: [{ expiry_date: null }, { expiry_date: { [Op.gte]: today } }],
    },
    include: [
      {
        model: Brands,
        as: "Brand",
        attributes: ["id", "name_th", "name_en", "logo_url"],
        required: false,
      },
      {
        model: RewardTypes,
        as: "RewardType",
        attributes: ["id", "name_th", "name_en"],
        required: false,
      },
    ],
    // เรียงตามวันหมดอายุ และ ID เพื่อให้การดึง "ใบแรก" เป็นใบที่ควรปล่อยออกก่อน (FIFO)
    order: [
      ["expiry_date", "ASC"],
      ["id", "ASC"],
    ],
  });

  //
  // ใช้ Map เพื่อเก็บรางวัลรายการแรกที่เจอของแต่ละ "ชนิด"
  const distinctMap = new Map<string, any>();

  rewards.forEach((reward) => {
    // สร้าง Key สำหรับระบุตัวตนของรางวัล
    const uniqueKey = JSON.stringify({
      t: reward.title,
      d: reward.description,
      c: reward.conditions,
      // img: reward.image_url,
      p: reward.points_required,
      e: reward.expiry_date
        ? new Date(reward.expiry_date).toISOString().split("T")[0]
        : "no_expiry",
      tid: reward.type_id,
      bid: reward.brand_id,
    });

    // ถ้ายังไม่มี Key นี้ใน Map ให้ใส่เข้าไป (นี่คือใบแรกที่เจอ และ User ยังไม่เคยแลก)
    if (!distinctMap.has(uniqueKey)) {
      distinctMap.set(uniqueKey, reward);
    }
    // ถ้ามีแล้ว แปลว่าเป็นใบที่ซ้ำ (Duplicate) เราจะปล่อยผ่าน ไม่เอามาแสดง
  });

  // แปลงกลับเป็น Array
  return Array.from(distinctMap.values());
};
