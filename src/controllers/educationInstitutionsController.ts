import { Context } from 'koa';
import * as educationInstitutionsService from '../services/educationInstitutionsService';

// Get all education institutions
export const getAllEducationInstitutions = async (ctx: Context) => {
  try {
    const institutions = await educationInstitutionsService.getAll();
    ctx.body = institutions;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'Error fetching education institutions', error };
  }
};

// Get a single education institution by ID
export const getEducationInstitutionById = async (ctx: Context) => {
  try {
    const institution = await educationInstitutionsService.getById(ctx.params.id);
    if (!institution) {
      ctx.status = 404;
      ctx.body = { message: 'Education institution not found' };
      return;
    }
    ctx.body = institution;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'Error fetching education institution', error };
  }
};

// Create a new education institution
export const createEducationInstitution = async (ctx: Context) => {
  try {
    const newInstitution = await educationInstitutionsService.create(ctx.request.body);
    ctx.status = 201;
    ctx.body = newInstitution;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: 'Error creating education institution', error };
  }
};

// Update an existing education institution
export const updateEducationInstitution = async (ctx: Context) => {
  try {
    const updatedInstitution = await educationInstitutionsService.update(ctx.params.id, ctx.request.body);
    if (!updatedInstitution) {
      ctx.status = 404;
      ctx.body = { message: 'Education institution not found' };
      return;
    }
    ctx.body = updatedInstitution;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: 'Error updating education institution', error };
  }
};

// Delete an education institution
export const deleteEducationInstitution = async (ctx: Context) => {
  try {
    const deleted = await educationInstitutionsService.remove(ctx.params.id);
    if (!deleted) {
      ctx.status = 404;
      ctx.body = { message: 'Education institution not found' };
      return;
    }
    ctx.status = 204;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'Error deleting education institution', error };
  }
};