import * as educationService from '../services/educationService';
import { Context } from 'koa';

export const getAllEducations = async (ctx: Context) => {
  const educations = await educationService.getAllEducations();
  ctx.body = educations;
};

export const getEducationById = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const education = await educationService.getEducationById(id);
  if (!education) {
    ctx.status = 404;
    ctx.body = { message: 'Education not found' };
    return;
  }
  ctx.body = education;
};

export const createEducation = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  const education = await educationService.createEducation({
    ...ctx.request.body,
    created_by: userId,
    updated_by: userId,
  });
  ctx.status = 201;
  ctx.body = education;
};

export const updateEducation = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const userId = ctx.state.user?.id;
  const updated = await educationService.updateEducation(id, {
    ...ctx.request.body,
    updated_by: userId,
  });
  if (!updated) {
    ctx.status = 404;
    ctx.body = { message: 'Education not found' };
    return;
  }
  ctx.body = updated;
};

export const deleteEducation = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const deleted = await educationService.deleteEducation(id);
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { message: 'Education not found' };
    return;
  }
  ctx.body = { message: 'Education deleted successfully' };
};