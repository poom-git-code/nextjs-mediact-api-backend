import UserExperienceModel from "../models/UserExperienceModel";
import {
  getUserAttributes,
  getBasicUserAttributes,
  getUserWithUsernameAttributes,
  decryptAndCleanUserData,
} from "../utils/encryptedFieldMapping";
import UserModel from "../models/UserModel";
import CategoryMasterModel from "../models/CategoryMasterModel";
import SubCategoryMasterModel from "../models/SubCategoryMasterModel";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";

interface QueryOptions {
  page?: number;
  limit?: number;
}

export const createUserExperience = async (data: {
  user_id?: number;
  experience_years?: number;
  experience_months?: number;
  occupation_place: string;
  occupation_name?: string;
  category_master_id?: number | null;
  sub_category_master_id?: number | null;
}) => {
  return await UserExperienceModel.create(data as any);
};

export const getUserExperiences = async (userId: number) => {
  const experiences = await UserExperienceModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Decrypt user data and attach category/subcategory when available
  const processedExperiences = await Promise.all(
    experiences.map(async (experience: any) => {
      const experienceData = experience.get({ plain: true });
      if (experienceData.user) {
        experienceData.user = decryptAndCleanUserData(experienceData.user);
      }

      if (experienceData.category_master_id) {
        const cat = await CategoryMasterModel.findByPk(
          Number(experienceData.category_master_id)
        );
        if (cat) experienceData.category = cat.get({ plain: true });
      }

      if (experienceData.sub_category_master_id) {
        const sub = await SubCategoryMasterModel.findByPk(
          Number(experienceData.sub_category_master_id)
        );
        if (sub) experienceData.sub_category = sub.get({ plain: true });
      }

      return experienceData;
    })
  );

  return processedExperiences;
};

export const getUserExperienceById = async (id: number) => {
  const experience = await UserExperienceModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
    ],
  });

  if (!experience) {
    throw new Error("User experience not found");
  }

  // Decrypt user data
  const experienceData = experience.get({ plain: true });
  if (experienceData.user) {
    experienceData.user = decryptAndCleanUserData(experienceData.user);
  }

  // attach category and subcategory details when available
  if (experienceData.category_master_id) {
    const cat = await CategoryMasterModel.findByPk(
      Number(experienceData.category_master_id)
    );
    if (cat) experienceData.category = cat.get({ plain: true });
  }

  if (experienceData.sub_category_master_id) {
    const sub = await SubCategoryMasterModel.findByPk(
      Number(experienceData.sub_category_master_id)
    );
    if (sub) experienceData.sub_category = sub.get({ plain: true });
  }

  return experienceData;
};

export const updateUserExperience = async (
  id: number,
  updates: Partial<UserExperienceModel>,
  userId?: number
) => {
  const experience = await UserExperienceModel.findByPk(id);
  if (!experience) {
    throw new Error("User experience not found");
  }

  // // verify ownership when userId provided
  // if (userId && Number(experience.get('user_id')) !== Number(userId)) {
  //   throw new Error('Not authorized to update this record');
  // }

  // Only update allowed fields (including the new optional fields)
  const allowed: any = {};
  if ((updates as any).experience_years !== undefined)
    allowed.experience_years = (updates as any).experience_years;
  if ((updates as any).experience_months !== undefined)
    allowed.experience_months = (updates as any).experience_months;
  if ((updates as any).occupation_place !== undefined)
    allowed.occupation_place = (updates as any).occupation_place;
  if ((updates as any).occupation_name !== undefined)
    allowed.occupation_name = (updates as any).occupation_name;
  if ((updates as any).category_master_id !== undefined)
    allowed.category_master_id = (updates as any).category_master_id;
  if ((updates as any).sub_category_master_id !== undefined)
    allowed.sub_category_master_id = (updates as any).sub_category_master_id;

  return await experience.update(allowed as any);
};

export const deleteUserExperience = async (id: number) => {
  const experience = await UserExperienceModel.findByPk(id);
  if (!experience) {
    throw new Error("User experience not found");
  }

  return await experience.destroy();
};

export const getAllUserExperiences = async () => {
  const experiences = await UserExperienceModel.findAll({
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Decrypt user data
  const processedExperiences = await Promise.all(
    experiences.map(async (experience: any) => {
      const experienceData = experience.get({ plain: true });
      if (experienceData.user) {
        experienceData.user = decryptAndCleanUserData(experienceData.user);
      }

      // attach category/subcategory details when available
      if (experienceData.category_master_id) {
        const cat = await CategoryMasterModel.findByPk(
          Number(experienceData.category_master_id)
        );
        if (cat) experienceData.category = cat.get({ plain: true });
      }

      if (experienceData.sub_category_master_id) {
        const sub = await SubCategoryMasterModel.findByPk(
          Number(experienceData.sub_category_master_id)
        );
        if (sub) experienceData.sub_category = sub.get({ plain: true });
      }

      return experienceData;
    })
  );

  return processedExperiences;
};

export const getApplicantExperiences = async (
  userId: number,
  options: QueryOptions = {}
) => {
  const { page = 1, limit = 25 } = options;
  const offset = (page - 1) * limit;

  const { count, rows: experiences } = await UserExperienceModel.findAndCountAll({
    where: { user_id: userId },
    limit: limit,
    offset: offset,
    order: [
      ["experience_years", "DESC"],
      ["experience_months", "DESC"],
    ],
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: CategoryMasterModel,
        as: "category_master",
        attributes: ["id", "name_th", "name_en"],
        required: false,
      },
      {
        model: SubCategoryMasterModel,
        as: "sub_category_master",
        attributes: ["id", "name_th", "name_en"],
        required: false,
      },
    ],
    distinct: true,
  });

  const processedExperiences = experiences.map((experience) => {
    const experienceData = experience.get({ plain: true });

    if (experienceData.user) {
      experienceData.user = decryptAndCleanUserData(experienceData.user);
    }

    return experienceData;
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: processedExperiences,
    pagination: {
      total: count,
      page: page,
      limit: limit,
      totalPages: totalPages,
    },
  };
};