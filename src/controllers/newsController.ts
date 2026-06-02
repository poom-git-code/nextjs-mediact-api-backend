import { Context } from "koa";
import * as NewsService from "../services/newsService";
import {
  createNewsSchema,
  updateNewsSchema,
} from "../validations/newsValidation";
import Joi from "joi";
import RoleModel from "../models/RolesModel";
import { Op } from "sequelize";

export const createNews = async (ctx: Context) => {
  const { error, value } = createNewsSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const news = await NewsService.createNews(value, userId);

    ctx.status = 201;
    ctx.body = { message: "News created successfully", news };
  } catch (error) {
    console.error("Failed to create news:", error);
    ctx.status = 500;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "An unknown error occurred" };
    }
  }
};

// เพิ่มฟังก์ชันนี้เข้าไปใน newsController.ts
export const createNewsAndBroadcast = async (ctx: Context) => {
  const { error, value } = createNewsSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const broadcastValue = { ...value, is_active: true };

    const news = await NewsService.createNewsAndBroadcast(broadcastValue, userId);

    ctx.status = 201;
    ctx.body = { message: "News created and broadcasted successfully", news };
  } catch (error) {
    console.error("Failed to create and broadcast news:", error);
    ctx.status = 500;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "An unknown error occurred" };
    }
  }
};

export const broadcastNews = async (ctx: Context) => {
  const { id } = ctx.params
  const broadcastData = ctx.request.body

  const userId = ctx.state.user?.id
  if (!userId) {
    ctx.status = 401
    ctx.body = { error: "Unauthorized: User ID not found in token" }
    return
  }

  try {
    await NewsService.broadcastNews(
      parseInt(id, 10),
      broadcastData,
      userId
    )

    ctx.status = 200
    ctx.body = { message: "Last update broadcast notification has been sent successfully." }
  } catch (error) {
    ctx.status = 500;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "An unknown error occurred while broadcasting the Last update." };
    }
  }
}

export const updateNews = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateNewsSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const updatedNews = await NewsService.updateNews(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { message: "News updated successfully", updatedNews };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const deleteNews = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    await NewsService.deleteNews(Number(ctx.params.id), userId);
    ctx.body = { message: "News deleted successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getNewsById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const userId = ctx.state.user?.id; // ดึง userId จาก authentication
    const news = await NewsService.getNewsById(parseInt(id, 10), userId);
    ctx.body = { news };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAllNews = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id; // ดึง userId จาก authentication
    const newsList = await NewsService.getAllNews(userId);
    ctx.body = { newsList };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAllNewsManagement = async (ctx: Context) => {
  try {
    const events = await NewsService.getAllNewsManagement();

    const roleIds = new Set<number>();
    events.forEach(event => {
      if (event.role_tags) {
        event.role_tags.split(',').forEach(idStr => {
          const id = parseInt(idStr.trim(), 10);
          if (!isNaN(id)) {
            roleIds.add(id)
          }
        });
      }
    });

    const roles = await RoleModel.findAll({
      where: {
        id: {
          [Op.in]: [...roleIds]
        }
      },
      attributes: ['id', 'name']
    });

    const roleMap = new Map<number, string>();
    roles.forEach(role => {
      roleMap.set(role.id, role.name)
    });

    const results = events.map(event => {
      const roleNames: string[] = [];
      if (event.role_tags) {
        event.role_tags.split(',').forEach(idStr => {
          const id = parseInt(idStr.trim(), 10);
          const name = roleMap.get(id);
          if (name) {
            roleNames.push(name);
          }
        });
      }

      return {
        ...event.toJSON(),
        role_names: roleNames,
      };
    });

    ctx.body = { newsList: results };

  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};
