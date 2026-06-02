import { Context } from 'koa';
import * as DocumentTypeService from '../services/documentTypeService';
import { createDocumentTypeSchema, updateDocumentTypeSchema, getDocumentTypesQuerySchema } from '../validations/documentTypeValidation';

// Create document type
export const createDocumentType = async (ctx: Context) => {
  try {
    const { error, value } = createDocumentTypeSchema.validate(ctx.request.body);
    
    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
      return;
    }
    
    const result = await DocumentTypeService.createDocumentType(value);
    
    if (result.success) {
      ctx.status = 201;
      ctx.body = result;
    } else {
      ctx.status = 400;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
  }
};

// Get all document types
export const getDocumentTypes = async (ctx: Context) => {
  try {
    const { error, value } = getDocumentTypesQuerySchema.validate(ctx.query);
    
    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
      return;
    }
    
    const result = await DocumentTypeService.getDocumentTypes(value);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
  }
};

// Get active document types (for dropdown)
export const getActiveDocumentTypes = async (ctx: Context) => {
  try {
    const result = await DocumentTypeService.getActiveDocumentTypes();
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
  }
};

// Get document type by ID
export const getDocumentTypeById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Invalid document type ID'
      };
      return;
    }
    
    const result = await DocumentTypeService.getDocumentTypeById(id);
    
    if (result.success) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
  }
};

// Get document type by code
export const getDocumentTypeByCode = async (ctx: Context) => {
  try {
    const typeCode = ctx.params.code;
    
    if (!typeCode) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Document type code is required'
      };
      return;
    }
    
    const result = await DocumentTypeService.getDocumentTypeByCode(typeCode);
    
    if (result.success) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
  }
};

// Update document type
export const updateDocumentType = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Invalid document type ID'
      };
      return;
    }
    
    const { error, value } = updateDocumentTypeSchema.validate(ctx.request.body);
    
    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
      return;
    }
    
    const result = await DocumentTypeService.updateDocumentType(id, value);
    
    if (result.success) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
  }
};

// Delete document type
export const deleteDocumentType = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Invalid document type ID'
      };
      return;
    }
    
    const result = await DocumentTypeService.deleteDocumentType(id);
    
    if (result.success) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = 400;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
  }
};