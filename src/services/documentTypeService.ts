import DocumentTypeModel from '../models/DocumentTypeModel';
import UserDocumentModel from '../models/UserDocumentModel';
import { DocumentTypeCreationAttributes } from '../models/DocumentTypeModel';
import { Op } from 'sequelize';

// Create a new document type
export const createDocumentType = async (data: DocumentTypeCreationAttributes) => {
  try {
    const documentType = await DocumentTypeModel.create(data);
    
    return {
      success: true,
      data: documentType,
      message: 'Document type created successfully'
    };
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        success: false,
        message: 'Document type code already exists'
      };
    }
    throw error;
  }
};

// Get all document types with optional filtering
export const getDocumentTypes = async (filters: {
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
        { type_code: { [Op.like]: `%${search}%` } },
        { type_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const documentTypes = await DocumentTypeModel.findAll({
      where: whereClause,
      order: [['type_code', 'ASC']]
    });
    
    return {
      success: true,
      data: documentTypes
    };
  } catch (error: any) {
    throw error;
  }
};

// Get document type by ID
export const getDocumentTypeById = async (id: number) => {
  try {
    const documentType = await DocumentTypeModel.findByPk(id, {
      include: [
        {
          model: UserDocumentModel,
          as: 'user_documents',
          attributes: ['id', 'user_id', 'status'],
          required: false
        }
      ]
    });
    
    if (!documentType) {
      return {
        success: false,
        message: 'Document type not found'
      };
    }
    
    return {
      success: true,
      data: documentType
    };
  } catch (error: any) {
    throw error;
  }
};

// Get document type by code
export const getDocumentTypeByCode = async (typeCode: string) => {
  try {
    const documentType = await DocumentTypeModel.findOne({
      where: { type_code: typeCode }
    });
    
    if (!documentType) {
      return {
        success: false,
        message: 'Document type not found'
      };
    }
    
    return {
      success: true,
      data: documentType
    };
  } catch (error: any) {
    throw error;
  }
};

// Update document type
export const updateDocumentType = async (id: number, data: Partial<DocumentTypeCreationAttributes>) => {
  try {
    const documentType = await DocumentTypeModel.findByPk(id);
    
    if (!documentType) {
      return {
        success: false,
        message: 'Document type not found'
      };
    }
    
    await documentType.update(data);
    
    return {
      success: true,
      data: documentType,
      message: 'Document type updated successfully'
    };
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        success: false,
        message: 'Document type code already exists'
      };
    }
    throw error;
  }
};

// Delete document type
export const deleteDocumentType = async (id: number) => {
  try {
    const documentType = await DocumentTypeModel.findByPk(id);
    
    if (!documentType) {
      return {
        success: false,
        message: 'Document type not found'
      };
    }
    
    // Check if there are any user documents using this document type
    const userDocumentsCount = await UserDocumentModel.count({
      where: { document_type_id: id }
    });
    
    if (userDocumentsCount > 0) {
      return {
        success: false,
        message: 'Cannot delete document type. It is being used by user documents.'
      };
    }
    
    await documentType.destroy();
    
    return {
      success: true,
      message: 'Document type deleted successfully'
    };
  } catch (error: any) {
    throw error;
  }
};

// Get active document types (for dropdowns)
export const getActiveDocumentTypes = async () => {
  try {
    const documentTypes = await DocumentTypeModel.findAll({
      where: { is_active: true },
      attributes: ['id', 'type_code', 'type_name', 'description'],
      order: [['type_name', 'ASC']]
    });
    
    return {
      success: true,
      data: documentTypes
    };
  } catch (error: any) {
    throw error;
  }
};