// ตัวอย่างการใช้งาน Audit ใน departmentService.ts

import AuditService, { AuditActions } from '../services/auditService';
import DepartmentModel from '../models/DepartmentModel';

// วิธีที่ 1: Simple Functions (แนะนำใช้แทน Decorator)
export class AuditedDepartmentService {
  
  static async createDepartment(data: any, createdByUserId: number) {
    try {
      // business logic ที่มีอยู่
      const departmentData = {
        ...data,
        created_by: createdByUserId,
        updated_by: createdByUserId,
      };
      const newDepartment = await DepartmentModel.create(departmentData);

      // บันทึก audit log
      await AuditService.log({
        userId: createdByUserId,
        action: AuditActions.CREATE,
        tableName: 'departments',
        recordId: newDepartment.id,
        newValues: newDepartment.toJSON(),
      });

      return newDepartment;
    } catch (error: any) {
      await AuditService.log({
        userId: createdByUserId,
        action: 'CREATE_DEPARTMENT_ERROR',
        tableName: 'departments',
        oldValues: { error: error?.message || 'Unknown error', data },
      });
      throw error;
    }
  }

  static async updateDepartment(id: number, updates: any, updatedBy: number) {
    try {
      // business logic ที่มีอยู่
      const department = await DepartmentModel.findByPk(id);
      if (!department) {
        throw new Error('Department not found');
      }

      const oldValues = department.toJSON();
      const updatedDepartment = await department.update({
        ...updates,
        updated_by: updatedBy,
      });
      const newValues = updatedDepartment.toJSON();

      // บันทึก audit log
      await AuditService.log({
        userId: updatedBy,
        action: AuditActions.UPDATE,
        tableName: 'departments',
        recordId: id,
        oldValues,
        newValues,
        changes: AuditService.calculateChanges(oldValues, newValues),
      });

      return updatedDepartment;
    } catch (error: any) {
      await AuditService.log({
        userId: updatedBy,
        action: 'UPDATE_DEPARTMENT_ERROR',
        tableName: 'departments',
        recordId: id,
        oldValues: { error: error?.message || 'Unknown error', updates },
      });
      throw error;
    }
  }

  static async deleteDepartment(id: number, deletedBy: number) {
    try {
      // business logic ที่มีอยู่
      const department = await DepartmentModel.findByPk(id);
      if (!department) {
        throw new Error('Department not found');
      }

      const oldValues = department.toJSON();
      await department.destroy();

      // บันทึก audit log
      await AuditService.log({
        userId: deletedBy,
        action: AuditActions.DELETE,
        tableName: 'departments',
        recordId: id,
        oldValues,
      });

      return { id, deleted: true };
    } catch (error: any) {
      await AuditService.log({
        userId: deletedBy,
        action: 'DELETE_DEPARTMENT_ERROR',
        tableName: 'departments',
        recordId: id,
        oldValues: { error: error?.message || 'Unknown error' },
      });
      throw error;
    }
  }
}

// วิธีที่ 2: Manual audit logging
export const createDepartmentWithAudit = async (data: any, createdByUserId: number) => {
  try {
    // สร้าง department
    const newDepartment = await DepartmentModel.create({
      ...data,
      created_by: createdByUserId,
      updated_by: createdByUserId,
    });

    // บันทึก audit log
    await AuditService.log({
      userId: createdByUserId,
      action: AuditActions.CREATE,
      tableName: 'departments',
      recordId: newDepartment.id,
      newValues: newDepartment.toJSON(),
    });

    return newDepartment;
  } catch (error: any) {
    // บันทึก error ใน audit log
    await AuditService.log({
      userId: createdByUserId,
      action: `${AuditActions.CREATE}_ERROR`,
      tableName: 'departments',
      oldValues: { error: error?.message || 'Unknown error', data },
    });
    
    throw error;
  }
};

export const updateDepartmentWithAudit = async (
  id: number, 
  updates: any, 
  updatedBy: number
) => {
  try {
    // หา old values ก่อน update
    const oldDepartment = await DepartmentModel.findByPk(id);
    if (!oldDepartment) {
      throw new Error('Department not found');
    }

    const oldValues = oldDepartment.toJSON();

    // update department
    const updatedDepartment = await oldDepartment.update({
      ...updates,
      updated_by: updatedBy,
    });

    const newValues = updatedDepartment.toJSON();

    // คำนวณการเปลี่ยนแปลง
    const changes = AuditService.calculateChanges(oldValues, newValues);

    // บันทึก audit log
    await AuditService.log({
      userId: updatedBy,
      action: AuditActions.UPDATE,
      tableName: 'departments',
      recordId: id,
      oldValues,
      newValues,
      changes,
    });

    return updatedDepartment;
  } catch (error: any) {
    // บันทึก error ใน audit log
    await AuditService.log({
      userId: updatedBy,
      action: `${AuditActions.UPDATE}_ERROR`,
      tableName: 'departments',
      recordId: id,
      oldValues: { error: error?.message || 'Unknown error', updates },
    });
    
    throw error;
  }
};

// สำหรับ sensitive operations อื่น ๆ
export const viewDepartmentWithAudit = async (id: number, userId: number) => {
  const department = await DepartmentModel.findByPk(id);
  
  // บันทึกการดูข้อมูล (ถ้าต้องการ)
  await AuditService.log({
    userId,
    action: AuditActions.VIEW,
    tableName: 'departments',
    recordId: id,
  });

  return department;
};

export default {
  createDepartmentWithAudit,
  updateDepartmentWithAudit,
  viewDepartmentWithAudit,
};
