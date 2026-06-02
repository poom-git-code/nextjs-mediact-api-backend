import ScheduleShiftSummaryModel from '../models/ScheduleShiftSummaryModel';
import { Op } from 'sequelize';

export const createScheduleShiftSummary = async (data: any) => {
  try {
    const summary = await ScheduleShiftSummaryModel.create(data);
    return summary;
  } catch (error) {
    throw error;
  }
};

export const updateScheduleShiftSummary = async (id: number, updates: Partial<ScheduleShiftSummaryModel>) => {
  try {
    const summary = await ScheduleShiftSummaryModel.findByPk(id);
    if (!summary) {
      throw new Error('Schedule Shift Summary not found');
    }
    
    await summary.update(updates);
    return summary;
  } catch (error) {
    throw error;
  }
};

export const deleteScheduleShiftSummary = async (id: number) => {
  try {
    const summary = await ScheduleShiftSummaryModel.findByPk(id);
    if (!summary) {
      throw new Error('Schedule Shift Summary not found');
    }
    
    await summary.destroy();
    return { message: 'Schedule Shift Summary deleted successfully' };
  } catch (error) {
    throw error;
  }
};

export const getScheduleShiftSummaryById = async (id: number, includeRelations: boolean = false) => {
  try {
    const options: any = {
      where: { id }
    };
    
    if (includeRelations) {
      options.include = [
        { association: 'ScheduleMaster' },
        { association: 'Department' },
        { association: 'ShiftType' },
        { association: 'Creator' },
        { association: 'Updater' }
      ];
    }
    
    const summary = await ScheduleShiftSummaryModel.findOne(options);
    if (!summary) {
      throw new Error('Schedule Shift Summary not found');
    }
    return summary;
  } catch (error) {
    throw error;
  }
};

export const getAllScheduleShiftSummaries = async (filters: any = {}) => {
  try {
    const whereClause: any = {};
    
    if (filters.schedule_master_id) {
      whereClause.schedule_master_id = filters.schedule_master_id;
    }
    
    if (filters.department_id) {
      whereClause.department_id = filters.department_id;
    }
    
    if (filters.shift_type_id) {
      whereClause.shift_type_id = filters.shift_type_id;
    }
    
    if (filters.is_active !== undefined) {
      whereClause.is_active = filters.is_active;
    }
    
    const options: any = {
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    };
    
    if (filters.include_relations) {
      options.include = [
        { association: 'ScheduleMaster' },
        { association: 'Department' },
        { association: 'ShiftType' },
        { association: 'Creator' },
        { association: 'Updater' }
      ];
    }
    
    const { count, rows } = await ScheduleShiftSummaryModel.findAndCountAll(options);
    
    return {
      summaries: rows,
      total: count,
      page: Math.floor((filters.offset || 0) / (filters.limit || 100)) + 1,
      totalPages: Math.ceil(count / (filters.limit || 100)),
    };
  } catch (error) {
    throw error;
  }
};

export const getScheduleShiftSummariesByScheduleMaster = async (scheduleId: number) => {
  try {
    const summaries = await ScheduleShiftSummaryModel.findAll({
      where: { schedule_master_id: scheduleId },
      order: [['shift_type_id', 'ASC']],
    });
    
    return summaries;
  } catch (error) {
    throw error;
  }
};

export const getScheduleShiftSummariesByDepartment = async (departmentId: number) => {
  try {
    const summaries = await ScheduleShiftSummaryModel.findAll({
      where: { department_id: departmentId },
      order: [['created_at', 'DESC']],
    });
    
    return summaries;
  } catch (error) {
    throw error;
  }
};

export const getScheduleShiftSummariesByShiftType = async (shiftTypeId: number) => {
  try {
    const summaries = await ScheduleShiftSummaryModel.findAll({
      where: { shift_type_id: shiftTypeId },
      order: [['created_at', 'DESC']],
    });
    
    return summaries;
  } catch (error) {
    throw error;
  }
};

export const getActiveScheduleShiftSummaries = async () => {
  try {
    const summaries = await ScheduleShiftSummaryModel.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']],
    });
    
    return summaries;
  } catch (error) {
    throw error;
  }
};

export const bulkUpdateScheduleShiftSummaries = async (summaryIds: number[], updates: any) => {
  try {
    const [affectedCount] = await ScheduleShiftSummaryModel.update(updates, {
      where: {
        id: {
          [Op.in]: summaryIds
        }
      }
    });
    
    if (affectedCount === 0) {
      throw new Error('No schedule shift summaries found to update');
    }
    
    return { message: `${affectedCount} schedule shift summaries updated successfully` };
  } catch (error) {
    throw error;
  }
};

export const softDeleteScheduleShiftSummary = async (id: number) => {
  try {
    const summary = await ScheduleShiftSummaryModel.findByPk(id);
    if (!summary) {
      throw new Error('Schedule Shift Summary not found');
    }
    
    await summary.update({ is_active: false });
    return { message: 'Schedule Shift Summary deactivated successfully' };
  } catch (error) {
    throw error;
  }
};

export const getScheduleShiftSummaryStats = async (filters: any = {}) => {
  try {
    const whereClause: any = {};
    
    if (filters.schedule_master_id) {
      whereClause.schedule_master_id = filters.schedule_master_id;
    }
    
    if (filters.department_id) {
      whereClause.department_id = filters.department_id;
    }
    
    if (filters.is_active !== undefined) {
      whereClause.is_active = filters.is_active;
    }
    
    const summaries = await ScheduleShiftSummaryModel.findAll({
      where: whereClause,
      attributes: ['total_shifts', 'total_hours', 'total_normal_hours', 'total_ot_hours', 'total_employees']
    });
    
    const stats = summaries.reduce((acc, summary) => {
      acc.totalShifts += summary.total_shifts || 0;
      acc.totalHours += parseFloat(summary.total_hours?.toString() || '0');
      acc.totalNormalHours += parseFloat(summary.total_normal_hours?.toString() || '0');
      acc.totalOtHours += parseFloat(summary.total_ot_hours?.toString() || '0');
      acc.totalEmployees += summary.total_employees || 0;
      return acc;
    }, {
      totalShifts: 0,
      totalHours: 0,
      totalNormalHours: 0,
      totalOtHours: 0,
      totalEmployees: 0,
      recordCount: summaries.length
    });
    
    return stats;
  } catch (error) {
    throw error;
  }
};

export const upsertScheduleShiftSummary = async (data: any) => {
  try {
    const [summary, created] = await ScheduleShiftSummaryModel.findOrCreate({
      where: {
        schedule_master_id: data.schedule_master_id,
        shift_type_id: data.shift_type_id
      },
      defaults: data
    });
    
    if (!created) {
      // Update existing record
      await summary.update(data);
    }
    
    return { summary, created };
  } catch (error) {
    throw error;
  }
};

export const getScheduleShiftSummaryCount = async (filters: any = {}) => {
  try {
    const whereClause: any = {};
    
    if (filters.schedule_master_id) {
      whereClause.schedule_master_id = filters.schedule_master_id;
    }
    
    if (filters.department_id) {
      whereClause.department_id = filters.department_id;
    }
    
    if (filters.is_active !== undefined) {
      whereClause.is_active = filters.is_active;
    }
    
    const count = await ScheduleShiftSummaryModel.count({
      where: whereClause
    });
    
    return count;
  } catch (error) {
    throw error;
  }
};
