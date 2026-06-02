import { Context } from 'koa';
import * as ProductivityService from '../services/productivityService';
import {
  createProductivityRecordSchema,
  updateProductivityRecordSchema,
  productivityDashboardSchema,
  productivityGraphSchema,
  healthRegionDashboardSchema,
  provinceDashboardSchema,
  facilityDailySummarySchema,
  facilityDashboardByCategorySchema
  //   getProductivityRecordsQuerySchema,
  //   departmentStatsQuerySchema
} from '../validations/productivityValidation';
import { getProductivityLogsQuerySchema } from '../validations/productivityLogValidation';

/// Create 
export const createRecord = async (ctx: Context) => {
  try {
    const { error, value } = createProductivityRecordSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const userId = ctx.state.user?.id;
    const result = await ProductivityService.createProductivityRecord(value, userId);

    if (!result.success) {
      ctx.status = result.error === 'DUPLICATE_RECORD' ? 409 : 400;
      ctx.body = result;
      return;
    }

    ctx.status = 201;
    ctx.body = result;
  } catch (error) {
    console.error('Error creating productivity record:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while creating the productivity record'
    };
  }
};

// Get productivity records with filtering
// export const getRecords = async (ctx: Context) => {
//   try {
//   //   const { error, value  = getProductivityRecordsQuerySchema.validate(ctx.query);

//   //   if (error) {
//   //     ctx.status = 400;
//   //     ctx.body = {
//   //       success: false,
//   //       error: 'VALIDATION_ERROR',
//   //       message: error.details[0].message,
//   //       details: error.details
//   //     };
//   //     return;
//   //   }

//     const value = (ctx.query as any) || {};

//     const result = await ProductivityService.getProductivityRecords(value);
//     ctx.status = 200;
//     ctx.body = result;
//   } catch (error) {
//     console.error('Error getting productivity records:', error);
//     ctx.status = 500;
//     ctx.body = {
//       success: false,
//       error: 'INTERNAL_ERROR',
//       message: 'An error occurred while retrieving productivity records'
//     };
//   }
// };


// Get by ID
export const getRecordById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'INVALID_ID',
        message: 'Invalid record ID'
      };
      return;
    }

    const result = await ProductivityService.getProductivityRecordById(id);

    if (!result.success) {
      ctx.status = 404;
      ctx.body = result;
      return;
    }

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting productivity record by ID:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving the productivity record'
    };
  }
};

/// Update 
export const updateRecord = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'INVALID_ID',
        message: 'Invalid record ID'
      };
      return;
    }

    const { error, value } = updateProductivityRecordSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const userId = ctx.state.user?.id;
    const result = await ProductivityService.updateProductivityRecord(id, value, userId);

    if (!result.success) {
      ctx.status = result.error === 'NOT_FOUND' ? 404 :
        result.error === 'DUPLICATE_RECORD' ? 409 : 400;
      ctx.body = result;
      return;
    }

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error updating productivity record:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while updating the productivity record'
    };
  }
};

/// Delete 
export const deleteRecord = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'INVALID_ID',
        message: 'Invalid record ID'
      };
      return;
    }

    const userId = ctx.state.user?.id;
    const result = await ProductivityService.deleteProductivityRecord(id, userId);

    if (!result.success) {
      ctx.status = 404;
      ctx.body = result;
      return;
    }

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error deleting productivity record:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while deleting the productivity record'
    };
  }
};

/// Get department productivity statistics
export const getDepartmentStats = async (ctx: Context) => {
  try {
    const department_id = parseInt(ctx.params.department_id);

    if (isNaN(department_id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'INVALID_DEPARTMENT_ID',
        message: 'Invalid department ID'
      };
      return;
    }

    //   const { error, value } = departmentStatsQuerySchema.validate(ctx.query);

    //   if (error) {
    //     ctx.status = 400;
    //     ctx.body = {
    //       success: false,
    //       error: 'VALIDATION_ERROR',
    //       message: error.details[0].message,
    //       details: error.details
    //     };
    //     return;
    //   }
    const value = (ctx.query as any) || {};

    const result = await ProductivityService.getDepartmentProductivityStats(department_id, value);
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting department productivity stats:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving department productivity statistics'
    };
  }
};

// Get audit logs for a record
export const getRecordAuditLogs = async (ctx: Context) => {
  try {
    const record_id = parseInt(ctx.params.record_id);

    if (isNaN(record_id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'INVALID_RECORD_ID',
        message: 'Invalid record ID'
      };
      return;
    }

    const { error, value } = getProductivityLogsQuerySchema.validate(ctx.query);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getRecordAuditLogs(record_id, value);
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting record audit logs:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving audit logs'
    };
  }
};

/// Get productivity dashboard with staff information
export const getSumProductivityDashboard = async (ctx: Context) => {
  try {
    const { error, value } = productivityDashboardSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getSumProductivityDashboard(value);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting productivity dashboard:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving productivity dashboard'
    };
  }
};

export const getFacilityDailySummaryController = async (ctx: Context) => {
  try {
    const { error, value } = facilityDailySummarySchema.validate(ctx.query);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getFacilityDailySummary(value);

    ctx.status = 200;
    ctx.body = result;

  } catch (error) {
    console.error('Error getting facility daily summary:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving the facility daily summary'
    };
  }
};

