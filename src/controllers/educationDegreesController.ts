import { Context } from 'koa';
import EducationDegreeModel from '../models/EducationDegreesModel';

export const getAllEducationDegrees = async (ctx: Context) => {
  const degrees = await EducationDegreeModel.findAll();
  ctx.body = degrees;
};

export const getEducationDegreeById = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const degree = await EducationDegreeModel.findByPk(id);
  if (!degree) {
    ctx.status = 404;
    ctx.body = { message: 'Education degree not found' };
    return;
  }
  ctx.body = degree;
};

export const createEducationDegree = async (ctx: Context) => {
  const degree = await EducationDegreeModel.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = degree;
};

export const updateEducationDegree = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const degree = await EducationDegreeModel.findByPk(id);
  if (!degree) {
    ctx.status = 404;
    ctx.body = { message: 'Education degree not found' };
    return;
  }
  const updated = await degree.update(ctx.request.body);
  ctx.body = updated;
};

export const deleteEducationDegree = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const degree = await EducationDegreeModel.findByPk(id);
  if (!degree) {
    ctx.status = 404;
    ctx.body = { message: 'Education degree not found' };
    return;
  }
  await degree.destroy();
  ctx.body = { message: 'Education degree deleted successfully' };
};