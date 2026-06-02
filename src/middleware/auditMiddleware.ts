import { Context, Next } from 'koa';
import AuditService from '../services/auditService';

export interface AuditMiddlewareOptions {
  excludePaths?: string[];
  excludeMethods?: string[];
  includeResponseBody?: boolean;
  includeRequestBody?: boolean;
}

/**
 * Middleware สำหรับบันทึก audit trail ของทุก request
 */
export const auditMiddleware = (options: AuditMiddlewareOptions = {}) => {
  const {
    excludePaths = ['/health', '/ping'],
    excludeMethods = ['GET'],
    includeResponseBody = false,
    includeRequestBody = true,
  } = options;

  return async (ctx: Context, next: Next) => {
    const startTime = Date.now();
    
    // ข้าม paths ที่ไม่ต้องการ audit
    if (excludePaths.some(path => ctx.path.startsWith(path))) {
      return await next();
    }

    // ข้าม methods ที่ไม่ต้องการ audit
    if (excludeMethods.includes(ctx.method)) {
      return await next();
    }

    const requestData: any = {
      url: ctx.originalUrl,
      method: ctx.method,
      headers: ctx.headers,
      query: ctx.query,
      ip: ctx.ip,
      userAgent: ctx.get('User-Agent'),
    };

    if (includeRequestBody && ctx.request.body) {
      requestData.body = ctx.request.body;
    }

    let responseData: any = {};
    let error: any = null;

    try {
      await next();
      
      if (includeResponseBody) {
        responseData.body = ctx.body;
      }
      responseData.status = ctx.status;
      
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      
      // บันทึก audit log
      try {
        await AuditService.log({
          userId: (ctx.state?.user?.id) || undefined,
          action: `${ctx.method}_REQUEST`,
          tableName: 'http_requests',
          oldValues: requestData,
          newValues: {
            ...responseData,
            duration,
            error: error ? {
              message: error.message,
              stack: error.stack,
            } : null,
          },
        }, ctx);
      } catch (auditError) {
        console.error('Failed to log audit trail:', auditError);
      }
    }
  };
};

/**
 * Decorator สำหรับ audit ใน service level
 */
export function Auditable(tableName: string, action?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const auditAction = action || propertyKey.toUpperCase();
      let oldValues: any = null;
      let newValues: any = null;
      let recordId: any = null;
      let userId: any = null;

      try {
        // ถ้าเป็น update operation ให้หา old values ก่อน
        if (auditAction.includes('UPDATE') && args[0]) {
          // สำหรับ update by ID
          recordId = typeof args[0] === 'number' ? args[0] : args[0].id;
          // ต้องเพิ่ม logic หา old values ตาม model
        }

        // หา userId จาก args (ถ้ามี)
        const userIdArg = args.find(arg => 
          typeof arg === 'number' || 
          (typeof arg === 'object' && arg?.userId)
        );
        
        if (typeof userIdArg === 'number') {
          userId = userIdArg;
        } else if (userIdArg?.userId) {
          userId = userIdArg.userId;
        }

        // เรียก method ต้นฉบับ
        const result = await originalMethod.apply(this, args);

        // กำหนด new values และ record ID
        if (result) {
          if (auditAction.includes('CREATE')) {
            newValues = result;
            recordId = result.id;
          } else if (auditAction.includes('UPDATE')) {
            newValues = args[1]; // updated data
          }
        }

        // บันทึก audit log
        await AuditService.log({
          userId,
          action: auditAction,
          tableName,
          recordId,
          oldValues,
          newValues,
          changes: oldValues && newValues ? 
            AuditService.calculateChanges(oldValues, newValues) : undefined,
        });

        return result;
      } catch (error: any) {
        // บันทึก error ใน audit log
        await AuditService.log({
          userId,
          action: `${auditAction}_ERROR`,
          tableName,
          recordId,
          oldValues: { error: error?.message || 'Unknown error' },
        });
        
        throw error;
      }
    };

    return descriptor;
  };
}

export default auditMiddleware;
