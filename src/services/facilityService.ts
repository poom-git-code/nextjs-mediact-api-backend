import FacilityModel from "../models/FacilitiesModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import FacilityTypeModel from "../models/FacilityTypesModel";
import FacilityHolidayModel from "../models/FacilityHolidayModel";
import FacilityLeaveLimitsModel from "../models/LeaveLimitsModel";
import UserModel from "../models/UserModel";
import DepartmentModel from "../models/DepartmentModel";
import ShiftTypesModel from "../models/ShiftTypesModel";
import { PipedaUserDataHandler } from '../middleware/pipedaUserDataHandler';
import { Op } from "sequelize";


// ฟังก์ชันตรวจสอบความซ้ำของ abbreviation
export const checkAbbreviationExists = async (abbreviation: string, excludeId?: number) => {
  if (!abbreviation) return false;

  const where: any = { abbreviation };
  if (excludeId) {
    where.id = { [require('sequelize').Op.ne]: excludeId };
  }

  const existingFacility = await FacilityModel.findOne({ where });
  return existingFacility !== null;
};

// ฟังก์ชันตรวจสอบความซ้ำของชื่อสถานพยาบาล
export const checkFacilityNameExists = async (name: string, excludeId?: number) => {
  if (!name) return false;

  const where: any = { name };
  if (excludeId) {
    where.id = { [require('sequelize').Op.ne]: excludeId };
  }

  const existingFacility = await FacilityModel.findOne({ where });
  return existingFacility !== null;
};

