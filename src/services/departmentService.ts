import UserModel from "../models/UserModel";
import DepartmentModel from "../models/DepartmentModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import FacilityModel from "../models/FacilitiesModel";
import DepartmentTypeModel from "../models/DepartmentTypesModel";
import DepartmentOperatingHoursModel from "../models/DepartmentOperatingHoursModel";
import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import ShiftTypesModel from "../models/ShiftTypesModel";
import UserRoleModel from "../models/UserRolesModel";
import { RoleModel } from "../models/RolesModel";
import { Op, Sequelize } from "sequelize";
import UserGroupTagModel from "../models/UserGroupTagModel";
import UserGroupTagMemberModel from "../models/UserGroupTagMemberModel";
import { ShiftTypeRoleModel } from "../models/ShiftTypeRoleModel";
import { ShiftTypeGroupTagModel } from "../models/ShiftTypeGroupTagModel";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";
import {
  getUserAttributes,
  getBasicUserAttributes,
  decryptAndCleanUserData,
} from "../utils/encryptedFieldMapping";
import { sequelize } from "../config/database";
import DepartMentCategoryModel from "../models/DepartMentCategoryModel";
import CategoryMasterModel from "../models/CategoryMasterModel";
import SubCategoryMasterModel from "../models/SubCategoryMasterModel";
import DepartmentCertificationModel from "../models/DepartmentCertificationModel";

// Helper function to decrypt user data in department member lists
const decryptDepartmentMembers = (members: any[]) => {
  return members.map((member) => {
    if (member.user) {
      member.user = decryptAndCleanUserData(member.user);
    }
    return member;
  });
};

// export const createDepartment = async (data: any, createdByUserId: number) => {

//   // ดึง facility_id ของ user ที่สร้าง
//   const user = await UserModel.findByPk(createdByUserId, {
//     include: [
//       {
//         model: UserEmploymentModel,
//         as: "user_employment",
//         where: { is_active: true },
//         required: false,
//       },
//     ],
//   });

//   const userEmployment = user?.user_employment as UserEmploymentModel[] | undefined;
//   if (!userEmployment || userEmployment.length === 0 || !userEmployment[0].facility_id) {
//     throw new Error("Cannot find facility_id for the user");
//   }

//   // เพิ่ม facility_id และ created_by ลงในข้อมูลที่จะสร้าง พร้อมตั้งค่าเริ่มต้น
//   const departmentData = {
//     name: data.name,
//     type_id: data.type_id,
//     facility_id: userEmployment[0].facility_id,
//     parent_department_id: data.parent_department_id || null,
//     is_active: data.is_active !== undefined ? data.is_active : true,
//     dayoff_duedate: data.dayoff_duedate || 5,
//     include_weekend: data.include_weekend !== undefined ? data.include_weekend : true,
//     include_holiday: data.include_holiday !== undefined ? data.include_holiday : true,
//     role_tags: data.role_tags || null,
//     created_by: createdByUserId,
//     updated_by: createdByUserId,
//   };

//   const newDepartment = await DepartmentModel.create(departmentData);

//   // สร้าง shift types อัตโนมัติ 3 แบบ
//   const defaultShiftTypes = [
//     {
//       name: 'อบรม',
//       start_time: '08:00:00',
//       end_time: '17:00:00',
//       roles_allowed: 'Staff',
//       department_id: newDepartment.id,
//       facility_id: userEmployment[0].facility_id,
//       is_active: true,
//       created_by: createdByUserId,
//       short_name: 'TRN',
//       color_code: '#B3E5FC',
//       total_hours: 0.00,
//       normal_hours: 0.00,
//       ot_hours: 0.00,
//       count_as_fte: false,
//       count_as_working_hour: true,
//       min_staff_weekday: 0,
//       max_staff_weekday: 0,
//       min_staff_weekend: 0,
//       max_staff_weekend: 0,
//       required_senior_count: 0,
//       is_manual: true,
//       is_default: true
//     },
//     {
//       name: 'Vacation',
//       start_time: '08:00:00',
//       end_time: '17:00:00',
//       roles_allowed: 'Staff',
//       department_id: newDepartment.id,
//       facility_id: userEmployment[0].facility_id,
//       is_active: true,
//       created_by: createdByUserId,
//       short_name: 'V',
//       color_code: '#AEC6CF',
//       total_hours: 0.00,
//       normal_hours: 0.00,
//       ot_hours: 0.00,
//       count_as_fte: false,
//       count_as_working_hour: true,
//       min_staff_weekday: 0,
//       max_staff_weekday: 0,
//       min_staff_weekend: 0,
//       max_staff_weekend: 0,
//       required_senior_count: 0,
//       is_manual: true,
//       is_default: true
//     },
//     {
//       name: 'Day off',
//       start_time: '08:00:00',
//       end_time: '17:00:00',
//       roles_allowed: 'Staff',
//       department_id: newDepartment.id,
//       facility_id: userEmployment[0].facility_id,
//       is_active: true,
//       created_by: createdByUserId,
//       short_name: 'X',
//       color_code: '#E6B3FF',
//       total_hours: 0.00,
//       normal_hours: 0.00,
//       ot_hours: 0.00,
//       count_as_fte: false,
//       count_as_working_hour: false,
//       min_staff_weekday: 0,
//       max_staff_weekday: 0,
//       min_staff_weekend: 0,
//       max_staff_weekend: 0,
//       required_senior_count: 0,
//       is_manual: true,
//       is_default: true
//     }
//   ];

//   // สร้าง shift types ทั้งหมด
//   await ShiftTypesModel.bulkCreate(defaultShiftTypes);

//   return newDepartment;
// };

