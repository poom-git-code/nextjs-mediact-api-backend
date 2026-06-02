import { Context } from "koa";
import * as UserGroupTagService from "../services/userGroupTagService";
import {
  createUserGroupTagSchema,
  updateUserGroupTagSchema,
  addUserToGroupTagSchema,
  addUserToMultipleGroupTagsSchema,
  getUserGroupTagsByRoleSchema,
  getUserGroupTagsByDepartmentAndRoleSchema,
} from "../validations/userGroupTagValidation";

export const createUserGroupTag = async (ctx: Context) => {
  try {
    const { error, value } = createUserGroupTagSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    const groupTag = await UserGroupTagService.createUserGroupTag(value, userId);
    ctx.status = 201;
    ctx.body = { message: "User group tag created successfully", data: groupTag };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const updateUserGroupTag = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid group tag ID" };
      return;
    }

    const { error, value } = updateUserGroupTagSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    const groupTag = await UserGroupTagService.updateUserGroupTag(id, value, userId);
    ctx.status = 200;
    ctx.body = { message: "User group tag updated successfully", data: groupTag };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const deleteUserGroupTag = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid group tag ID" };
      return;
    }

    await UserGroupTagService.deleteUserGroupTag(id);
    ctx.status = 200;
    ctx.body = { message: "User group tag deleted successfully" };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const getUserGroupTagById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid group tag ID" };
      return;
    }

    const groupTag = await UserGroupTagService.getUserGroupTagById(id);
    ctx.status = 200;
    ctx.body = { data: groupTag };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const getUserGroupTagsByDepartment = async (ctx: Context) => {
  try {
    const departmentId = parseInt(ctx.params.departmentId);
    if (isNaN(departmentId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid department ID" };
      return;
    }

    const groupTags = await UserGroupTagService.getUserGroupTagsByDepartment(departmentId);
    ctx.status = 200;
    ctx.body = { data: groupTags };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const addUserToGroupTag = async (ctx: Context) => {
  try {
    const groupTagId = parseInt(ctx.params.id);
    if (isNaN(groupTagId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid group tag ID" };
      return;
    }

    const { error, value } = addUserToGroupTagSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    const member = await UserGroupTagService.addUserToGroupTag(
      groupTagId,
      value.user_id,
      userId
    );
    ctx.status = 201;
    ctx.body = { message: "User added to group tag successfully", data: member };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const removeUserFromGroupTag = async (ctx: Context) => {
  try {
    const groupTagId = parseInt(ctx.params.id);
    const userId = parseInt(ctx.params.userId);

    if (isNaN(groupTagId) || isNaN(userId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid group tag ID or user ID" };
      return;
    }

    const updatedBy = ctx.state.user?.id;
    if (!updatedBy) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    await UserGroupTagService.removeUserFromGroupTag(groupTagId, userId, updatedBy);
    ctx.status = 200;
    ctx.body = { message: "User removed from group tag successfully" };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const getUserGroupTags = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.userId);
    if (isNaN(userId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid user ID" };
      return;
    }

    const groupTags = await UserGroupTagService.getUserGroupTags(userId);
    ctx.status = 200;
    ctx.body = { data: groupTags };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const addUserToMultipleGroupTags = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.userId);
    if (isNaN(userId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid user ID" };
      return;
    }

    const { error, value } = addUserToMultipleGroupTagsSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const createdBy = ctx.state.user?.id;
    if (!createdBy) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    const results = await UserGroupTagService.addUserToMultipleGroupTags(
      userId,
      value.group_tag_ids,
      createdBy
    );
    
    ctx.status = 200;
    ctx.body = { 
      message: "Group tag membership processed", 
      results 
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const removeUserFromMultipleGroupTags = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.userId);
    if (isNaN(userId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid user ID" };
      return;
    }

    const { error, value } = addUserToMultipleGroupTagsSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const updatedBy = ctx.state.user?.id;
    if (!updatedBy) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    const results = await UserGroupTagService.removeUserFromMultipleGroupTags(
      userId,
      value.group_tag_ids,
      updatedBy
    );
    
    ctx.status = 200;
    ctx.body = { 
      message: "Group tag membership removal processed", 
      results 
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const getUsersByGroupTag = async (ctx: Context) => {
  try {
    const groupTagId = parseInt(ctx.params.id);
    if (isNaN(groupTagId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid group tag ID" };
      return;
    }

    const users = await UserGroupTagService.getUsersByGroupTag(groupTagId);
    ctx.status = 200;
    ctx.body = { data: users };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const getUsersInDepartmentByGroupTags = async (ctx: Context) => {
  try {
    const departmentId = parseInt(ctx.params.departmentId);
    if (isNaN(departmentId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid department ID" };
      return;
    }

    const groupTagsWithUsers = await UserGroupTagService.getUsersInDepartmentByGroupTags(departmentId);
    ctx.status = 200;
    ctx.body = { data: groupTagsWithUsers };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const getAllUserGroupTags = async (ctx: Context) => {
  try {
    const groupTags = await UserGroupTagService.getAllUserGroupTags();
    ctx.status = 200;
    ctx.body = { data: groupTags };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const getUserGroupTagsByRole = async (ctx: Context) => {
  try {
    const { error, value } = getUserGroupTagsByRoleSchema.validate(ctx.query);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const { role_id, department_id } = value;
    const groupTags = await UserGroupTagService.getUserGroupTagsByRole(role_id, department_id);
    
    ctx.status = 200;
    ctx.body = { 
      message: "User group tags retrieved successfully", 
      data: groupTags,
      count: groupTags.length 
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};

export const getUserGroupTagsByDepartmentAndRole = async (ctx: Context) => {
  try {
    const { error, value } = getUserGroupTagsByDepartmentAndRoleSchema.validate(ctx.query);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const { department_id, role_id } = value;
    const groupTags = await UserGroupTagService.getUserGroupTagsByDepartmentAndRole(department_id, role_id);
    
    ctx.status = 200;
    ctx.body = { 
      message: "User group tags retrieved successfully", 
      data: groupTags,
      count: groupTags.length 
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
};
