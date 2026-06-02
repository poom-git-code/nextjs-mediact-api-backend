import { Context } from 'koa';
import AuditService from '../services/auditService';

export class AuditController {
  /**
   * ดึงรายการ audit logs
   */
  static async getAuditLogs(ctx: Context) {
    try {
      const {
        userId,
        action,
        tableName,
        recordId,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = ctx.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const filters: any = {
        limit: parseInt(limit as string),
        offset,
      };

      if (userId) filters.userId = parseInt(userId as string);
      if (action) filters.action = action as string;
      if (tableName) filters.tableName = tableName as string;
      if (recordId) filters.recordId = parseInt(recordId as string);
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await AuditService.getAuditLogs(filters);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(result.count / parseInt(limit as string)),
        },
      };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Failed to fetch audit logs',
        error: error.message,
      };
    }
  }

  /**
   * ดึง audit logs สำหรับ record เฉพาะ
   */
  static async getRecordAuditTrail(ctx: Context) {
    try {
      const { tableName, recordId } = ctx.params;
      const { page = 1, limit = 20 } = ctx.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const result = await AuditService.getAuditLogs({
        tableName,
        recordId: parseInt(recordId),
        limit: parseInt(limit as string),
        offset,
      });

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(result.count / parseInt(limit as string)),
        },
      };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Failed to fetch record audit trail',
        error: error.message,
      };
    }
  }

  /**
   * ดึง audit logs สำหรับ user เฉพาะ
   */
  static async getUserAuditTrail(ctx: Context) {
    try {
      const { userId } = ctx.params;
      const { page = 1, limit = 20 } = ctx.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const result = await AuditService.getAuditLogs({
        userId: parseInt(userId),
        limit: parseInt(limit as string),
        offset,
      });

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(result.count / parseInt(limit as string)),
        },
      };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Failed to fetch user audit trail',
        error: error.message,
      };
    }
  }

  /**
   * ดึงสถิติการใช้งาน
   */
  static async getAuditStats(ctx: Context) {
    try {
      const { startDate, endDate } = ctx.query;
      
      // คำนวณสถิติต่าง ๆ จาก audit logs
      // ตัวอย่างเช่น: จำนวน actions แต่ละประเภท, users ที่ active, etc.
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Audit statistics feature to be implemented',
      };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Failed to fetch audit statistics',
        error: error.message,
      };
    }
  }
}

export default AuditController;