export const createFacility = async (
  data: Partial<FacilityModel>,
  createdBy: number
) => {
  // ตรวจสอบความซ้ำของชื่อสถานพยาบาล
  if (data.name) {
    const nameExists = await checkFacilityNameExists(data.name);
    if (nameExists) {
      throw new Error(`ชื่อสถานพยาบาล "${data.name}" มีอยู่แล้วในระบบ กรุณาใช้ชื่ออื่น`);
    }
  }

  // ตรวจสอบความซ้ำของ abbreviation
  if (data.abbreviation) {
    const abbreviationExists = await checkAbbreviationExists(data.abbreviation);
    if (abbreviationExists) {
      throw new Error(`ตัวย่อ "${data.abbreviation}" มีอยู่แล้วในระบบ กรุณาใช้ตัวย่ออื่น`);
    }
  }

  const newFacility = await FacilityModel.create({
    ...data,
    created_by: createdBy,
    updated_by: createdBy,
  });

  // สร้าง department admin อัตโนมัติ
  const adminDepartment = await DepartmentModel.create({
    name: 'admin',
    type_id: 2, // Admin department type
    facility_id: newFacility.id,
    parent_department_id: null,
    is_active: true,
    is_default: true,
    created_by: createdBy,
    dayoff_duedate: 5,
    include_weekend: true,
    include_holiday: true,
  });

  // สร้าง shift types อัตโนมัติ 3 แบบสำหรับ admin department
  const defaultShiftTypes = [
    {
      name: 'อบรม',
      start_time: '08:00:00',
      end_time: '17:00:00',
      roles_allowed: 'Staff',
      department_id: adminDepartment.id,
      facility_id: newFacility.id,
      is_active: true,
      created_by: createdBy,
      short_name: 'TRN',
      color_code: '#B3E5FC',
      total_hours: 0.00,
      normal_hours: 0.00,
      ot_hours: 0.00,
      count_as_fte: false,
      count_as_working_hour: true,
      min_staff_weekday: 0,
      max_staff_weekday: 0,
      min_staff_weekend: 0,
      max_staff_weekend: 0,
      required_senior_count: 0,
      is_manual: true,
      is_default: true
    },
    {
      name: 'Vacation',
      start_time: '08:00:00',
      end_time: '17:00:00',
      roles_allowed: 'Staff',
      department_id: adminDepartment.id,
      facility_id: newFacility.id,
      is_active: true,
      created_by: createdBy,
      short_name: 'V',
      color_code: '#AEC6CF',
      total_hours: 0.00,
      normal_hours: 0.00,
      ot_hours: 0.00,
      count_as_fte: false,
      count_as_working_hour: true,
      min_staff_weekday: 0,
      max_staff_weekday: 0,
      min_staff_weekend: 0,
      max_staff_weekend: 0,
      required_senior_count: 0,
      is_manual: true,
      is_default: true
    },
    {
      name: 'Day off',
      start_time: '08:00:00',
      end_time: '17:00:00',
      roles_allowed: 'Staff',
      department_id: adminDepartment.id,
      facility_id: newFacility.id,
      is_active: true,
      created_by: createdBy,
      short_name: 'X',
      color_code: '#E6B3FF',
      total_hours: 0.00,
      normal_hours: 0.00,
      ot_hours: 0.00,
      count_as_fte: false,
      count_as_working_hour: false,
      min_staff_weekday: 0,
      max_staff_weekday: 0,
      min_staff_weekend: 0,
      max_staff_weekend: 0,
      required_senior_count: 0,
      is_manual: true,
      is_default: true
    }
  ];

  // สร้าง shift types ทั้งหมด
  await ShiftTypesModel.bulkCreate(defaultShiftTypes);

  // สร้างวันหยุดประจำปี 2025 อัตโนมัติ
  const defaultHolidays = [
    { holiday_date: new Date('2025-01-01'), name: 'วันขึ้นปีใหม่', is_recurring: true, description: 'หยุดเนื่องในวันขึ้นปีใหม่' },
    { holiday_date: new Date('2025-02-19'), name: 'วันมาฆบูชา', is_recurring: true, description: 'วันสำคัญทางพุทธศาสนา' },
    { holiday_date: new Date('2025-04-06'), name: 'วันจักรี', is_recurring: true, description: 'ระลึกถึงการสถาปนาราชวงศ์จักรี' },
    { holiday_date: new Date('2025-04-07'), name: 'ชดเชยวันจักรี', is_recurring: false, description: 'ชดเชยวันหยุดวันอาทิตย์' },
    { holiday_date: new Date('2025-04-13'), name: 'วันสงกรานต์', is_recurring: true, description: 'ประเพณีสงกรานต์' },
    { holiday_date: new Date('2025-04-14'), name: 'วันสงกรานต์', is_recurring: true, description: 'ประเพณีสงกรานต์' },
    { holiday_date: new Date('2025-04-15'), name: 'วันสงกรานต์', is_recurring: true, description: 'ประเพณีสงกรานต์' },
    { holiday_date: new Date('2025-05-01'), name: 'วันแรงงานแห่งชาติ', is_recurring: true, description: 'วันหยุดแรงงาน' },
    { holiday_date: new Date('2025-05-05'), name: 'วันฉัตรมงคล', is_recurring: true, description: 'วันฉัตรมงคล' },
    { holiday_date: new Date('2025-05-19'), name: 'วันวิสาขบูชา', is_recurring: true, description: 'วันสำคัญทางพุทธศาสนา' },
    { holiday_date: new Date('2025-07-01'), name: 'วันหยุดกลางปีธนาคาร', is_recurring: false, description: 'เฉพาะธนาคารพาณิชย์' },
    { holiday_date: new Date('2025-07-10'), name: 'วันอาสาฬหบูชา', is_recurring: true, description: 'วันสำคัญทางพุทธศาสนา' },
    { holiday_date: new Date('2025-07-11'), name: 'วันเข้าพรรษา', is_recurring: true, description: 'วันสำคัญทางพุทธศาสนา' },
    { holiday_date: new Date('2025-07-28'), name: 'วันเฉลิมพระชนมพรรษา ร.10', is_recurring: true, description: 'วันพระราชสมภพ รัชกาลที่ 10' },
    { holiday_date: new Date('2025-08-12'), name: 'วันแม่แห่งชาติ', is_recurring: true, description: 'เฉลิมพระชนมพรรษา พระพันปีหลวง' },
    { holiday_date: new Date('2025-10-13'), name: 'วันคล้ายวันสวรรคต ร.9', is_recurring: true, description: 'วันน้อมรำลึกในหลวง ร.9' },
    { holiday_date: new Date('2025-10-23'), name: 'วันปิยมหาราช', is_recurring: true, description: 'วันระลึกถึง ร.5' },
    { holiday_date: new Date('2025-12-05'), name: 'วันพ่อแห่งชาติ', is_recurring: true, description: 'วันคล้ายวันพระราชสมภพ ร.9' },
    { holiday_date: new Date('2025-12-10'), name: 'วันรัฐธรรมนูญ', is_recurring: true, description: 'วันประกาศใช้รัฐธรรมนูญ' },
    { holiday_date: new Date('2025-12-31'), name: 'วันสิ้นปี', is_recurring: true, description: 'หยุดสิ้นปี' }
  ];

  // สร้างวันหยุดทั้งหมดสำหรับ facility ใหม่
  const facilityHolidays = defaultHolidays.map(holiday => ({
    ...holiday,
    facility_id: newFacility.id,
    created_by: createdBy
  }));

  await FacilityHolidayModel.bulkCreate(facilityHolidays);

  // สร้างขีดจำกัดวันลาสำหรับ facility ใหม่
  const defaultLeaveLimits = [
    { facility_id: newFacility.id, leave_type_id: 1, max_days: 30, created_by: createdBy }, // ลาพักผ่อน
    { facility_id: newFacility.id, leave_type_id: 2, max_days: 10, created_by: createdBy }, // ลาป่วย
    { facility_id: newFacility.id, leave_type_id: 3, max_days: 15, created_by: createdBy }, // ลากิจ
    { facility_id: newFacility.id, leave_type_id: 7, max_days: 365, created_by: createdBy } // ลาพิเศษ/อื่นๆ
  ];

  await FacilityLeaveLimitsModel.bulkCreate(defaultLeaveLimits);

  return newFacility;
};