// ========== Graphs Head Nurse ========== //
/// Get productivity score graph data
export const getSumProductivityGraph = async (ctx: Context) => {
  try {
    const { error, value } = productivityGraphSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getSumProductivityGraph(value);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting productivity graph:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving productivity graph data'
    };
  }
};

/// Get patient count graph data
export const getSumPatientGraph = async (ctx: Context) => {
  try {
    const { error, value } = productivityGraphSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getSumPatientGraph(value);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting patient graph:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving patient graph data'
    };
  }
};

/// Get staff count graph data
export const getSumStaffGraph = async (ctx: Context) => {
  try {
    const { error, value } = productivityGraphSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getSumStaffGraph(value);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting staff graph:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving staff graph data'
    };
  }
};

/// Get used bed graph data
export const getSumUsedBedGraph = async (ctx: Context) => {
  try {
    const { error, value } = productivityGraphSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getSumUsedBedGraph(value);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting used bed graph:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving used bed graph data'
    };
  }
};

// ========== Graphs Regional Health Director&Permanent Secretary ========== //
/// Get health region dashboard data
export const getHealthRegionDashboard = async (ctx: Context) => {
  try {
    const { error, value } = healthRegionDashboardSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getHealthRegionDashboard(value);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting health region dashboard:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving health region dashboard data'
    };
  }
};

/// Get province dashboard data
export const getProvinceDashboard = async (ctx: Context) => {
  try {
    const { error, value } = provinceDashboardSchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getProvinceDashboard(value);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error getting province dashboard:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving province dashboard data'
    };
  }
};

// ========== For Category Master ========== //
// Get category dashboard data
export const getCategoryDashboard = async (ctx: Context) => {
  try {
    const { fiscal_year, category_id, health_region_id, start_date, end_date } = ctx.request.body;

    console.log('Request body:', ctx.request.body);

    const result = await ProductivityService.getCategoryDashboard({
      fiscal_year,
      category_id,
      health_region_id,
      start_date,
      end_date
    });

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error in getCategoryDashboard:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    ctx.status = 400;
    ctx.body = {
      success: false,
      message: errorMessage,
      error: errorMessage
    };
  }
};

// Get provinces by category dashboard data
export const getProvinceDashboardByCategory = async (ctx: Context) => {
  try {
    const { category_id, fiscal_year, health_region_id, start_date, end_date } = ctx.request.body;

    console.log('Request body:', ctx.request.body);

    const result = await ProductivityService.getProvinceDashboardByCategory({
      category_id,
      fiscal_year,
      health_region_id,
      start_date,
      end_date
    });

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error in getProvinceDashboardByCategory:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    ctx.status = 400;
    ctx.body = {
      success: false,
      message: errorMessage,
      error: errorMessage
    };
  }
};

// Get facility category breakdown
export const getFacilityCategoryDashboard = async (ctx: Context) => {
  try {
    const data = ctx.request.body || {};

    const facility_id = parseInt(data.facility_id);
    if (!data.facility_id || isNaN(facility_id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'facility_id is required and must be a number'
      };
      return;
    }

    // Build filters object like other services
    const filters: any = { facility_id };
    if (data.fiscal_year) filters.fiscal_year = data.fiscal_year;
    if (data.health_region_id) filters.health_region_id = data.health_region_id;
    if (data.category_id) filters.category_id = data.category_id;
    if (data.start_date) filters.start_date = data.start_date;
    if (data.end_date) filters.end_date = data.end_date;

    console.log('🔍 Debug - filters:', filters);

    const result = await ProductivityService.getFacilityCategoryBreakdown(filters);
    ctx.status = 200;
    ctx.body = { success: true, data: result };
  } catch (error) {
    console.error('Error getting facility category breakdown:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: 'INTERNAL_ERROR', message: (error as Error).message };
  }
};

// Get facilities dashboard by province and category
export const getFacilityDashboardGroupCategoryByProvince = async (ctx: Context) => {
  try {
    const { province_code, category_id, fiscal_year, health_region_id, start_date, end_date } = ctx.request.body;

    console.log('Request body:', ctx.request.body);

    const result = await ProductivityService.getFacilityDashboardGroupCategoryByProvince({
      province_code,
      category_id,
      fiscal_year,
      health_region_id,
      start_date,
      end_date
    });

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Error in getFacilityDashboardGroupCategoryByProvince:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    ctx.status = 400;
    ctx.body = {
      success: false,
      message: errorMessage,
      error: errorMessage
    };
  }
};

/**
 * Controller for Facility Director's Dashboard.
 * Gets daily productivity summary for a facility, grouped by department category.
 */
export const getFacilityDashboardByCategory = async (ctx: Context) => {
  try {
    const { error, value } = facilityDashboardByCategorySchema.validate(ctx.request.body);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      };
      return;
    }

    const result = await ProductivityService.getFacilityDashboardByCategory(value);

    ctx.status = 200;
    ctx.body = result;

  } catch (error) {
    console.error('Error getting facility dashboard by category:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while retrieving the facility dashboard'
    };
  }
};