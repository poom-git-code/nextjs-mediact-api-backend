import { Context, Next } from 'koa';
import AuditService from '../services/auditService';

interface AutoAuditConfigInterface {
  enabled: boolean;
  excludePaths: string[];
  excludeMethods: string[];
  enabledTables: string[];
  trackSelectQueries: boolean;
  maxLogSize: number;
}

const defaultConfig: AutoAuditConfigInterface = {
  enabled: true,
  excludePaths: ['/health', '/ping', '/metrics', '/favicon.ico'],
  excludeMethods: ['OPTIONS'],
  enabledTables: [], // เว้นว่างเพื่อให้เก็บทุกตาราง/module
  trackSelectQueries: false,
  maxLogSize: 10000,
};

// สร้าง simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function extractTableNameFromUrl(url: string): string | null {
  // ลองจับ pattern หลายแบบ
  let matches = url.match(/\/api\/([^\/\?]+)/);  // pattern: /api/tablename
  if (!matches) {
    matches = url.match(/^\/([^\/\?]+)/);        // pattern: /tablename (ไม่มี /api)
  }
  
  if (matches && matches[1]) {
    let tableName = matches[1];
    
    // Debug: แสดงการ extract table name
    console.log('🔍 Extracting table name from URL:', { url, extracted: tableName });
    
    // แปลงตาม pattern ต่างๆ ที่มีใน routes
    const tableMapping: { [key: string]: string } = {
      // Authentication & Users
      'auth': 'auth',
      'users': 'users',
      'user-roles': 'user_roles',
      'user-employment': 'user_employment',
      'user-certification': 'user_certifications',
      'user-devices': 'user_devices',
      'user-experience': 'user_experience',
      'user-duty': 'user_duty',
      'user-event-stamps': 'user_event_stamps',
      'user-profile-completeness': 'user_profile_completeness',
      'user-status': 'user_status',
      'user-group-tag': 'user_group_tags',
      
      // Departments & Facilities
      'departments': 'departments',
      'department-types': 'department_types', 
      'department-supervisors': 'department_supervisors',
      'department-operating-hours': 'department_operating_hours',
      'facilities': 'facilities',
      'facility-types': 'facility_types',
      'facility-admins': 'facility_admins',
      'facility-holidays': 'facility_holidays',
      
      // Schedules & Shifts
      'schedule-master': 'schedule_master',
      'schedule-shifts': 'schedule_shifts',
      'schedule-status': 'schedule_status',
      'schedule-template-shift': 'schedule_template_shifts',
      'schedule-shift-summary': 'schedule_shift_summary',
      'schedule-shift-logs': 'schedule_shift_logs',
      'shift-types': 'shift_types',
      'shift-status': 'shift_statuses',
      'shift-comments': 'shift_comments',
      
      // Jobs & Applications
      'jobs': 'jobs',
      'job-status': 'job_status',
      'job-apply': 'job_applications',
      'job-certification': 'job_certifications',
      
      // Leave & Requests
      'leave-types': 'leave_types',
      'leave-requests': 'leave_requests',
      'leave-limits': 'leave_limits',
      'swap-requests': 'swap_requests',
      'day-off': 'day_offs',
      
      // Credits & Rewards
      'credits': 'credits',
      'credit-logs': 'credit_logs',
      'credit-requests': 'credit_requests',
      'credit-approval-log': 'credit_approval_logs',
      'check-in': 'check_ins',
      'check-in-rewards': 'check_in_rewards',
      'checkin-reward-types': 'checkin_reward_types',
      'bonus-days': 'bonus_days',
      
      // Events & Notifications
      'events': 'events',
      'event-rewards': 'event_rewards',
      'booth-events': 'booth_events',
      'booth-event-list': 'booth_event_lists',
      'notification-booth-events': 'notification_booth_events',
      'notification-recipient-events': 'notification_recipient_events',
      'notifications': 'notifications',
      
      // Ads & Partners
      'ads': 'ads',
      'ad-clicks': 'ad_clicks',
      'ad-impressions': 'ad_impressions',
      'ad-media': 'ad_media',
      'ad-partners': 'ad_partners',
      'ad-targets': 'ad_targets',
      'ad-types': 'ad_types',
      'partner-types': 'partner_types',
      'partner-type': 'partner_types', // single form
      'partner-addresses': 'partner_addresses',
      'partner-address': 'partner_addresses', // alternative form
      'partner-status': 'partner_status',
      'partner-reference-files': 'partner_reference_files',
      
      // Education & Certifications
      'education': 'education',
      'education-degrees': 'education_degrees',
      'education-institutions': 'education_institutions',
      'certifications': 'certifications',
      'institutions': 'institutions',
      
      // Location & Address
      'provinces': 'provinces',
      'districts': 'districts',
      'subdistricts': 'subdistricts',
      'addresses': 'addresses',
      'address-types': 'address_types',
      'master-countries': 'master_countries',
      
      // Content & Media
      'news': 'news',
      'content-categories': 'content_categories',
      'uploads': 'uploads',
      'email': 'emails',
      'otp': 'otps',
      
      // Others
      'roles': 'roles',
      'genders': 'genders',
      'approvers': 'approvers',
      'duty-types': 'duty_types',
      'medical-staff': 'medical_staff',
      'lucky-colors': 'lucky_colors',
      'work-areas': 'work_areas'
    };
    
    const mappedTableName = tableMapping[tableName] || tableName.replace(/s$/, '').replace(/([A-Z])/g, '_$1').toLowerCase();
    
    console.log('📋 Table name mapping result:', { 
      original: tableName, 
      mapped: mappedTableName,
      fromMapping: !!tableMapping[tableName]
    });
    
    return mappedTableName;
  }
  return null;
}

