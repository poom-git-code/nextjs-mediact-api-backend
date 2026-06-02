import DepartmentModel from '../models/DepartmentModel';
import UserEmploymentModel from '../models/UserEmploymentsModel';
import UserModel from '../models/UserModel';
import { Op, Order, Sequelize } from 'sequelize';
import FacilityModel from '../models/FacilitiesModel';
import DepartmentCertificationModel from '../models/DepartmentCertificationModel';
import DepartMentCategoryModel from '../models/DepartMentCategoryModel';
import UserRoleModel from '../models/UserRolesModel';
import UserCertificationModel from '../models/UserCertificationModel';
import WorkAreasModel from '../models/WorkAreasModel';
import UserExperienceModel from '../models/UserExperienceModel';
import { sequelize } from '../config/database';
import CategoryMasterModel from '../models/CategoryMasterModel';
import SubCategoryMasterModel from '../models/SubCategoryMasterModel';
import CertificationModel from '../models/CertificationModel';
import InstitutionModel from '../models/InstitutionModel';
import ApplicantReviewModel from '../models/ApplicantReviewModel';
import JobApplyModel from '../models/JobApplyModel';
import RoleModel from '../models/RolesModel';
import GenderModel from '../models/GenderModel';

interface AudienceOptions {
  page?: number;
  limit?: number;
  searchQuery?: string;
}

export const createEmployment = async (data: any) => {
  return await UserEmploymentModel.create(data);
};

export const updateEmployment = async (id: number, updates: Partial<UserEmploymentModel>) => {
  const employment = await UserEmploymentModel.findByPk(id);
  if (!employment) {
    throw new Error('Employment record not found');
  }
  return await employment.update(updates);
};

export const deleteEmployment = async (id: number) => {
  const employment = await UserEmploymentModel.findByPk(id);
  if (!employment) {
    throw new Error('Employment record not found');
  }
  return await employment.destroy();
};

export const getEmploymentById = async (id: number) => {
  const employment = await UserEmploymentModel.findByPk(id);
  if (!employment) {
    throw new Error('Employment record not found');
  }
  return employment;
};

export const getEmploymentsByUser = async (user_id: number) => {
  return await UserEmploymentModel.findAll({ where: { user_id } });
};

export const getAllEmployments = async () => {
  return await UserEmploymentModel.findAll();
};

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

