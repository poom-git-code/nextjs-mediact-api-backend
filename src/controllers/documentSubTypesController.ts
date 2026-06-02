import { Context } from 'koa';
import * as DocumentSubTypesService from '../services/documentSubTypesService';

// Create document sub type
export const createDocumentSubType = async (ctx: Context) => {
  try {
    const { sub_type_code, sub_type_name, description, is_active = true } = ctx.request.body as any;
    
    if (!sub_type_code || !sub_type_name) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'sub_type_code and sub_type_name are required'
      };
      return;
    }
    
    const result = await DocumentSubTypesService.createDocumentSubType({
      sub_type_code,
      sub_type_name,
      description,
      is_active
    });
    
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

// Get all document sub types
export const getDocumentSubTypes = async (ctx: Context) => {
  try {
    const { is_active, search } = ctx.query;
    
    const filters = {
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      search: search as string
    };
    
    const result = await DocumentSubTypesService.getDocumentSubTypes(filters);
    
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

// Get active document sub types only
export const getActiveDocumentSubTypes = async (ctx: Context) => {
  try {
    const result = await DocumentSubTypesService.getActiveDocumentSubTypes();
    
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

// Get document sub type by ID
export const getDocumentSubTypeById = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const documentSubTypeId = parseInt(id);
    
    if (isNaN(documentSubTypeId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Invalid document sub type ID'
      };
      return;
    }
    
    const result = await DocumentSubTypesService.getDocumentSubTypeById(documentSubTypeId);
    
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

// Get document sub type by code
export const getDocumentSubTypeByCode = async (ctx: Context) => {
  try {
    const { code } = ctx.params;
    
    const result = await DocumentSubTypesService.getDocumentSubTypeByCode(code);
    
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

// Get document sub types by user role (from token)
export const getDocumentSubTypesByUserRole = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    
    if (!userId) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: 'User not authenticated'
      };
      return;
    }
    
    const result = await DocumentSubTypesService.getDocumentSubTypesByUserRole(userId);
    
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

// Get document sub types by role ID (direct role lookup)
export const getDocumentSubTypesByRoleId = async (ctx: Context) => {
  try {
    const { role_id } = ctx.params;
    const roleId = parseInt(role_id);
    
    if (isNaN(roleId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Invalid role ID'
      };
      return;
    }
    
    const result = await DocumentSubTypesService.getDocumentSubTypesByRoleId(roleId);
    
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

// Update document sub type
export const updateDocumentSubType = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const documentSubTypeId = parseInt(id);
    
    if (isNaN(documentSubTypeId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Invalid document sub type ID'
      };
      return;
    }
    
    const { sub_type_code, sub_type_name, description, is_active } = ctx.request.body as any;
    
    const updateData: any = {};
    if (sub_type_code !== undefined) updateData.sub_type_code = sub_type_code;
    if (sub_type_name !== undefined) updateData.sub_type_name = sub_type_name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    const result = await DocumentSubTypesService.updateDocumentSubType(documentSubTypeId, updateData);
    
    if (result.success) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = result.message === 'Document sub type not found' ? 404 : 400;
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

// Delete document sub type
export const deleteDocumentSubType = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const documentSubTypeId = parseInt(id);
    
    if (isNaN(documentSubTypeId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Invalid document sub type ID'
      };
      return;
    }
    
    const result = await DocumentSubTypesService.deleteDocumentSubType(documentSubTypeId);
    
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