function extractRecordIdFromUrl(url: string): number | null {
  const matches = url.match(/\/(\d+)(?:[\/\?]|$)/);
  return matches ? parseInt(matches[1]) : null;
}

function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };
  delete sanitized.authorization;
  delete sanitized.cookie;
  delete sanitized['x-api-key'];
  return sanitized;
}

function sanitizeRequestBody(body: any, maxSize: number): any {
  if (!body) return null;
  
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.confirm_password;
  delete sanitized.current_password;
  delete sanitized.token;
  delete sanitized.refresh_token;
  
  const bodyString = JSON.stringify(sanitized);
  if (bodyString.length > maxSize) {
    return { 
      _truncated: true, 
      _originalSize: bodyString.length,
      data: bodyString.substring(0, maxSize) + '...'
    };
  }
  
  return sanitized;
}

function sanitizeResponseBody(body: any, maxSize: number): any {
  if (!body) return null;
  
  const bodyString = JSON.stringify(body);
  if (bodyString.length > maxSize) {
    return { 
      _truncated: true, 
      _originalSize: bodyString.length,
      preview: bodyString.substring(0, 500) + '...'
    };
  }
  
  return body;
}

function getClientIP(ctx: Context): string {
  return (
    ctx.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    ctx.get('x-real-ip') ||
    ctx.get('x-client-ip') ||
    ctx.ip ||
    'unknown'
  );
}

/**
 * บันทึก audit log สำหรับ request
 */
async function logRequestAudit(
  ctx: Context,
  requestData: any, 
  responseData: any, 
  config: AutoAuditConfigInterface,
  error?: any
) {
  try {
    const actionMap: { [key: string]: string } = {
      'GET': 'READ',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'PATCH': 'UPDATE',
      'DELETE': 'DELETE',
    };

    const action = error ? 'ERROR' : actionMap[requestData.method] || 'UNKNOWN';
    const tableName = extractTableNameFromUrl(requestData.url);
    
    // Debug logging
    console.log('📝 Auto Audit - Processing request:', {
      method: requestData.method,
      url: requestData.url,
      action: action,
      tableName: tableName,
      userId: requestData.userId,
      trackSelectQueries: config.trackSelectQueries
    });
    
    // ลบการกรอง enabledTables - ให้เก็บทุก module
    // if (tableName && !config.enabledTables.includes(tableName)) {
    //   return;
    // }

    if (action === 'READ' && !config.trackSelectQueries) {
      console.log('⏭️ Auto Audit - Skipping READ request (trackSelectQueries=false)');
      return;
    }

    const recordId = extractRecordIdFromUrl(requestData.url);

    console.log('💾 Auto Audit - Saving log:', {
      userId: requestData.userId,
      action: `API_${action}`,
      tableName: tableName || 'api_request',
      recordId: recordId || undefined
    });

    await AuditService.log({
      userId: requestData.userId,
      action: `API_${action}`,
      tableName: tableName || 'api_request',
      recordId: recordId || undefined,
      oldValues: { request: requestData },
      newValues: { response: responseData },
      changes: error ? { error: error.message } : undefined,
    }, ctx); // ส่ง context ไปด้วย

    console.log('✅ Auto Audit - Log saved successfully');

  } catch (auditError) {
    console.error('❌ Failed to create auto audit log:', auditError);
  }
}