export const getAudienceByPublishGroup = async (
  departmentId: number,
  publishGroup: 'hospital' | 'part-time' | 'system',
  options: AudienceOptions & { experienceRange?: string; requiredRoleId?: number | null } = {}
) => {
  const { page = 1, limit = 25, searchQuery, experienceRange, requiredRoleId } = options;
  const offset = (page - 1) * limit;

  console.log(`[Service] getAudienceByPublishGroup - departmentId: ${departmentId}, publishGroup: ${publishGroup}, roleId: ${requiredRoleId}`, options);

  // --- Validation ---
  if (!departmentId || isNaN(departmentId)) {
    const error = new Error(`Invalid Department ID provided.`);
    (error as any).status = 400;
    throw error;
  }

  const department = await DepartmentModel.findByPk(departmentId, {
    attributes: ["id", "facility_id", "role_tags", "name"],
    include: [
      {
        model: DepartMentCategoryModel,
        as: "department_categories",
        where: { is_active: 1 },
        required: false,
        attributes: ["category_id", "sub_category_id"],
        include: [
          {
            model: CategoryMasterModel,
            as: "category",
            attributes: ["name_th", "name_en"],
            required: false,
          },
          {
            model: SubCategoryMasterModel,
            as: "sub_category",
            attributes: ["name_th", "name_en"],
            required: false,
          },
        ]
      },
      {
        model: DepartmentCertificationModel,
        as: "department_certifications",
        required: false,
        attributes: ["certification_id"],
        include: [
          {
            model: CertificationModel,
            as: "certification",
            attributes: ["name_th", "name_en"],
            required: false,
          },
        ]
      },
    ],
  });

  if (!department) {
    const error = new Error(`Department with ID ${departmentId} not found`);
    (error as any).status = 404;
    throw error;
  }

  const facilityId = department.facility_id;
  if (!facilityId) {
    throw new Error(`Could not determine a valid Facility ID for department ${departmentId}`);
  }


  let totalCount: number = 0;
  let users: UserModel[] = [];
  let criteriaUsed: any = {};
  let allMatchingUserIds: number[] = [];

  const userAttributes = [
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
  ];

  const commonIncludeClause = [
    {
      model: UserExperienceModel,
      as: "user_experiences",
      attributes: [
        "id",
        "occupation_name",
        "occupation_place",
        "category_master_id",
        "sub_category_master_id",
        "experience_years",
        "experience_months",
      ],
      required: false,
      limit: 1,
      order: [
        ["experience_years", "DESC"],
        ["experience_months", "DESC"],
      ] as Order,
      separate: true,
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
    {
      model: UserEmploymentModel,
      as: "user_employment",
      where: { is_active: true },
      required: false,
      attributes: [
        "id",
        "facility_id",
        "department_id",
        "position_id",
        "is_part_time",
        "is_job_applicant",
        "start_date"
      ],
      include: [
        {
          model: FacilityModel,
          as: "facility",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: DepartmentModel,
          as: "department",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    },
  ];


  // สำหรับ System Group: ใช้ Alias `UserModel`
  const systemRatingLiteral = sequelize.literal(`(
    SELECT COALESCE(AVG(rating), 0)
    FROM applicant_reviews AS review
    INNER JOIN job_applies AS apply ON review.job_apply_id = apply.id
    WHERE apply.user_id = \`UserModel\`.\`id\`
  )`);

  // สำหรับ Hospital/Part-time: ใช้ Alias `user`
  const hospitalRatingLiteral = sequelize.literal(`(
    SELECT COALESCE(AVG(rating), 0)
    FROM applicant_reviews AS review
    INNER JOIN job_applies AS apply ON review.job_apply_id = apply.id
    WHERE apply.user_id = \`user\`.\`id\` 
  )`);

  if (publishGroup === 'system') {
    console.log('[Service] Publish group "system" - Strict Criteria Mode.');

    const facility = await FacilityModel.findByPk(facilityId, { attributes: ['province_code'] });
    const departmentProvinceCode = facility?.province_code || null;

    let requiredRoleIds: number[] = [];

    if (requiredRoleId) {
      console.log(`[Service] Using specific requiredRoleId: ${requiredRoleId}`);
      requiredRoleIds = [Number(requiredRoleId)]
    } else {
      console.log(`[Service] No specific roleId provided, falling back to Department role_tags`);
      const requiredRoleIds = (department.role_tags || '')
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id) && id > 0);
    }

    const requiredCertificationIds = [...new Set(
      (department.department_certifications ?? []).map((c: any) => c.certification_id)
    )];

    const requiredCategoryIds = [...new Set(
      (department.department_categories ?? []).map((c: any) => c.category_id).filter(Boolean) as number[]
    )];

    const expRangeConfig = parseExperienceRange(experienceRange);

    const getExpWhere = () => {
      if (requiredCategoryIds.length > 0) {
        return { category_master_id: { [Op.in]: requiredCategoryIds } };
      }
      return null;
    };
    
    const expWhereClause = getExpWhere();

    const [roles, certs, workAreas, exps] = await Promise.all([
      // Role
      (requiredRoleIds.length > 0) ? UserRoleModel.findAll({
        where: { role_id: { [Op.in]: requiredRoleIds }, is_active: true },
        attributes: ['user_id'], raw: true
      }) : Promise.resolve(null),

      // Certification
      (requiredCertificationIds.length > 0) ? UserCertificationModel.findAll({
        where: { certification_id: { [Op.in]: requiredCertificationIds } },
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

    allMatchingUserIds = candidateUserIds ? Array.from(candidateUserIds) : [];

    console.log(`[Service] Found ${allMatchingUserIds.length} users strictly matching ALL criteria.`);

    const facilityEmployeeUsers = await UserEmploymentModel.findAll({
      where: { facility_id: facilityId, is_active: true },
      attributes: ['user_id'], raw: true
    });
    const excludedUserIds = new Set(facilityEmployeeUsers.map((e: any) => e.user_id));

    const finalWhereClause: any = {
      status_id: 1, // Active User Only
      [Op.and]: []
    };

    if (allMatchingUserIds.length === 0) {
      finalWhereClause[Op.and].push({ id: null });
    } else {
      finalWhereClause.id = { [Op.in]: allMatchingUserIds };
    }

    if (excludedUserIds.size > 0) {
      if (finalWhereClause.id) {
        finalWhereClause.id = {
          [Op.and]: [
            finalWhereClause.id,
            { [Op.notIn]: Array.from(excludedUserIds) }
          ]
        };
      } else {
        finalWhereClause.id = { [Op.notIn]: Array.from(excludedUserIds) };
      }
    }

    if (searchQuery) {
      finalWhereClause[Op.and].push({
        [Op.or]: [
          { first_name: { [Op.like]: `%${searchQuery}%` } },
          { last_name: { [Op.like]: `%${searchQuery}%` } },
        ]
      });
    }

    const { count, rows: userRows } = await UserModel.findAndCountAll({
      where: finalWhereClause,
      attributes: ["id", [systemRatingLiteral, 'average_rating']],
      limit: limit,
      offset: offset,
      order: [
        [sequelize.literal('average_rating'), 'DESC'],
        ['id', 'ASC']
      ],
      distinct: true,
    });

    totalCount = count;
    const userIds = userRows.map((user) => user.id);

    // Fetch Full Details
    if (userIds.length > 0) {
      users = await UserModel.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: [...userAttributes, [systemRatingLiteral, 'average_rating']],
        include: commonIncludeClause,
      });

      users.sort((a, b) => {
        const ratingA = parseFloat(a.getDataValue('average_rating') as string || '0');
        const ratingB = parseFloat(b.getDataValue('average_rating') as string || '0');
        return ratingB - ratingA;
      });
    }

    criteriaUsed = {
      role_ids: requiredRoleIds,
      certification_ids: requiredCertificationIds,
      province_code: departmentProvinceCode,
      category_ids: requiredCategoryIds,
      experience_range: expRangeConfig
    };

  } else {
    // --- Logic: Hospital / Part-time ---
    console.log(`[Service] Publish group "${publishGroup}" - fetching from UserEmployment.`);

    const employmentWhereClause: any = {
      is_active: true,
      facility_id: facilityId
    };

    if (publishGroup === 'part-time') {
      employmentWhereClause[Op.or] = [{ is_job_applicant: true }, { is_part_time: true }];
    } else {
      employmentWhereClause.department_id = departmentId;
      employmentWhereClause.is_job_applicant = false;
      employmentWhereClause.is_part_time = false;
    }

    const userWhereClause: any = {};
    if (searchQuery) {
      userWhereClause[Op.or] = [
        { first_name: { [Op.like]: `%${searchQuery}%` } },
        { last_name: { [Op.like]: `%${searchQuery}%` } },
      ];
    }

    // ใช้ hospitalRatingLiteral
    const { count: empCount, rows: employments } = await UserEmploymentModel.findAndCountAll({
      where: employmentWhereClause,
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["id", [hospitalRatingLiteral, 'average_rating']],
          where: userWhereClause,
          required: true,
        },
      ],
      limit: limit,
      offset: offset,
      order: [
        [hospitalRatingLiteral, 'DESC'],
        ['user', 'id', 'ASC']
      ],
      distinct: true,
    });

    totalCount = empCount;
    const userIds = employments.map((emp) => emp.user_id).filter(Boolean) as number[];

    if (userIds.length > 0) {
      users = await UserModel.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: [...userAttributes, [systemRatingLiteral, 'average_rating']], // System หรือ Hospital literal ก็ได้เพราะ query จาก UserModel
        include: commonIncludeClause,
      });

      const userIdMap = new Map();
      employments.forEach(emp => {
        const u = emp.user as any;
        const rating = u?.getDataValue('average_rating') || 0;
        userIdMap.set(emp.user_id, parseFloat(rating));
      });

      users.sort((a, b) => (userIdMap.get(b.id) || 0) - (userIdMap.get(a.id) || 0));
    }
  }

  // --- Data Processing & Return ---
  console.log(`[Service] Found ${users.length} users (Page ${page}). Total: ${totalCount}`);

  const processedUsers = users.map((user) => {
    if (!user) return null;
    const compliantUser = user.toPipedaCompliantJSON();
    const userWithIncludes = user as any;

    compliantUser.user_experiences = userWithIncludes.user_experiences || [];
    compliantUser.user_certifications = userWithIncludes.user_certifications || [];
    compliantUser.user_roles = userWithIncludes.user_roles || [];
    compliantUser.user_gender = userWithIncludes.user_gender || null;
    compliantUser.user_employment = userWithIncludes.user_employment || [];

    const calculatedRating = user.getDataValue('average_rating');
    compliantUser.average_rating = parseFloat((calculatedRating as string) || "0");

    return compliantUser;
  }).filter(Boolean);

  const response: any = {
    data: processedUsers,
    pagination: {
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
    },
    department_details: department,
  };

  if (publishGroup === 'system') {
    response.system_filter_details = {
      criteria_used: criteriaUsed,
      matched_users: {
        total_unique_user_ids_matched: allMatchingUserIds.length,
      }
    };
  }

  return response;
};