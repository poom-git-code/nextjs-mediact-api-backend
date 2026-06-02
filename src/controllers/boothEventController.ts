import { Context } from "koa";
import * as BoothEventService from "../services/boothEventService";
import Joi from "joi";
import {
  createBoothEventSchema,
  updateBoothEventSchema,
} from "../validations/boothEventValidation";

export const createBoothEvent = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createBoothEventSchema.validate(data);
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
    const event = await BoothEventService.createBoothEvent(
      { ...value, created_by: userId, updated_by: userId },
      userId
    );
    ctx.status = 201;
    ctx.body = { message: "Booth event created successfully", event };
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

export const updateBoothEvent = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;

  const { error, value } = updateBoothEventSchema.validate(updates);
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
    const updatedEvent = await BoothEventService.updateBoothEvent(
      Number(id),
      { ...value, updated_by: userId },
      userId
    );
    ctx.body = { message: "Booth event updated successfully", updatedEvent };
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

export const deleteBoothEvent = async (ctx: Context) => {
  const { id } = ctx.params;
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }
  try {
    await BoothEventService.deleteBoothEvent(Number(id), userId);
    ctx.body = { message: "Booth event deleted successfully" };
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

export const getBoothEventById = async (ctx: Context) => {
  try {
    const event = await BoothEventService.getBoothEventById(
      Number(ctx.params.id)
    );
    ctx.body = { event };
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

export const getAllBoothEvents = async (ctx: Context) => {
  try {
    const events = await BoothEventService.getAllBoothEvents();
    ctx.body = { events };
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

export const getAllBoothEventsManagement = async (ctx: Context) => {
  try {
    const events = await BoothEventService.getAllBoothEventsManagement();
    ctx.body = { events };
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
