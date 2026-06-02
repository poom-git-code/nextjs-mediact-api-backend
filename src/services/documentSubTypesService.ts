import DocumentSubTypeModel from '../models/DocumentSubTypesModel';
import RoleDocumentModel from '../models/RoleDocumentsModel';
import RoleModel from '../models/RolesModel';
import { UserRoleModel } from '../models/UserRolesModel';
import { DocumentSubTypeCreationAttributes } from '../models/DocumentSubTypesModel';
import { Op } from 'sequelize';

// Create a new document sub type
export const createDocumentSubType = async (data: DocumentSubTypeCreationAttributes) => {
  try {
    const documentSubType = await DocumentSubTypeModel.create(data);
    
    return {
      success: true,
      data: documentSubType,
      message: 'Document sub type created successfully'
    };
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        success: false,
        message: 'Document sub type code already exists'
      };
    }
    throw error;
  }
};

// Get all document sub types with optional filtering
export const getDocumentSubTypes = async (filters: {
  is_active?: boolean;
  search?: string;
}) => {
  try {
    const { is_active, search } = filters;
    const whereClause: any = {};
    
    if (is_active !== undefined) {
      whereClause.is_active = is_active;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { sub_type_code: { [Op.like]: `%${search}%` } },
        { sub_type_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const documentSubTypes = await DocumentSubTypeModel.findAll({
      where: whereClause,
      order: [['sub_type_code', 'ASC']]
    });
    
    return {
      success: true,
      data: documentSubTypes
    };
  } catch (error: any) {
    throw error;
  }
};

// Get active document sub types only
export const getActiveDocumentSubTypes = async () => {
  try {
    const documentSubTypes = await DocumentSubTypeModel.findAll({
      where: { is_active: true },
      order: [['sub_type_code', 'ASC']]
    });
    
    return {
      success: true,
      data: documentSubTypes
    };
  } catch (error: any) {
    throw error;
  }
};

// Get document sub type by ID
export const getDocumentSubTypeById = async (id: number) => {
  try {
    const documentSubType = await DocumentSubTypeModel.findByPk(id);
    
    if (!documentSubType) {
      return {
        success: false,
        message: 'Document sub type not found'
      };
    }
    
    return {
      success: true,
      data: documentSubType
    };
  } catch (error: any) {
    throw error;
  }
};

// Get document sub type by code
export const getDocumentSubTypeByCode = async (code: string) => {
  try {
    const documentSubType = await DocumentSubTypeModel.findOne({
      where: { sub_type_code: code }
    });
    
    if (!documentSubType) {
      return {
        success: false,
        message: 'Document sub type not found'
      };
    }
    
    return {
      success: true,
      data: documentSubType
    };
  } catch (error: any) {
    throw error;
  }
};

// Get document sub types by user role (from token)
export const getDocumentSubTypesByUserRole = async (userId: number) => {
  try {
    // Find user's active roles
    const userRoles = await UserRoleModel.findAll({
      where: {
        user_id: userId,
        is_active: true
      },
      attributes: ['role_id']
    });
    
    if (userRoles.length === 0) {
      return {
        success: true,
        data: [],
        message: 'User has no active roles'
      };
    }
    
    const roleIds = userRoles.map(ur => ur.role_id);
    
    // Find document sub types required by user's roles
    const documentSubTypes = await DocumentSubTypeModel.findAll({
      include: [{
        model: RoleModel,
        as: 'roles_requiring_this_sub_type',
        where: {
          id: { [Op.in]: roleIds }
        },
        through: { attributes: [] }, // Exclude junction table attributes
        attributes: ['id', 'name'] // Include role info
      }],
      where: { is_active: true },
      order: [['sub_type_code', 'ASC']]
    });
    
    return {
      success: true,
      data: documentSubTypes,
      message: `Found ${documentSubTypes.length} document sub types required for user's roles`
    };
  } catch (error: any) {
    console.error('Error in getDocumentSubTypesByUserRole:', error);
    throw error;
  }
};

// Update document sub type
export const updateDocumentSubType = async (id: number, data: Partial<DocumentSubTypeCreationAttributes>) => {
  try {
    const documentSubType = await DocumentSubTypeModel.findByPk(id);
    
    if (!documentSubType) {
      return {
        success: false,
        message: 'Document sub type not found'
      };
    }
    
    await documentSubType.update(data);
    
    return {
      success: true,
      data: documentSubType,
      message: 'Document sub type updated successfully'
    };
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        success: false,
        message: 'Document sub type code already exists'
      };
    }
    throw error;
  }
};

// Delete document sub type (soft delete by setting is_active to false)
export const deleteDocumentSubType = async (id: number) => {
  try {
    const documentSubType = await DocumentSubTypeModel.findByPk(id);
    
    if (!documentSubType) {
      return {
        success: false,
        message: 'Document sub type not found'
      };
    }
    
    // Soft delete by setting is_active to false
    await documentSubType.update({ is_active: false });
    
    return {
      success: true,
      message: 'Document sub type deleted successfully'
    };
  } catch (error: any) {
    throw error;
  }
};

// Get document sub types by role ID (direct role lookup)
export const getDocumentSubTypesByRoleId = async (roleId: number) => {
  try {
    const documentSubTypes = await DocumentSubTypeModel.findAll({
      include: [{
        model: RoleModel,
        as: 'roles_requiring_this_sub_type',
        where: { id: roleId },
        through: { attributes: [] }, // Exclude junction table attributes
        attributes: ['id', 'name'] // Include role info
      }],
      where: { is_active: true },
      order: [['sub_type_code', 'ASC']]
    });
    
    return {
      success: true,
      data: documentSubTypes,
      message: `Found ${documentSubTypes.length} document sub types required for role ID ${roleId}`
    };
  } catch (error: any) {
    console.error('Error in getDocumentSubTypesByRoleId:', error);
    throw error;
  }
};