export const updateFacility = async (
  id: number,
  updates: Partial<FacilityModel>,
  updatedBy: number
) => {
  const facility = await FacilityModel.findByPk(id);
  if (!facility) {
    throw new Error("Facility not found");
  }

  // ตรวจสอบความซ้ำของชื่อสถานพยาบาล (ยกเว้น record ปัจจุบัน)
  if (updates.name) {
    const nameExists = await checkFacilityNameExists(updates.name, id);
    if (nameExists) {
      throw new Error(`ชื่อสถานพยาบาล "${updates.name}" มีอยู่แล้วในระบบ กรุณาใช้ชื่ออื่น`);
    }
  }

  // ตรวจสอบความซ้ำของ abbreviation (ยกเว้น record ปัจจุบัน)
  if (updates.abbreviation) {
    const abbreviationExists = await checkAbbreviationExists(updates.abbreviation, id);
    if (abbreviationExists) {
      throw new Error(`ตัวย่อ "${updates.abbreviation}" มีอยู่แล้วในระบบ กรุณาใช้ตัวย่ออื่น`);
    }
  }

  return await facility.update({
    ...updates,
    updated_by: updatedBy,
  });
};

export const deleteFacility = async (id: number) => {
  const facility = await FacilityModel.findByPk(id);
  if (!facility) {
    throw new Error('Facility not found');
  }
  return await facility.destroy();
};

export const getFacilityById = async (id: number) => {
  const facility = await FacilityModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "created_by_user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "updated_by_user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: FacilityTypeModel,
        as: "facility_type",
        attributes: ["id", "name", "description", "is_active"],
      },
    ],
  });
  if (!facility) {
    throw new Error('Facility not found');
  }

  // Process PIPEDA decryption for facility
  const facilityData = facility.get({ plain: true });

  // Decrypt created_by_user data
  if (facilityData.created_by_user) {
    facilityData.created_by_user = decryptAndCleanUserData(facilityData.created_by_user);
  }

  // Decrypt updated_by_user data
  if (facilityData.updated_by_user) {
    facilityData.updated_by_user = decryptAndCleanUserData(facilityData.updated_by_user);
  }

  return facilityData;
};

/**
 * ดึงข้อมูลสถานพยาบาลทั้งหมดพร้อม Paging และ Search
 * @param page - หมายเลขหน้า (default: 1)
 * @param pageSize - จำนวนข้อมูลต่อหน้า (default: 25)
 * @param searchQuery - คำค้นหา (ค้นจาก id, name และ abbreviation)
 */
export const getAllFacilities = async (
  page: number = 1,
  pageSize: number = 25,
  searchQuery?: string
) => {
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const whereClause: any = {};
  if (searchQuery) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
      { abbreviation: { [Op.like]: `%${searchQuery}%` } },
      { id: { [Op.like]: `%${searchQuery}%` } },
    ];
  }

  const { count, rows } = await FacilityModel.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: UserModel,
        as: "created_by_user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "updated_by_user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
      {
        model: FacilityTypeModel,
        as: "facility_type",
        attributes: ["id", "name", "description", "is_active"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
    limit: limit,
    offset: offset,
    distinct: true,
  });

  const processedFacilities = rows.map((facility: any) => {
    const facilityData = facility.get({ plain: true });

    if (facilityData.created_by_user) {
      facilityData.created_by_user = decryptAndCleanUserData(facilityData.created_by_user);
    }

    if (facilityData.updated_by_user) {
      facilityData.updated_by_user = decryptAndCleanUserData(facilityData.updated_by_user);
    }

    return facilityData;
  });

  return { facilities: processedFacilities, total: count };
};