export const createDepartment = async (data: any, createdByUserId: number) => {
  const transaction = await sequelize.transaction();

  try {
    if (!data.facility_id) {
      throw new Error("Facility ID is required.");
    }

    const departmentData = {
      name: data.name,
      type_id: data.type_id,
      facility_id: data.facility_id,
      abbreviation: data.abbreviation || null,
      parent_department_id: data.parent_department_id || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
      dayoff_duedate: data.dayoff_duedate || 5,
      include_weekend:
        data.include_weekend !== undefined ? data.include_weekend : true,
      include_holiday:
        data.include_holiday !== undefined ? data.include_holiday : true,
      role_tags: data.role_tags || null,
      created_by: createdByUserId,
      updated_by: createdByUserId,
    };

    const newDepartment = await DepartmentModel.create(departmentData, {
      transaction,
    });

    if (data.category_id) {
      const departmentCategoryData = {
        department_id: newDepartment.id,
        category_id: data.category_id,
        sub_category_id: data.sub_category_id || null,
        is_primary: 1,
        created_by: createdByUserId,
        updated_by: createdByUserId,
      };
      await DepartMentCategoryModel.create(departmentCategoryData, {
        transaction,
      });
    }

    const defaultShiftTypes = [
      {
        name: "อบรม",
        start_time: "08:00:00",
        end_time: "17:00:00",
        roles_allowed: "Staff",
        department_id: newDepartment.id,
        facility_id: data.facility_id,
        is_active: true,
        created_by: createdByUserId,
        short_name: "TRN",
        color_code: "#B3E5FC",
        total_hours: 0.0,
        normal_hours: 0.0,
        ot_hours: 0.0,
        count_as_fte: false,
        count_as_working_hour: true,
        min_staff_weekday: 0,
        max_staff_weekday: 0,
        min_staff_weekend: 0,
        max_staff_weekend: 0,
        required_senior_count: 0,
        is_manual: true,
        is_default: true,
      },
      {
        name: "Vacation",
        start_time: "08:00:00",
        end_time: "17:00:00",
        roles_allowed: "Staff",
        department_id: newDepartment.id,
        facility_id: data.facility_id,
        is_active: true,
        created_by: createdByUserId,
        short_name: "V",
        color_code: "#AEC6CF",
        total_hours: 0.0,
        normal_hours: 0.0,
        ot_hours: 0.0,
        count_as_fte: false,
        count_as_working_hour: true,
        min_staff_weekday: 0,
        max_staff_weekday: 0,
        min_staff_weekend: 0,
        max_staff_weekend: 0,
        required_senior_count: 0,
        is_manual: true,
        is_default: true,
      },
      {
        name: "Day off",
        start_time: "08:00:00",
        end_time: "17:00:00",
        roles_allowed: "Staff",
        department_id: newDepartment.id,
        facility_id: data.facility_id,
        is_active: true,
        created_by: createdByUserId,
        short_name: "X",
        color_code: "#E6B3FF",
        total_hours: 0.0,
        normal_hours: 0.0,
        ot_hours: 0.0,
        count_as_fte: false,
        count_as_working_hour: false,
        min_staff_weekday: 0,
        max_staff_weekday: 0,
        min_staff_weekend: 0,
        max_staff_weekend: 0,
        required_senior_count: 0,
        is_manual: true,
        is_default: true,
      },
    ].map((shift) => ({
      ...shift,
      department_id: newDepartment.id,
      facility_id: data.facility_id,
      created_by: createdByUserId,
    }));

    await ShiftTypesModel.bulkCreate(defaultShiftTypes, { transaction });

    await transaction.commit();

    return newDepartment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const createPartnerDepartment = async (
  data: any,
  createdByUserId: number
) => {
  // ดึง facility_id ของ user ที่สร้าง
  const user = await UserModel.findByPk(createdByUserId, {
    include: [
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { is_active: true },
        required: false,
      },
    ],
  });

  const userEmployment = user?.user_employment as
    | UserEmploymentModel[]
    | undefined;
  if (
    !userEmployment ||
    userEmployment.length === 0 ||
    !userEmployment[0].facility_id
  ) {
    throw new Error("Cannot find facility_id for the user");
  }

  // เพิ่ม created_by และตั้งค่าเริ่มต้นสำหรับ partner department
  const departmentData = {
    name: data.name,
    type_id: data.type_id,
    facility_id: data.facility_id, // สำหรับ partner department ใช้ facility_id ที่ส่งมา
    parent_department_id: data.parent_department_id || null,
    is_active: data.is_active !== undefined ? data.is_active : true,
    dayoff_duedate: data.dayoff_duedate || 5,
    include_weekend:
      data.include_weekend !== undefined ? data.include_weekend : true,
    include_holiday:
      data.include_holiday !== undefined ? data.include_holiday : true,
    role_tags: data.role_tags || null,
    created_by: createdByUserId,
    updated_by: createdByUserId,
  };

  const newDepartment = await DepartmentModel.create(departmentData);

  // สร้าง shift types อัตโนมัติ 3 แบบสำหรับ partner department
  const defaultShiftTypes = [
    {
      name: "อบรม",
      start_time: "08:00:00",
      end_time: "17:00:00",
      roles_allowed: "Staff",
      department_id: newDepartment.id,
      facility_id: data.facility_id,
      is_active: true,
      created_by: createdByUserId,
      short_name: "TRN",
      color_code: "#B3E5FC",
      total_hours: 0.0,
      normal_hours: 0.0,
      ot_hours: 0.0,
      count_as_fte: false,
      count_as_working_hour: true,
      min_staff_weekday: 0,
      max_staff_weekday: 0,
      min_staff_weekend: 0,
      max_staff_weekend: 0,
      required_senior_count: 0,
      is_manual: true,
      is_default: true,
    },
    {
      name: "Vacation",
      start_time: "08:00:00",
      end_time: "17:00:00",
      roles_allowed: "Staff",
      department_id: newDepartment.id,
      facility_id: data.facility_id,
      is_active: true,
      created_by: createdByUserId,
      short_name: "V",
      color_code: "#AEC6CF",
      total_hours: 0.0,
      normal_hours: 0.0,
      ot_hours: 0.0,
      count_as_fte: false,
      count_as_working_hour: true,
      min_staff_weekday: 0,
      max_staff_weekday: 0,
      min_staff_weekend: 0,
      max_staff_weekend: 0,
      required_senior_count: 0,
      is_manual: true,
      is_default: true,
    },
    {
      name: "Day off",
      start_time: "08:00:00",
      end_time: "17:00:00",
      roles_allowed: "Staff",
      department_id: newDepartment.id,
      facility_id: data.facility_id,
      is_active: true,
      created_by: createdByUserId,
      short_name: "X",
      color_code: "#E6B3FF",
      total_hours: 0.0,
      normal_hours: 0.0,
      ot_hours: 0.0,
      count_as_fte: false,
      count_as_working_hour: false,
      min_staff_weekday: 0,
      max_staff_weekday: 0,
      min_staff_weekend: 0,
      max_staff_weekend: 0,
      required_senior_count: 0,
      is_manual: true,
      is_default: true,
    },
  ];

  // สร้าง shift types ทั้งหมด
  await ShiftTypesModel.bulkCreate(defaultShiftTypes);

  return newDepartment;
};

export const updateDepartment = async (
  id: number,
  updates: Partial<DepartmentModel> & {
    category_id?: number | null;
    sub_category_id?: number | null;
  },
  updatedByUserId: number
) => {
  const transaction = await sequelize.transaction();

  try {
    const department = await DepartmentModel.findByPk(id, { transaction });
    if (!department) {
      throw new Error("Department not found");
    }

    const { category_id, sub_category_id, ...departmentUpdates } = updates;

    if (Object.keys(departmentUpdates).length > 0) {
      const finalUpdates = {
        ...departmentUpdates,
        updated_by: updatedByUserId,
      };
      await department.update(finalUpdates, { transaction });
    }

    if (category_id !== undefined) {
      const existingLink = await DepartMentCategoryModel.findOne({
        where: {
          department_id: id,
          is_primary: 1,
        },
        transaction,
      });

      if (category_id) {
        if (existingLink) {
          await existingLink.update(
            {
              category_id: category_id,
              sub_category_id: sub_category_id || null,
              updated_by: updatedByUserId,
              is_active: 1,
            },
            { transaction }
          );
        } else {
          await DepartMentCategoryModel.create(
            {
              department_id: id,
              category_id: category_id,
              sub_category_id: sub_category_id || null,
              is_primary: 1,
              is_active: 1,
              created_by: updatedByUserId,
              updated_by: updatedByUserId,
            },
            { transaction }
          );
        }
      } else {
        if (existingLink) {
          await existingLink.update(
            {
              is_active: 0,
              updated_by: updatedByUserId,
            },
            { transaction }
          );
        }
      }
    }

    await transaction.commit();
    return department;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteDepartment = async (id: number) => {
  const department = await DepartmentModel.findByPk(id);
  if (!department) {
    throw new Error("Department not found");
  }
  return await department.destroy();
};

export const getDepartmentById = async (id: number) => {
  const department = await DepartmentModel.findByPk(id, {
    include: [
      {
        model: DepartmentTypeModel,
        as: "department_type", // ชื่อ alias ที่กำหนดใน association
        attributes: ["id", "name", "description"], // ดึงเฉพาะฟิลด์ที่ต้องการ
      },
      // {
      //   model: UserModel,
      //   as: "created_by_user", // Alias สำหรับ created_by
      //   attributes: ["id", "first_name"], // ดึงเฉพาะ id และ first_name
      // },
      // {
      //   model: UserModel,
      //   as: "updated_by_user", // Alias สำหรับ updated_by
      //   attributes: ["id", "first_name"], // ดึงเฉพาะ id และ first_name
      // },
    ],
  });

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};

export const getDepartmentByIdWithDetails = async (id: number) => {
  const department = await DepartmentModel.findByPk(id, {
    include: [
      {
        model: DepartmentTypeModel,
        as: "type",
        required: false,
      },
      {
        model: UserModel,
        as: "created_by_user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "updated_by_user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
      {
        model: DepartmentOperatingHoursModel,
        as: "department_operating_hours",
        required: false,
        where: { is_active: 1 },
      },
      {
        model: DepartmentSupervisorModel,
        as: "department_supervisors",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            required: false,
            attributes: getUserAttributes(),
          },
        ],
      },
      {
        model: ShiftTypesModel,
        as: "shift_types",
        required: false,
        include: [
          {
            model: ShiftTypeRoleModel,
            as: "shift_type_roles",
            required: false,
            where: { is_active: true },
            attributes: [
              "id",
              "shift_type_id",
              "role_id",
              "min_count",
              "max_count",
              "is_active",
            ],
            include: [
              {
                model: RoleModel,
                as: "role",
                required: false,
                attributes: ["id", "name", "description"],
              },
            ],
          },
          {
            model: ShiftTypeGroupTagModel,
            as: "shift_type_group_tags",
            required: false,
            where: { is_active: true },
            attributes: [
              "id",
              "shift_type_id",
              "user_group_tag_id",
              "min_count",
              "is_active",
            ],
            include: [
              {
                model: UserGroupTagModel,
                as: "user_group_tag",
                required: false,
                where: {
                  department_id: Sequelize.col("shift_types.department_id"),
                  is_active: true,
                },
                attributes: [
                  "id",
                  "name",
                  "description",
                  "color_code",
                  "role_id",
                  "department_id",
                ],
                include: [
                  {
                    model: RoleModel,
                    as: "role",
                    required: false,
                    attributes: ["id", "name", "description"],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "department_members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            required: false,
            attributes: getUserAttributes(),
          },
        ],
      },
    ],
  });

  if (!department) {
    throw new Error("Department not found");
  }

  // ประมวลผลข้อมูล shift types เพื่อเพิ่ม group_tag_requirements
  const departmentData = department.toJSON();

  if (departmentData.shift_types && departmentData.shift_types.length > 0) {
    departmentData.shift_types = departmentData.shift_types.map(
      (shiftType: any) => {
        // สร้าง group_tag_requirements จาก shift_type_group_tags
        if (
          shiftType.shift_type_group_tags &&
          shiftType.shift_type_group_tags.length > 0
        ) {
          const groupTagRequirements: { [key: string]: { min: number } } = {};

          shiftType.shift_type_group_tags.forEach((relation: any) => {
            if (relation.user_group_tag_id && relation.min_count > 0) {
              groupTagRequirements[relation.user_group_tag_id.toString()] = {
                min: relation.min_count,
              };
            }
          });

          shiftType.group_tag_requirements = groupTagRequirements;
        }

        return shiftType;
      }
    );
  }

  // Decrypt user data for created_by_user and updated_by_user
  if (departmentData.created_by_user) {
    departmentData.created_by_user = decryptAndCleanUserData(
      departmentData.created_by_user
    );
  }
  if (departmentData.updated_by_user) {
    departmentData.updated_by_user = decryptAndCleanUserData(
      departmentData.updated_by_user
    );
  }

  // Decrypt department supervisors
  if (departmentData.department_supervisors) {
    departmentData.department_supervisors = decryptDepartmentMembers(
      departmentData.department_supervisors
    );
  }

  return departmentData;
};

export const getDepartmentByFacilityId = async (facility_id: number) => {
  const departments = await DepartmentModel.findAll({ where: { facility_id } });
  if (!departments || departments.length === 0) {
    throw new Error("No departments found for the given facility_id");
  }
  return departments;
};

/**
 * ดึงข้อมูล Department ตาม Facility พร้อม Paging และ Search
 * @param facilityId - ID ของสถานพยาบาล
 * @param page - หมายเลขหน้า (default: 1)
 * @param pageSize - จำนวนข้อมูลต่อหน้า (default: 25)
 * @param searchQuery - คำค้นหา (ค้นจากชื่อ Department)
 */
export const getDepartmentByFacility = async (
  facilityId: number,
  page: number = 1,
  pageSize: number = 25,
  searchQuery?: string
) => {
  if (!facilityId) {
    throw new Error("Facility ID is required to fetch departments.");
  }

  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const whereClause: any = {
    facility_id: facilityId,
  };

  if (searchQuery) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
      { id: { [Op.like]: `%${searchQuery}%` } },
    ];
  }

  const { count, rows: departments } = await DepartmentModel.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: DepartmentTypeModel,
        as: "department_type",
        attributes: ["id", "name", "description"],
        required: false,
      },
      {
        model: FacilityModel,
        as: "facility",
        attributes: [
          "id",
          "name",
          "address",
          "latitude",
          "longitude",
          "is_active",
        ],
        required: false,
      },
      {
        model: UserEmploymentModel,
        as: "department_members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            required: false,
            attributes: getUserAttributes(),
            include: [
              {
                model: UserRoleModel,
                as: "user_role",
                required: false,
                attributes: ["id", "user_id", "role_id"],
              },
            ],
          },
        ],
      },
      {
        model: DepartmentSupervisorModel,
        as: "department_supervisors",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            required: false,
            attributes: getUserAttributes(),
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: limit,
    offset: offset,
    distinct: true,
  });

  if (!departments || departments.length === 0) {
    return { departments: [], total: 0 };
  }

  // ดึงข้อมูล roles สำหรับแต่ละ department ตาม role_tags
  const departmentsWithRoles = await Promise.all(
    departments.map(async (department) => {
      const departmentData = department.get({ plain: true });

      // Decrypt user data in department_members
      if (
        departmentData.department_members &&
        departmentData.department_members.length > 0
      ) {
        departmentData.department_members.forEach((member: any) => {
          if (member.user) {
            member.user = decryptAndCleanUserData(member.user);
          }
        });
      }

      // Decrypt user data in department_supervisors
      if (
        departmentData.department_supervisors &&
        departmentData.department_supervisors.length > 0
      ) {
        departmentData.department_supervisors.forEach((supervisor: any) => {
          if (supervisor.user) {
            supervisor.user = decryptAndCleanUserData(supervisor.user);
          }
        });
      }

      // Decrypt created_by_user data
      if (departmentData.created_by_user) {
        departmentData.created_by_user = decryptAndCleanUserData(
          departmentData.created_by_user
        );
      }

      // Decrypt updated_by_user data
      if (departmentData.updated_by_user) {
        departmentData.updated_by_user = decryptAndCleanUserData(
          departmentData.updated_by_user
        );
      }

      if (departmentData.role_tags) {
        // แปลง role_tags จาก comma-separated string เป็น array ของ role IDs
        const roleIds = departmentData.role_tags
          .split(",")
          .map((id: string) => parseInt(id.trim()))
          .filter((id: number) => !isNaN(id));

        if (roleIds.length > 0) {
          // ดึงข้อมูล roles จาก database
          const roles = await RoleModel.findAll({
            where: {
              id: roleIds,
              is_active: true,
            },
            attributes: ["id", "name", "description", "sort_order"],
          });

          departmentData.roles = roles;
        } else {
          departmentData.roles = [];
        }
      } else {
        departmentData.roles = [];
      }

      return departmentData;
    })
  );

  return { departments: departmentsWithRoles, total: count };
};