/**
 * Auto Audit Middleware - บันทึก audit log อัตโนมัติสำหรับทุก request
 */
export const autoAuditMiddleware = (config: Partial<AutoAuditConfigInterface> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return async (ctx: Context, next: Next) => {
    // ข้าม middleware หากปิดการใช้งาน
    if (!finalConfig.enabled) {
      return await next();
    }

    // ข้าม paths ที่ระบุ
    if (finalConfig.excludePaths.some(path => ctx.path.startsWith(path))) {
      return await next();
    }

    // ข้าม methods ที่ระบุ
    if (finalConfig.excludeMethods.includes(ctx.method)) {
      return await next();
    }

    // สร้าง transaction ID สำหรับ track การทำงาน
    const transactionId = generateUUID();
    
    // ดึง user_id จาก JWT token ที่ decode แล้วใน ctx.state.user
    let userId: number | null = null;
    let sessionId = 'anonymous';
    
    if (ctx.state.user) {
      // ถ้ามี user จาก token
      userId = ctx.state.user.id || ctx.state.user.user_id || ctx.state.user.userId || null;
      sessionId = ctx.state.user.id?.toString() || ctx.get('session-id') || 'anonymous';
      
      // Debug: แสดงข้อมูล user ที่ได้จาก token
      console.log('🔍 Auto Audit - User from token:', {
        userId: userId,
        userEmail: ctx.state.user.email,
        sessionId: sessionId
      });
    } else {
      // ถ้าไม่มี user แต่มี session-id header
      sessionId = ctx.get('session-id') || 'anonymous';
      console.log('⚠️ Auto Audit - No user in token, using session:', sessionId);
    }
    
    // เก็บข้อมูลเริ่มต้น
    const startTime = Date.now();
    const requestData = {
      method: ctx.method,
      url: ctx.originalUrl,
      headers: sanitizeHeaders(ctx.headers),
      query: ctx.query,
      body: sanitizeRequestBody(ctx.request.body, finalConfig.maxLogSize),
      ip: getClientIP(ctx),
      userAgent: ctx.get('User-Agent'),
      userId: userId,
      transactionId,
      sessionId,
    };

    let responseData: any = {};
    let error: any = null;

    try {
      await next();
      
      responseData = {
        status: ctx.status,
        headers: sanitizeHeaders(ctx.response.headers),
        body: sanitizeResponseBody(ctx.body, finalConfig.maxLogSize),
        duration: Date.now() - startTime,
      };

      await logRequestAudit(ctx, requestData, responseData, finalConfig);

    } catch (err: any) {
      error = err;
      responseData = {
        status: ctx.status || 500,
        error: {
          message: err.message,
          stack: err.stack?.substring(0, 1000),
        },
        duration: Date.now() - startTime,
      };

      await logRequestAudit(ctx, requestData, responseData, finalConfig, error);
      throw err;
    }
  };
};

/**
 * Auto Audit Configuration Manager
 */
export class AutoAuditConfigManager {
  private static config: AutoAuditConfigInterface = defaultConfig;

  static setConfig(newConfig: Partial<AutoAuditConfigInterface>) {
    this.config = { ...this.config, ...newConfig };
  }

  static getConfig(): AutoAuditConfigInterface {
    return this.config;
  }

  static enableTable(tableName: string) {
    if (!this.config.enabledTables.includes(tableName)) {
      this.config.enabledTables.push(tableName);
    }
  }

  static disableTable(tableName: string) {
    this.config.enabledTables = this.config.enabledTables.filter(
      (table: string) => table !== tableName
    );
  }

  static enableAutoAudit() {
    this.config.enabled = true;
  }

  static disableAutoAudit() {
    this.config.enabled = false;
  }
}

export default autoAuditMiddleware;
