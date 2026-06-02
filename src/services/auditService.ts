import AuditLogModel, { AuditLogAttributes } from '../models/AuditLogModel';
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import { Context } from 'koa';

export interface AuditLogData {
  userId?: number | null;
  action: string;
  tableName: string;
  recordId?: number;
  oldValues?: object;
  newValues?: object;
  changes?: object;
}

export class AuditService {
  /**
   * ดึง user_id จาก Koa context
   */
  static getUserIdFromContext(ctx?: Context): number | null {
    if (!ctx) return null;
    
    // ลองดึงจาก JWT token ที่ decoded แล้ว
    if (ctx.state.user?.id) {
      return ctx.state.user.id;
    }
    
    // ลองดึงจาก user ใน state (อาจจะมี format ต่างกัน)
    if (ctx.state.user?.user_id) {
      return ctx.state.user.user_id;
    }
    
    return null;
  }

  /**
   * บันทึก audit log
   */
  static async log(data: AuditLogData, ctx?: Context): Promise<void> {
    try {
      // ถ้าไม่มี userId ใน data ให้ลองดึงจาก context
      const userId = data.userId || this.getUserIdFromContext(ctx);
      
      const auditData: AuditLogAttributes = {
        user_id: userId,
        action: data.action,
        table_name: data.tableName,
        record_id: data.recordId,
        old_values: data.oldValues,
        new_values: data.newValues,
        changes: data.changes,
        auto_audit: true, // mark เป็น auto audit
      };

      // เพิ่มข้อมูลจาก context ถ้ามี
      if (ctx) {
        auditData.ip_address = this.getClientIP(ctx);
        auditData.user_agent = ctx.get('User-Agent');
        auditData.request_url = ctx.originalUrl;
        auditData.request_method = ctx.method;
        auditData.status_code = ctx.status;
        auditData.session_id = ctx.get('session-id') || userId?.toString() || 'anonymous';
      }

      await AuditLogModel.create(auditData);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // ไม่ throw error เพื่อไม่ให้กระทบต่อ business logic หลัก
    }
  }

  /**
   * คำนวณการเปลี่ยนแปลงระหว่าง old และ new values
   */
  static calculateChanges(oldValues: any, newValues: any): object {
    const changes: any = {};
    
    // ตรวจสอบการเปลี่ยนแปลงในแต่ละ field
    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          from: oldValues[key],
          to: newValues[key]
        };
      }
    });

    return changes;
  }

  /**
   * ดึง IP address ของ client
   */
  private static getClientIP(ctx: Context): string {
    return (
      ctx.get('x-forwarded-for') ||
      ctx.get('x-real-ip') ||
      ctx.ip ||
      'unknown'
    );
  }

  /**
   * ดึง audit logs พร้อม filter
   */
  static async getAuditLogs(filters: {
    userId?: number;
    action?: string;
    tableName?: string;
    recordId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const whereClause: any = {};

    if (filters.userId) whereClause.user_id = filters.userId;
    if (filters.action) whereClause.action = filters.action;
    if (filters.tableName) whereClause.table_name = filters.tableName;
    if (filters.recordId) whereClause.record_id = filters.recordId;

    if (filters.startDate || filters.endDate) {
      whereClause.created_at = {};
      if (filters.startDate) whereClause.created_at.gte = filters.startDate;
      if (filters.endDate) whereClause.created_at.lte = filters.endDate;
    }

    return await AuditLogModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: require('../models/UserModel').default,
          as: 'user',
          attributes: getUserWithUsernameAttributes(),
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    }).then(result => {
      // Process PIPEDA decryption for audit logs
      const processedRows = result.rows.map((log: any) => {
        const logData = log.get({ plain: true });

        // Decrypt user data
        if (logData.user) {
          logData.user = decryptAndCleanUserData(logData.user);
        }

        return logData;
      });

      return {
        count: result.count,
        rows: processedRows
      };
    });
  }
}

// Helper functions สำหรับ actions ต่าง ๆ
export const AuditActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  VIEW: 'VIEW',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
} as const;

export default AuditService;