export const getPartnerDepartmentByFacility = async (
  userId: number,
  options: {
    searchQuery?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  console.log(
    `[getPartnerDepartmentByFacility] Starting function for userId: ${userId}`
  );

  const { searchQuery, page = 1, limit = 25 } = options;
  const offset = (page - 1) * limit;

  const userWithFacility = await UserModel.findOne({
    where: { id: userId },
    include: [
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { is_active: true },
        required: false,
        include: [
          {
            model: FacilityModel,
            as: "facility",
            where: { is_active: true },
            required: false,
          },
        ],
      },
    ],
  });

  const user_employment = userWithFacility?.user_employment as
    | UserEmploymentModel[]
    | undefined;

  if (!user_employment || user_employment.length === 0) {
    throw new Error("User employment data not found or empty");
  }

  if (!user_employment || !user_employment[0].facility_id) {
    throw new Error("Facility ID not found for the user");
  }

  const facilityId = user_employment[0].facility_id;

  const whereClause: any = { facility_id: facilityId };

  if (searchQuery) {
    const searchConditions: Record<string, any>[] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
    ];

    if (!isNaN(Number(searchQuery))) {
      searchConditions.push({ id: Number(searchQuery) });
    }

    whereClause[Op.or] = searchConditions;
  }

  const [totalCount, departments] = await Promise.all([
    DepartmentModel.count({
      where: whereClause,
    }),

    DepartmentModel.findAll({
      where: whereClause,
      include: [
        {
          model: DepartmentTypeModel,
          as: "type",
          required: false,
        },
        {
          model: DepartmentOperatingHoursModel,
          as: "department_operating_hours",
          required: false,
          where: { is_active: 1 },
        },
        {
          model: DepartmentSupervisorModel,
          as: "department_supervisors",
          required: false,
          include: [
            {
              model: UserModel,
              as: "user",
              required: false,
              attributes: getUserAttributes(),
            },
          ],
        },
        {
          model: ShiftTypesModel,
          as: "shift_types",
          where: { is_active: 1 },
          required: false,
          include: [
            {
              model: ShiftTypeRoleModel,
              as: "shift_type_roles",
              required: false,
              where: { is_active: true },
              include: [
                {
                  model: RoleModel,
                  as: "role",
                  required: false,
                  attributes: ["id", "name", "description"],
                },
              ],
            },
            {
              model: ShiftTypeGroupTagModel,
              as: "shift_type_group_tags",
              required: false,
              where: { is_active: true },
              attributes: [
                "id",
                "shift_type_id",
                "user_group_tag_id",
                "min_count",
                "priority_level",
                "is_primary_group",
                "is_active",
              ],
              include: [
                {
                  model: UserGroupTagModel,
                  as: "user_group_tag",
                  required: false,
                  where: {
                    department_id: Sequelize.col("shift_types.department_id"),
                    is_active: true,
                  },
                  attributes: [
                    "id",
                    "name",
                    "description",
                    "color_code",
                    "role_id",
                    "department_id",
                  ],
                  include: [
                    {
                      model: RoleModel,
                      as: "role",
                      required: false,
                      attributes: ["id", "name", "description"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: UserEmploymentModel,
          as: "department_members",
          required: false,
          where: { is_active: true },
          include: [
            {
              model: UserModel,
              as: "user",
              required: false,
              attributes: getUserAttributes(),
              include: [
                {
                  model: UserRoleModel,
                  as: "user_role",
                  required: false,
                  attributes: ["id", "user_id", "role_id"],
                  include: [
                    {
                      model: RoleModel,
                      as: "role",
                      required: false,
                      attributes: ["id", "name", "description"],
                    },
                  ],
                },
                {
                  model: UserGroupTagMemberModel,
                  as: "user_group_memberships",
                  required: false,
                  where: { is_active: true },
                  include: [
                    {
                      model: UserGroupTagModel,
                      as: "user_group_tag",
                      required: false,
                      where: {
                        is_active: true,
                      },
                      attributes: [
                        "id",
                        "name",
                        "description",
                        "is_active",
                        "role_id",
                        "department_id",
                      ],
                      include: [
                        {
                          model: RoleModel,
                          as: "role",
                          required: false,
                          attributes: ["id", "name", "description"],
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
      limit: limit,
      offset: offset,
      subQuery: true,
      order: [["name", "ASC"]],
    }),
  ]);

  if (!departments || departments.length === 0) {
    return {
      data: [],
      pagination: { total: 0, page, limit, totalPages: 0 },
    };
  }

  // ประมวลผลข้อมูล shift types เพื่อเพิ่ม group_tag_requirements
  console.log(
    `[getPartnerDepartmentByFacility] Found ${departments.length} departments, starting processing...`
  );
  const processedDepartments = departments.map((department) => {
    const departmentData = department.toJSON();

    if (departmentData.shift_types && departmentData.shift_types.length > 0) {
      departmentData.shift_types = departmentData.shift_types.map(
        (shiftType: any) => {
          // กรอง group tags ให้เฉพาะ department เดียวกับ shift type
          if (
            shiftType.shift_type_group_tags &&
            shiftType.shift_type_group_tags.length > 0
          ) {
            shiftType.shift_type_group_tags =
              shiftType.shift_type_group_tags.filter((relation: any) => {
                return (
                  relation.user_group_tag &&
                  relation.user_group_tag.department_id ===
                    shiftType.department_id
                );
              });
          }

          // สร้าง group_tag_requirements จาก shift_type_group_tags
          if (
            shiftType.shift_type_group_tags &&
            shiftType.shift_type_group_tags.length > 0
          ) {
            const groupTagRequirements: { [key: string]: { min: number } } = {};

            shiftType.shift_type_group_tags.forEach((relation: any) => {
              if (relation.user_group_tag_id && relation.min_count > 0) {
                groupTagRequirements[relation.user_group_tag_id.toString()] = {
                  min: relation.min_count,
                };
              }
            });

            shiftType.group_tag_requirements = groupTagRequirements;
          }

          return shiftType;
        }
      );
    }

    // กรอง user_group_tag ใน department_members ให้เฉพาะ department เดียวกัน
    console.log(
      `[getPartnerDepartmentByFacility] Processing department ${
        departmentData.id
      }, members count: ${
        departmentData.department_members?.length || 0
      }, supervisors count: ${
        departmentData.department_supervisors?.length || 0
      }`
    );
    if (
      departmentData.department_members &&
      departmentData.department_members.length > 0
    ) {
      departmentData.department_members.forEach((member: any) => {
        // Decrypt user data
        console.log(
          `[getPartnerDepartmentByFacility] About to decrypt member user data:`,
          member.user?.first_name?.substring(0, 20) + "..."
        );
        if (member.user) {
          member.user = decryptAndCleanUserData(member.user);
          console.log(
            `[getPartnerDepartmentByFacility] After decrypt member user:`,
            member.user?.first_name
          );
        }

        if (
          member.user &&
          member.user.user_group_memberships &&
          member.user.user_group_memberships.length > 0
        ) {
          member.user.user_group_memberships =
            member.user.user_group_memberships.filter((membership: any) => {
              return (
                membership.user_group_tag &&
                membership.user_group_tag.department_id === departmentData.id
              );
            });
        }
      });
    }

    // Decrypt department_supervisors user data (force reload)
    if (
      departmentData.department_supervisors &&
      departmentData.department_supervisors.length > 0
    ) {
      console.log(
        `[getPartnerDepartmentByFacility] Decrypting ${departmentData.department_supervisors.length} supervisors`
      );
      departmentData.department_supervisors.forEach((supervisor: any) => {
        console.log(
          `[getPartnerDepartmentByFacility] About to decrypt supervisor user data:`,
          supervisor.user?.first_name?.substring(0, 20) + "..."
        );
        if (supervisor.user) {
          supervisor.user = decryptAndCleanUserData(supervisor.user);
          console.log(
            `[getPartnerDepartmentByFacility] After decrypt supervisor user:`,
            supervisor.user?.first_name
          );
        }
      });
    }

    return departmentData;
  });

  return {
    data: processedDepartments,
    pagination: {
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const getPartnerDepartmentByFacilityId = async (facilityId: number) => {
  const departments = await DepartmentModel.findAll({
    where: { facility_id: facilityId },
    include: [
      {
        model: DepartmentTypeModel,
        as: "type",
        required: false,
      },
      {
        model: DepartmentOperatingHoursModel,
        as: "department_operating_hours",
        required: false,
        where: { is_active: 1 },
      },
      {
        model: DepartmentSupervisorModel,
        where: { is_active: 1 }, // true
        as: "department_supervisors",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            required: false,
            attributes: getUserAttributes(),
          },
        ],
      },
      {
        model: ShiftTypesModel,
        as: "shift_types",
        where: { is_active: 1 },
        required: false,
        include: [
          {
            model: ShiftTypeRoleModel,
            as: "shift_type_roles",
            required: false,
            where: { is_active: true },
            include: [
              {
                model: RoleModel,
                as: "role",
                required: false,
                attributes: ["id", "name", "description"],
              },
            ],
          },
          {
            model: ShiftTypeGroupTagModel,
            as: "shift_type_group_tags",
            required: false,
            where: { is_active: true },
            attributes: [
              "id",
              "shift_type_id",
              "user_group_tag_id",
              "min_count",
              "priority_level",
              "is_primary_group",
              "is_active",
            ],
            include: [
              {
                model: UserGroupTagModel,
                as: "user_group_tag",
                required: false,
                where: {
                  department_id: Sequelize.col("shift_types.department_id"),
                  is_active: true,
                },
                attributes: [
                  "id",
                  "name",
                  "description",
                  "color_code",
                  "role_id",
                  "department_id",
                ],
                include: [
                  {
                    model: RoleModel,
                    as: "role",
                    required: false,
                    attributes: ["id", "name", "description"],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "department_members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            required: false,
            attributes: getUserAttributes(),
            // ถ้า gender, status เป็น association ให้ include ด้วย
            include: [
              // ตัวอย่าง: ถ้ามี GenderModel, StatusModel และ association ใน UserModel
              // { model: GenderModel, as: "gender", attributes: ["id", "name"], required: false },
              // { model: StatusModel, as: "status", attributes: ["id", "name"], required: false },
              {
                model: UserRoleModel,
                as: "user_role",
                required: false,
                attributes: ["id", "user_id", "role_id"],
                include: [
                  {
                    model: RoleModel,
                    as: "role",
                    required: false,
                    attributes: ["id", "name", "description"],
                  },
                ],
              },
              {
                model: UserGroupTagMemberModel,
                as: "user_group_memberships",
                required: false,
                where: { is_active: true },
                include: [
                  {
                    model: UserGroupTagModel,
                    as: "user_group_tag",
                    required: false,
                    where: {
                      is_active: true,
                    },
                    attributes: [
                      "id",
                      "name",
                      "description",
                      "is_active",
                      "role_id",
                      "department_id",
                    ],
                    include: [
                      {
                        model: RoleModel,
                        as: "role",
                        required: false,
                        attributes: ["id", "name", "description"],
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
        model: DepartMentCategoryModel,
        as: "department_categories",
        required: false,
        where: {
          is_active: 1,
          is_primary: 1,
        },
        include: [
          {
            model: CategoryMasterModel,
            as: "category",
            required: false,
            attributes: ["id", "code", "name_th", "name_en", "scope"],
          },
          {
            model: SubCategoryMasterModel,
            as: "sub_category",
            required: false,
            attributes: ["id", "code", "name_th", "name_en"],
          },
        ],
      },
    ],
  });

  if (!departments || departments.length === 0) {
    throw new Error("No departments found for the given facility");
  }

  // ประมวลผลข้อมูล shift types เพื่อเพิ่ม group_tag_requirements
  console.log(
    `[getPartnerDepartmentByFacility] Found ${departments.length} departments, starting processing...`
  );
  const processedDepartments = departments.map((department) => {
    const departmentData = department.toJSON();

    if (departmentData.shift_types && departmentData.shift_types.length > 0) {
      departmentData.shift_types = departmentData.shift_types.map(
        (shiftType: any) => {
          // กรอง group tags ให้เฉพาะ department เดียวกับ shift type
          if (
            shiftType.shift_type_group_tags &&
            shiftType.shift_type_group_tags.length > 0
          ) {
            shiftType.shift_type_group_tags =
              shiftType.shift_type_group_tags.filter((relation: any) => {
                return (
                  relation.user_group_tag &&
                  relation.user_group_tag.department_id ===
                    shiftType.department_id
                );
              });
          }

          // สร้าง group_tag_requirements จาก shift_type_group_tags
          if (
            shiftType.shift_type_group_tags &&
            shiftType.shift_type_group_tags.length > 0
          ) {
            const groupTagRequirements: { [key: string]: { min: number } } = {};

            shiftType.shift_type_group_tags.forEach((relation: any) => {
              if (relation.user_group_tag_id && relation.min_count > 0) {
                groupTagRequirements[relation.user_group_tag_id.toString()] = {
                  min: relation.min_count,
                };
              }
            });

            shiftType.group_tag_requirements = groupTagRequirements;
          }

          return shiftType;
        }
      );
    }

    if (
      departmentData.department_categories &&
      departmentData.department_categories.length > 0
    ) {
      const primaryCategoryLink = departmentData.department_categories[0];

      departmentData.category_id = primaryCategoryLink.category_id;
      departmentData.sub_category_id = primaryCategoryLink.sub_category_id;

      departmentData.category = primaryCategoryLink.category;
      departmentData.sub_category = primaryCategoryLink.sub_category;
    }
    delete departmentData.department_categories;

    // กรอง user_group_tag ใน department_members ให้เฉพาะ department เดียวกัน
    console.log(
      `[getPartnerDepartmentByFacility] Processing department ${
        departmentData.id
      }, members count: ${
        departmentData.department_members?.length || 0
      }, supervisors count: ${
        departmentData.department_supervisors?.length || 0
      }`
    );
    if (
      departmentData.department_members &&
      departmentData.department_members.length > 0
    ) {
      departmentData.department_members.forEach((member: any) => {
        // Decrypt user data
        console.log(
          `[getPartnerDepartmentByFacility] About to decrypt member user data:`,
          member.user?.first_name?.substring(0, 20) + "..."
        );
        if (member.user) {
          member.user = decryptAndCleanUserData(member.user);
          console.log(
            `[getPartnerDepartmentByFacility] After decrypt member user:`,
            member.user?.first_name
          );
        }

        if (
          member.user &&
          member.user.user_group_memberships &&
          member.user.user_group_memberships.length > 0
        ) {
          member.user.user_group_memberships =
            member.user.user_group_memberships.filter((membership: any) => {
              return (
                membership.user_group_tag &&
                membership.user_group_tag.department_id === departmentData.id
              );
            });
        }
      });
    }

    // Decrypt department_supervisors user data (force reload)
    if (
      departmentData.department_supervisors &&
      departmentData.department_supervisors.length > 0
    ) {
      console.log(
        `[getPartnerDepartmentByFacility] Decrypting ${departmentData.department_supervisors.length} supervisors`
      );
      departmentData.department_supervisors.forEach((supervisor: any) => {
        console.log(
          `[getPartnerDepartmentByFacility] About to decrypt supervisor user data:`,
          supervisor.user?.first_name?.substring(0, 20) + "..."
        );
        if (supervisor.user) {
          supervisor.user = decryptAndCleanUserData(supervisor.user);
          console.log(
            `[getPartnerDepartmentByFacility] After decrypt supervisor user:`,
            supervisor.user?.first_name
          );
        }
      });
    }

    return departmentData;
  });

  return processedDepartments;
};

export const getAllDepartments = async () => {
  return await DepartmentModel.findAll();
};

export const getDepartmentsBySupervisor = async (userId: number) => {
  // หาข้อมูล department_supervisor ที่ user เป็น supervisor
  const supervisorDepartments = await DepartmentSupervisorModel.findAll({
    where: {
      user_id: userId,
      is_active: true,
    },
    include: [
      {
        model: DepartmentModel,
        as: "department",
        required: true,
        include: [
          {
            model: DepartmentTypeModel,
            as: "type",
            required: false,
          },
          {
            model: UserModel,
            as: "created_by_user",
            required: false,
            attributes: getBasicUserAttributes(),
          },
          {
            model: UserModel,
            as: "updated_by_user",
            required: false,
            attributes: getBasicUserAttributes(),
          },
          {
            model: DepartmentOperatingHoursModel,
            as: "department_operating_hours",
            required: false,
            where: { is_active: 1 },
          },
          {
            model: DepartmentSupervisorModel,
            as: "department_supervisors",
            required: false,
            include: [
              {
                model: UserModel,
                as: "user",
                required: false,
                attributes: getUserAttributes(),
              },
            ],
          },
          {
            model: ShiftTypesModel,
            as: "shift_types",
            required: false,
            include: [
              {
                model: ShiftTypeRoleModel,
                as: "shift_type_roles",
                required: false,
                where: { is_active: true },
                attributes: [
                  "id",
                  "shift_type_id",
                  "role_id",
                  "min_count",
                  "max_count",
                  "min_count_weekday",
                  "max_count_weekday",
                  "min_count_weekend",
                  "max_count_weekend",
                  "is_active",
                ],
                include: [
                  {
                    model: RoleModel,
                    as: "role",
                    required: false,
                    attributes: ["id", "name", "description"],
                  },
                ],
              },
              {
                model: ShiftTypeGroupTagModel,
                as: "shift_type_group_tags",
                required: false,
                where: { is_active: true },
                attributes: [
                  "id",
                  "shift_type_id",
                  "user_group_tag_id",
                  "min_count",
                  "priority_level",
                  "is_primary_group",
                  "is_active",
                ],
                include: [
                  {
                    model: UserGroupTagModel,
                    as: "user_group_tag",
                    required: false,
                    where: {
                      department_id: Sequelize.col("department.id"),
                      is_active: true,
                    },
                    attributes: [
                      "id",
                      "name",
                      "description",
                      "color_code",
                      "role_id",
                      "seq",
                      "department_id",
                    ],
                    include: [
                      {
                        model: RoleModel,
                        as: "role",
                        required: false,
                        attributes: ["id", "name", "description"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: UserEmploymentModel,
            as: "department_members",
            required: false,
            where: { is_active: true },
            include: [
              {
                model: UserModel,
                as: "user",
                required: false,
                attributes: getUserAttributes(),
                include: [
                  {
                    model: UserRoleModel,
                    as: "user_role",
                    required: false,
                    attributes: ["id", "user_id", "role_id"],
                    include: [
                      {
                        model: RoleModel,
                        as: "role",
                        required: false,
                        attributes: ["id", "name", "description"],
                      },
                    ],
                  },
                  {
                    model: UserGroupTagMemberModel,
                    as: "user_group_memberships",
                    required: false,
                    where: { is_active: true },
                    include: [
                      {
                        model: UserGroupTagModel,
                        as: "user_group_tag",
                        required: false,
                        where: {
                          department_id: Sequelize.col("department.id"),
                          is_active: true,
                        },
                        attributes: [
                          "id",
                          "name",
                          "description",
                          "color_code",
                          "role_id",
                          "seq",
                          "department_id",
                        ],
                        include: [
                          {
                            model: RoleModel,
                            as: "role",
                            required: false,
                            attributes: ["id", "name", "description"],
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
      },
      {
        model: UserModel,
        as: "user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
    ],
  });

  if (!supervisorDepartments || supervisorDepartments.length === 0) {
    throw new Error("No departments found for this supervisor");
  }

  // Process PIPEDA decryption for supervisorDepartments
  const processedSupervisorDepartments = supervisorDepartments.map(
    (supervisorDept: any) => {
      const supervisorDeptData = supervisorDept.get({ plain: true });

      // Decrypt user data for the supervisor
      if (supervisorDeptData.user) {
        supervisorDeptData.user = decryptAndCleanUserData(
          supervisorDeptData.user
        );
      }

      // Decrypt user data in department
      if (supervisorDeptData.department) {
        // Decrypt created_by_user data
        if (supervisorDeptData.department.created_by_user) {
          supervisorDeptData.department.created_by_user =
            decryptAndCleanUserData(
              supervisorDeptData.department.created_by_user
            );
        }

        // Decrypt updated_by_user data
        if (supervisorDeptData.department.updated_by_user) {
          supervisorDeptData.department.updated_by_user =
            decryptAndCleanUserData(
              supervisorDeptData.department.updated_by_user
            );
        }

        // Decrypt department_supervisors user data
        if (
          supervisorDeptData.department.department_supervisors &&
          supervisorDeptData.department.department_supervisors.length > 0
        ) {
          supervisorDeptData.department.department_supervisors.forEach(
            (supervisor: any) => {
              if (supervisor.user) {
                supervisor.user = decryptAndCleanUserData(supervisor.user);
              }
            }
          );
        }

        // Decrypt department_members user data
        if (
          supervisorDeptData.department.department_members &&
          supervisorDeptData.department.department_members.length > 0
        ) {
          supervisorDeptData.department.department_members.forEach(
            (member: any) => {
              if (member.user) {
                member.user = decryptAndCleanUserData(member.user);
              }
            }
          );
        }
      }

      return supervisorDeptData;
    }
  );

  return processedSupervisorDepartments;
};

export const getDepartmentWithUserGroupTags = async (departmentId: number) => {
  const department = await DepartmentModel.findByPk(departmentId, {
    include: [
      {
        model: DepartmentTypeModel,
        as: "type",
        required: false,
      },
      {
        model: UserModel,
        as: "created_by_user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "updated_by_user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
      {
        model: DepartmentOperatingHoursModel,
        as: "department_operating_hours",
        required: false,
        where: { is_active: 1 },
      },
      {
        model: DepartmentSupervisorModel,
        as: "department_supervisors",
        required: false,
        include: [
          {
            model: UserModel,
            as: "user",
            required: false,
            attributes: getUserAttributes(),
          },
        ],
      },
      {
        model: ShiftTypesModel,
        as: "shift_types",
        required: false,
      },
      {
        model: UserEmploymentModel,
        as: "department_members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            required: false,
            attributes: getUserAttributes(),
            include: [
              {
                model: UserRoleModel,
                as: "user_role",
                required: false,
                attributes: ["id", "user_id", "role_id"],
                include: [
                  {
                    model: RoleModel,
                    as: "role",
                    required: false,
                    attributes: ["id", "name", "description"],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: UserGroupTagModel,
        as: "user_group_tags",
        required: false,
        where: {
          department_id: departmentId,
          is_active: true,
        },
        attributes: [
          "id",
          "name",
          "description",
          "color_code",
          "department_id",
          "is_active",
          "role_id",
        ],
        include: [
          {
            model: RoleModel,
            as: "role",
            required: false,
            attributes: ["id", "name", "description"],
          },
          {
            model: UserGroupTagMemberModel,
            as: "members",
            required: false,
            where: { is_active: true },
            include: [
              {
                model: UserModel,
                as: "user",
                required: false,
                attributes: getUserAttributes(),
                include: [
                  {
                    model: UserRoleModel,
                    as: "user_role",
                    required: false,
                    attributes: ["id", "user_id", "role_id"],
                    include: [
                      {
                        model: RoleModel,
                        as: "role",
                        required: false,
                        attributes: ["id", "name", "description"],
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

  if (!department) {
    throw new Error("Department not found");
  }

  // Process PIPEDA decryption for department
  const departmentData = department.get({ plain: true });

  // Decrypt created_by_user data
  if (departmentData.created_by_user) {
    departmentData.created_by_user = decryptAndCleanUserData(
      departmentData.created_by_user
    );
  }

  // Decrypt updated_by_user data
  if (departmentData.updated_by_user) {
    departmentData.updated_by_user = decryptAndCleanUserData(
      departmentData.updated_by_user
    );
  }

  // Decrypt department_supervisors user data
  if (
    departmentData.department_supervisors &&
    departmentData.department_supervisors.length > 0
  ) {
    departmentData.department_supervisors.forEach((supervisor: any) => {
      if (supervisor.user) {
        supervisor.user = decryptAndCleanUserData(supervisor.user);
      }
    });
  }

  // Decrypt department_members user data
  if (
    departmentData.department_members &&
    departmentData.department_members.length > 0
  ) {
    departmentData.department_members.forEach((member: any) => {
      if (member.user) {
        member.user = decryptAndCleanUserData(member.user);
      }
    });
  }

  return departmentData;
};

/**
 * Service สำหรับดึงรายชื่อ Department เฉพาะ id และ name
 * สำหรับใช้ใน Dropdown โดยกรองตาม Facility ของ User
 */
export const getDepartmentsForDropdown = async (
  userId: number,
  options: {
    searchQuery?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  console.log(
    `[getDepartmentsForDropdown] Called for userId: ${userId} with options:`,
    options
  );

  const { searchQuery, page = 1, limit = 25 } = options;
  const offset = (page - 1) * limit;

  // --- หา Facility ID ของ User ---
  const userWithFacility = await UserModel.findOne({
    where: { id: userId },
    include: [
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { is_active: true },
        required: true,
        attributes: ["facility_id"],
      },
    ],
    attributes: ["id"],
  });

  const user_employment = userWithFacility?.user_employment as
    | UserEmploymentModel[]
    | undefined;

  if (
    !user_employment ||
    user_employment.length === 0 ||
    !user_employment[0].facility_id
  ) {
    console.error(
      `[getDepartmentsForDropdown] Facility ID not found for userId: ${userId}`
    );
    return {
      departments: [],
      pagination: { total: 0, page, limit, totalPages: 0 },
    };
  }

  const facilityId = user_employment[0].facility_id;
  console.log(`[getDepartmentsForDropdown] Found facilityId: ${facilityId}`);

  const whereClause: any = {
    facility_id: facilityId,
    is_active: true,
  };

  if (searchQuery) {
    const searchConditions: Record<string, any>[] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
    ];
    if (!isNaN(Number(searchQuery))) {
      searchConditions.push({ id: Number(searchQuery) });
    }
    whereClause[Op.or] = searchConditions;
  }

  console.log(
    "[getDepartmentsForDropdown] Querying departments with where:",
    whereClause
  );

  try {
    const { count, rows } = await DepartmentModel.findAndCountAll({
      where: whereClause,
      attributes: ["id", "name"],
      limit: limit,
      offset: offset,
      order: [["name", "ASC"]],
    });

    console.log(
      `[getDepartmentsForDropdown] Found ${rows.length} departments, total count: ${count}`
    );

    const totalPages = Math.ceil(count / limit);

    return {
      departments: rows,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        totalPages: totalPages,
      },
    };
  } catch (error) {
    console.error(
      `[getDepartmentsForDropdown] Error querying departments:`,
      error
    );
    throw new Error("Failed to fetch departments for dropdown.");
  }
};

export const removeMemberFromDepartment = async (
  departmentId: number,
  userId: number,
  updatedBy: number
) => {
  const result = await sequelize.transaction(async (t) => {
    await UserEmploymentModel.update(
      {
        is_active: false,
        updated_by: updatedBy,
        updated_at: new Date(),
      },
      {
        where: {
          department_id: departmentId,
          user_id: userId,
          is_active: true,
        },
        transaction: t,
      }
    );

    const departmentGroupTags = await UserGroupTagModel.findAll({
      where: {
        department_id: departmentId,
        is_active: true,
      },
      attributes: ["id"],
      transaction: t,
    });

    const groupTagIds = departmentGroupTags.map((tag) => tag.id);

    if (groupTagIds.length > 0) {
      await UserGroupTagMemberModel.update(
        {
          is_active: false,
          updated_by: updatedBy,
          updated_at: new Date(),
        },
        {
          where: {
            user_id: userId,

            user_group_tag_id: {
              [Op.in]: groupTagIds,
            },
            is_active: true,
          },
          transaction: t,
        }
      );
    }

    return true;
  });

  return result;
};
