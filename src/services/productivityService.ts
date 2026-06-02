import ProductivityRecordModel from '../models/ProductivityModels';
import ProductivityLogModel from '../models/ProductivityLogModel';
import ScheduleShiftModel from '../models/ScheduleShiftsModel';
import UserModel from '../models/UserModel';
import UserRoleModel from '../models/UserRolesModel';
import RoleModel from '../models/RolesModel';
import ShiftTypeModel from '../models/ShiftTypesModel';
import { col, fn, Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { decryptAndCleanUserData, getUserAttributes } from "../utils/encryptedFieldMapping";
import DepartmentModel from '../models/DepartmentModel';
import FacilityModel from '../models/FacilitiesModel';
import dayjs from 'dayjs';
import DepartMentCategoryModel from '../models/DepartMentCategoryModel';
import CategoryMasterModel from '../models/CategoryMasterModel';

/// Create new productivity record
export const createProductivityRecord = async (data: any, userId?: number) => {

  // check if record for the same department_id, shift_date, and shift_type_id already exists
  const existingRecord = await ProductivityRecordModel.findOne({
    where: {
      department_id: data.department_id,
      shift_date: data.shift_date,
      shift_type_id: data.shift_type_id
    }
  });

  if (existingRecord) {
    return {
      success: false,
      error: 'DUPLICATE_RECORD',
      message: 'A productivity record already exists for this department, date, and shift type'
    };
  }

  try {

    const recordData = {
      ...data,
      created_by: userId,
      updated_by: userId
    };

    const record = await ProductivityRecordModel.create(recordData, {
      transaction: undefined,
      userId: userId
    } as any);
    return {
      success: true,
      data: record,
      message: 'Productivity record created successfully'
    };
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        success: false,
        error: 'DUPLICATE_RECORD',
        message: 'A productivity record already exists for this department, date, and shift type'
      };
    }
    throw error;
  }
};

// Get productivity records with filtering
export const getProductivityRecords = async (filters: {
  department_id?: number;
  shift_date?: string;
  shift_type_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}) => {
  const {
    department_id,
    shift_date,
    shift_type_id,
    date_from,
    date_to,
    page = 1,
    limit = 20
  } = filters;

  const whereClause: any = {};

  if (department_id) {
    whereClause.department_id = department_id;
  }

  if (shift_date) {
    whereClause.shift_date = shift_date;
  }

  if (shift_type_id) {
    whereClause.shift_type_id = shift_type_id;
  }

  if (date_from && date_to) {
    whereClause.shift_date = {
      [Op.between]: [date_from, date_to]
    };
  } else if (date_from) {
    whereClause.shift_date = {
      [Op.gte]: date_from
    };
  } else if (date_to) {
    whereClause.shift_date = {
      [Op.lte]: date_to
    };
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await ProductivityRecordModel.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['shift_date', 'DESC'], ['shift_type_id', 'ASC']],
    include: [
      {
        association: 'department',
        attributes: ['id', 'name']
      },
      {
        association: 'shiftType',
        attributes: ['id', 'name']
      }
    ]
  });

  return {
    success: true,
    data: {
      records: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    }
  };
};

// Get productivity record by ID
export const getProductivityRecordById = async (id: number) => {
  const record = await ProductivityRecordModel.findByPk(id, {
    include: [
      {
        association: 'department',
        attributes: ['id', 'name']
      },
      {
        association: 'shiftType',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!record) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Productivity record not found'
    };
  }

  return {
    success: true,
    data: record
  };
};

/// Update productivity record
export const updateProductivityRecord = async (id: number, data: any, userId?: number) => {
  try {
    const record = await ProductivityRecordModel.findByPk(id);

    if (!record) {
      return {
        success: false,
        error: 'NOT_FOUND',
        message: 'Productivity record not found'
      };
    }

    // Add updated_by field and updated_at will be automatically set by Sequelize
    const updateData = {
      ...data,
      updated_by: userId
    };

    await record.update(updateData, { userId: userId } as any);

    return {
      success: true,
      data: record,
      message: 'Productivity record updated successfully'
    };
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        success: false,
        error: 'DUPLICATE_RECORD',
        message: 'A productivity record already exists for this department, date, and shift type'
      };
    }
    throw error;
  }
};

/// Delete productivity record
export const deleteProductivityRecord = async (id: number, userId?: number) => {
  const record = await ProductivityRecordModel.findByPk(id);

  if (!record) {
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'Productivity record not found'
    };
  }

  await record.destroy({ userId: userId } as any);

  return {
    success: true,
    message: 'Productivity record deleted successfully'
  };
};

// Get productivity statistics for a department
export const getDepartmentProductivityStats = async (department_id: number, filters: {
  date_from?: string;
  date_to?: string;
  shift_type_id?: number;
}) => {
  const whereClause: any = { department_id };

  if (filters.shift_type_id) {
    whereClause.shift_type_id = filters.shift_type_id;
  }

  if (filters.date_from && filters.date_to) {
    whereClause.shift_date = {
      [Op.between]: [filters.date_from, filters.date_to]
    };
  }

  const records = await ProductivityRecordModel.findAll({
    where: whereClause,
    order: [['shift_date', 'DESC']]
  });

  if (records.length === 0) {
    return {
      success: true,
      data: {
        total_records: 0,
        average_productivity_score: 0,
        average_bed_utilization: 0,
        total_patients_handled: 0,
        total_admissions: 0,
        total_discharges: 0
      }
    };
  }

  const stats = records.reduce((acc, record) => {
    acc.total_patients_handled += record.total_patients_calculated || 0;
    acc.total_admissions += record.admitted_patients;
    acc.total_discharges += record.discharged_patients;
    acc.productivity_score_sum += record.productivity_score || 0;
    acc.bed_utilization_sum += ((record.total_patients_calculated || 0) / record.total_beds) * 100;
    return acc;
  }, {
    total_patients_handled: 0,
    total_admissions: 0,
    total_discharges: 0,
    productivity_score_sum: 0,
    bed_utilization_sum: 0
  });

  const average_productivity_score = Math.round((stats.productivity_score_sum / records.length) * 100) / 100;
  const average_bed_utilization = Math.round((stats.bed_utilization_sum / records.length) * 100) / 100;

  return {
    success: true,
    data: {
      total_records: records.length,
      average_productivity_score,
      average_bed_utilization,
      total_patients_handled: stats.total_patients_handled,
      total_admissions: stats.total_admissions,
      total_discharges: stats.total_discharges
    }
  };
};

// Get audit logs for a record
export const getRecordAuditLogs = async (record_id: number, filters: {
  action_type?: 'CREATE' | 'UPDATE' | 'DELETE';
  page?: number;
  limit?: number;
}) => {
  const { action_type, page = 1, limit = 20 } = filters;
  const whereClause: any = { record_id };

  if (action_type) {
    whereClause.action_type = action_type;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await ProductivityLogModel.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['action_at', 'DESC']],
    include: [
      {
        association: 'actionByUser',
        attributes: ['id', 'username', 'first_name', 'last_name']
      }
    ]
  });

  return {
    success: true,
    data: {
      logs: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    }
  };
};

/// Get productivity dashboard with staff information
export const getSumProductivityDashboard = async (filters: {
  department_id: number;
  shift_date: string;
  shift_type_id?: number;
}) => {
  const { department_id, shift_date, shift_type_id } = filters;

  try {
    const whereClause: any = {
      department_id,
      shift_date,
    };

    let finalRecord: any;

    const staffWhereClause: any = {
      department_id,
      shift_date,
      is_active: true,
    }

    if (shift_type_id) {
      whereClause.shift_type_id = shift_type_id;
      staffWhereClause.shift_type_id = shift_type_id;

      finalRecord = await ProductivityRecordModel.findOne({
        where: whereClause,
        include: [
          { association: 'department', attributes: ['id', 'name'] },
          { association: 'shiftType', attributes: ['id', 'name'] }
        ]
      });
      if (finalRecord) finalRecord = finalRecord.toJSON();

    } else {
      const dailyRecords = await ProductivityRecordModel.findAll({
        where: whereClause,
        include: [{ association: 'department', attributes: ['id', 'name'] }]
      });

      if (dailyRecords.length > 0) {
        const summary = dailyRecords.reduce((acc, rec) => {
          const productivityScore = parseFloat(rec.productivity_score as any || '0');

          acc.admitted_patients += rec.admitted_patients ?? 0;
          acc.discharged_patients += rec.discharged_patients ?? 0;

          if (!isNaN(productivityScore) && productivityScore > 0) {
            acc.productivity_scores.push(productivityScore);
          }

          const latestDate = acc.latest_record?.updated_at;
          const currentDate = rec.updated_at;
          if (!latestDate || (currentDate && new Date(currentDate) > new Date(latestDate))) {
            acc.latest_record = rec;
          }

          return acc;
        }, {
          admitted_patients: 0,
          discharged_patients: 0,
          productivity_scores: [] as number[],
          latest_record: null as ProductivityRecordModel | null
        });

        const latestRecordData = summary.latest_record!;

        const avg_productivity = summary.productivity_scores.length > 0
          ? summary.productivity_scores.reduce((sum, score) => sum + score, 0) / summary.productivity_scores.length
          : 0;

        finalRecord = {
          critical_patients: latestRecordData.critical_patients,
          severe_patients: latestRecordData.severe_patients,
          semi_critical_patients: latestRecordData.semi_critical_patients,
          moderate_patients: latestRecordData.moderate_patients,
          convalescing_patients: latestRecordData.convalescing_patients,
          total_beds: latestRecordData.total_beds,
          total_patients_calculated: latestRecordData.total_patients_calculated,

          admitted_patients: summary.admitted_patients,
          discharged_patients: summary.discharged_patients,

          productivity_score: avg_productivity.toFixed(1),
          free_beds_calculated: (latestRecordData?.total_beds ?? 0) - (latestRecordData?.total_patients_calculated ?? 0),

          department: latestRecordData.department,
          shiftType: null,
          id: latestRecordData.id,
          created_at: dailyRecords[0].created_at,
          updated_at: latestRecordData.updated_at,
        };

        const recordedShiftIds = dailyRecords.map(rec => rec.shift_type_id);
        staffWhereClause.shift_type_id = { [Op.in]: recordedShiftIds };

      } else {
        staffWhereClause.shift_type_id = { [Op.in]: [] };
      }
    }

    // Get staff working in the same department, date, and shift type
    const staffSchedules = await ScheduleShiftModel.findAll({
      where: staffWhereClause,
      include: [
        {
          model: UserModel,
          as: 'employee',
          attributes: getUserAttributes(),
          include: [
            {
              model: UserRoleModel,
              as: 'user_role',
              attributes: ['role_id'],
              include: [
                {
                  model: RoleModel,
                  as: 'role',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ]
    });

    // Some employees may have multiple schedule_shifts rows for the same department/date/shift
    const staffMap = new Map<number, any>();
    const rolePriority: { [key: number]: number } = { 5: 1, 31: 2, 30: 3 }; // RN > PN > NA

    for (const schedule of staffSchedules) {
      const user = (schedule as any).employee;

      if (!user) continue;

      let userRoles: any[] = [];
      if (user.user_role) {
        userRoles = Array.isArray(user.user_role) ? user.user_role : [user.user_role];
      }

      // Filter only nursing roles (RN, PN, NA)
      const nursingRoles = userRoles.filter((userRole: any) => userRole && userRole.role && [5, 30, 31].includes(userRole.role.id));

      // select highest priority nursing role for this user if present
      let selectedRole: any = null;
      let roleId: number | null = null;
      let roleType = null as string | null;

      if (nursingRoles.length > 0) {
        nursingRoles.sort((a: any, b: any) => (rolePriority[a.role.id] || 99) - (rolePriority[b.role.id] || 99));
        selectedRole = nursingRoles[0];

        roleId = selectedRole.role.id;
        switch (roleId) {
          case 5:
            roleType = 'RN';
            break;
          case 31:
            roleType = 'PN';
            break;
          case 30:
            roleType = 'NA';
            break;
          default:
            roleType = 'Other';
        }
      }

      // Decrypt user data
      const decryptedUser = decryptAndCleanUserData(user.toJSON ? user.toJSON() : user);
      const userId = decryptedUser.id;

      const staffEntry = {
        user_id: userId,
        firstname: decryptedUser.first_name,
        lastname: decryptedUser.last_name,
        user_role: selectedRole ? {
          role_id: roleId,
          name: selectedRole.role && selectedRole.role.name ? selectedRole.role.name : null,
          type: roleType
        } : null
      };

      if (!staffMap.has(userId)) {
        staffMap.set(userId, staffEntry);
      } else {
        // If same user appears multiple times, keep the entry with higher priority role
        const existing = staffMap.get(userId);
        const existingRoleId = existing.user_role ? existing.user_role.role_id : null;
        const existingPriority = existingRoleId ? (rolePriority[existingRoleId] || 99) : 999;
        const newPriority = roleId ? (rolePriority[roleId] || 99) : 999;
        // Prefer the entry that has a nursing role and higher priority
        if (newPriority < existingPriority) {
          staffMap.set(userId, staffEntry);
        }
      }
    }

    const staff = Array.from(staffMap.values());

    // Count staff by role type
    const staffCounts = staff.reduce((counts, staffMember) => {
      const roleType = staffMember.user_role?.type;

      counts.all_staff++;

      if (roleType === 'RN') {
        counts.staff_RN++;
      } else if (roleType === 'PN') {
        counts.staff_PN++;
      } else if (roleType === 'NA') {
        counts.staff_NA++;
      }

      return counts;
    }, {
      all_staff: 0,
      staff_RN: 0,
      staff_PN: 0,
      staff_NA: 0
    });

    // Return data
    return {
      success: true,
      data: {
        productivity_records: finalRecord ? {
          ...finalRecord,
          staff,
          staff_summary: staffCounts
        } : {
          message: 'No productivity record found for the specified criteria',
          staff,
          staff_summary: staffCounts
        }
      }
    };

  } catch (error) {
    console.error('Error getting productivity dashboard:', error);
    throw error;
  }
};

export const getFacilityDailySummary = async (filters: {
  facility_id: number;
  shift_date: string;
}) => {
  const { facility_id, shift_date } = filters;

  try {
    const facility = await FacilityModel.findByPk(facility_id, {
      attributes: ['id', 'name']
    });

    if (!facility) {
      return {
        success: false,
        error: 'FACILITY_NOT_FOUND',
        message: `Facility with id ${facility_id} not found.`
      };
    }

    const departments = await DepartmentModel.findAll({
      where: { facility_id },
      attributes: ['id']
    });
    const departmentIds = departments.map(d => d.id);

    if (departmentIds.length === 0) {
      return {
        success: true,
        data: {
          facility_info: {
            id: facility.id,
            name: facility.name
          },
          productivity_records: {
            id: null,
            department_id: null,
            shift_date: shift_date,
            shift_type_id: null,
            total_beds: 0,
            critical_patients: 0,
            severe_patients: 0,
            semi_critical_patients: 0,
            moderate_patients: 0,
            convalescing_patients: 0,
            admitted_patients: 0,
            discharged_patients: 0,
            total_patients_calculated: 0,
            free_beds_calculated: 0,
            bed_occupancy_rate: "0.00",
            productivity_score: "0.00",
            staff: [],
            staff_summary: {
              all_staff: 0,
              staff_RN: 0,
              staff_PN: 0,
              staff_NA: 0,
            },
          },
        },
      };
    }

    const records = await ProductivityRecordModel.findAll({
      where: {
        department_id: { [Op.in]: departmentIds },
        shift_date: shift_date,
      }
    });

    const staffSchedules = await ScheduleShiftModel.findAll({
      where: {
        department_id: { [Op.in]: departmentIds },
        shift_date: shift_date,
        is_active: true
      },
      include: [
        {
          model: UserModel,
          as: 'employee',
          attributes: getUserAttributes(),
          include: [
            {
              model: UserRoleModel,
              as: 'user_role',
              attributes: ['role_id'],
              include: [
                {
                  model: RoleModel,
                  as: 'role',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ]
    });

    const recordsByDept = records.reduce((acc, record) => {
      const deptId = record.department_id;
      const existingRecord = acc[deptId];

      if (!existingRecord) {
        acc[deptId] = record;
        return acc;
      }

      if (!existingRecord.updated_at && record.updated_at) {
        acc[deptId] = record;
        return acc;
      }

      if (record.updated_at && existingRecord.updated_at) {
        if (new Date(record.updated_at) > new Date(existingRecord.updated_at)) {
          acc[deptId] = record;
        }
      }

      return acc;
    }, {} as Record<number, ProductivityRecordModel>);

    const total_beds_sum = Object.values(recordsByDept).reduce((sum, rec) => sum + rec.total_beds, 0);

    const summary = records.reduce((acc, record) => {
      const productivityScore = parseFloat(record.productivity_score as any || '0');
      const totalPatients = record.total_patients_calculated || 0;

      acc.critical_patients += record.critical_patients || 0;
      acc.severe_patients += record.severe_patients || 0;
      acc.semi_critical_patients += record.semi_critical_patients || 0;
      acc.moderate_patients += record.moderate_patients || 0;
      acc.convalescing_patients += record.convalescing_patients || 0;
      acc.admitted_patients += record.admitted_patients || 0;
      acc.discharged_patients += record.discharged_patients || 0;

      acc.sum_of_weighted_scores += productivityScore * totalPatients;
      acc.total_patients_sum += totalPatients;

      return acc;
    }, {
      critical_patients: 0, severe_patients: 0, semi_critical_patients: 0,
      moderate_patients: 0, convalescing_patients: 0, admitted_patients: 0,
      discharged_patients: 0, sum_of_weighted_scores: 0, total_patients_sum: 0,
    });

    const staffSummary = staffSchedules.reduce((acc, schedule) => {
      const user = (schedule as any).employee;
      if (!user || !user.user_role) {
        return acc;
      }

      const userRoles = Array.isArray(user.user_role) ? user.user_role : [];
      const nursingRoles = userRoles.filter((userRole: any) =>
        userRole.role && [5, 30, 31].includes(userRole.role.id)
      );

      if (nursingRoles.length > 0) {
        nursingRoles.sort((a: any, b: any) => {
          const priorityOrder: { [key: number]: number } = { 5: 1, 31: 2, 30: 3 };
          return priorityOrder[a.role.id] - priorityOrder[b.role.id];
        });

        const primaryRole = nursingRoles[0].role;
        acc.all_staff++;

        if (primaryRole.id === 5) {
          acc.staff_RN++;
        } else if (primaryRole.id === 31) {
          acc.staff_PN++;
        } else if (primaryRole.id === 30) {
          acc.staff_NA++;
        }
      }

      return acc;
    }, {
      all_staff: 0,
      staff_RN: 0,
      staff_PN: 0,
      staff_NA: 0,
    });

    const weighted_avg_productivity = summary.total_patients_sum > 0
      ? summary.sum_of_weighted_scores / summary.total_patients_sum
      : 0;

    const free_beds_calculated = total_beds_sum - summary.total_patients_sum;
    const bed_occupancy_rate = total_beds_sum > 0
      ? (summary.total_patients_sum / total_beds_sum) * 100
      : 0;

    const aggregatedData = {
      facility_info: { id: facility.id, name: facility.name },
      productivity_records: {
        shift_date: shift_date,
        total_beds: total_beds_sum,
        total_patients_calculated: summary.total_patients_sum,
        free_beds_calculated: Math.round(free_beds_calculated),
        admitted_patients: summary.admitted_patients,
        discharged_patients: summary.discharged_patients,
        critical_patients: summary.critical_patients,
        severe_patients: summary.severe_patients,
        semi_critical_patients: summary.semi_critical_patients,
        moderate_patients: summary.moderate_patients,
        convalescing_patients: summary.convalescing_patients,
        bed_occupancy_rate: bed_occupancy_rate.toFixed(2),
        productivity_score: weighted_avg_productivity.toFixed(2),
        staff: [],
        staff_summary: staffSummary,
      },
    };

    return { success: true, data: aggregatedData };

  } catch (error) {
    console.error('Error getting facility daily summary: ', error);
    throw error;
  }
}

// ========== Graphs Head Nurse ========== //
/// Get productivity score graph data
export const getSumProductivityGraph = async (filters: {
  department_id?: number;
  facility_id?: number;
  start_date: string;
  end_date: string;
}) => {
  const { department_id, facility_id, start_date, end_date } = filters;

  if (!department_id && !facility_id) {
    throw new Error('Either department_id or facility_id must be provided.');
  }

  try {
    const whereClause: any = {
      shift_date: {
        [Op.between]: [start_date, end_date]
      }
    };

    if (department_id) {
      whereClause.department_id = department_id;
    } else if (facility_id) {
      const departments = await DepartmentModel.findAll({
        where: { facility_id },
        attributes: ['id']
      });
      const departmentIds = departments.map(d => d.id);

      if (departmentIds.length > 0) {
        whereClause.department_id = { [Op.in]: departmentIds };
      } else {
        return {
          success: true,
          data: {
            department_id: null,
            facility_id,
            date_range: { start_date, end_date },
            graph_data: []
          }
        };
      }
    }

    const records = await ProductivityRecordModel.findAll({
      where: whereClause,
      order: [['shift_date', 'ASC']]
    });


    const recordsWithScores = records.filter(r => {
      if (r.productivity_score === null || r.productivity_score === undefined) return false;
      const num = parseFloat(r.productivity_score as any);
      return !isNaN(num);
    }).length;

    // Helper function to get productivity score with proper type conversion
    const getProductivityScore = (record: any): number | null => {
      if (record.productivity_score !== null && record.productivity_score !== undefined) {
        const score = parseFloat(record.productivity_score as any);
        return isNaN(score) ? null : score;
      }

      // If productivity_score is null, try to calculate it from patient data
      // This is a basic calculation based on patient acuity weights and bed utilization
      const totalPatients = record.total_patients_calculated || 0;
      const totalBeds = record.total_beds || 0;

      if (totalBeds === 0) return null; // Can't calculate without bed data

      // Patient acuity weights (higher acuity = higher score)
      const criticalWeight = 3.0;    // Critical patients require most resources
      const severeWeight = 2.5;      // Severe patients 
      const semiCriticalWeight = 2.0; // Semi-critical
      const moderateWeight = 1.5;    // Moderate
      const convalescingWeight = 1.0; // Convalescing (lowest acuity)

      // Calculate weighted patient score
      const weightedScore = (
        (record.critical_patients || 0) * criticalWeight +
        (record.severe_patients || 0) * severeWeight +
        (record.semi_critical_patients || 0) * semiCriticalWeight +
        (record.moderate_patients || 0) * moderateWeight +
        (record.convalescing_patients || 0) * convalescingWeight
      );

      // Calculate bed utilization rate
      const bedUtilization = totalPatients / totalBeds;

      if (totalPatients === 0) {
        return 0; // No patients = 0 productivity
      }

      const avgPatientAcuity = weightedScore / totalPatients;
      const productivityScore = avgPatientAcuity * bedUtilization * 100;

      // Cap at 100% max
      return Math.min(Math.round(productivityScore * 100) / 100, 100);
    };

    // Group by date and calculate average productivity score
    const groupedData = records.reduce((acc: any, record) => {
      const date = record.shift_date.toString();
      if (!acc[date]) {
        acc[date] = {
          date,
          productivity_scores: [],
          count: 0
        };
      }

      // Get or calculate productivity score with proper type conversion
      const productivityScore = getProductivityScore(record);

      // Ensure productivity score is a valid number before adding to array
      if (productivityScore !== null && productivityScore !== undefined && !isNaN(Number(productivityScore))) {
        acc[date].productivity_scores.push(Number(productivityScore));
      }
      acc[date].count++;
      return acc;
    }, {});

    const graphData = Object.values(groupedData).map((dateData: any) => {
      let avg = null;
      if (dateData.productivity_scores.length > 0) {
        const sum = dateData.productivity_scores.reduce((sum: number, score: number) => sum + score, 0);
        avg = Math.round((sum / dateData.productivity_scores.length) * 100) / 100;
      }
      return {
        date: dateData.date,
        productivity_score_average: avg,
        record_count: dateData.count
      };
    });

    return {
      success: true,
      data: {
        department_id: department_id || null,
        facility_id: facility_id || null,
        date_range: { start_date, end_date },
        graph_data: graphData
      }
    };
  } catch (error) {
    console.error('Error getting productivity graph:', error);
    throw error;
  }
};

/// Get patient count graph data
export const getSumPatientGraph = async (filters: {
  department_id?: number;
  facility_id?: number;
  start_date: string;
  end_date: string;
}) => {
  const { department_id, facility_id, start_date, end_date } = filters;

  if (!department_id && !facility_id) {
    throw new Error('Either department_id or facility_id must be provided.');
  }

  try {
    const whereClause: any = {
      shift_date: { [Op.between]: [start_date, end_date] }
    };

    if (department_id) {
      whereClause.department_id = department_id;
    } else if (facility_id) {
      const departments = await DepartmentModel.findAll({
        where: { facility_id },
        attributes: ['id']
      });
      const departmentIds = departments.map(d => d.id);

      if (departmentIds.length === 0) {
        return { success: true, data: { graph_data: [] } };
      }
      whereClause.department_id = { [Op.in]: departmentIds };
    }

    const records = await ProductivityRecordModel.findAll({
      where: whereClause,
      order: [['shift_date', 'ASC']]
    });

    // Group by date and calculate average patient count
    const groupedData = records.reduce((acc: any, record) => {
      const date = record.shift_date.toString();
      if (!acc[date]) {
        acc[date] = {
          date,
          patient_counts: [],
          count: 0
        };
      }
      // Only include non-null patient counts
      if (record.total_patients_calculated !== null && record.total_patients_calculated !== undefined) {
        acc[date].patient_counts.push(record.total_patients_calculated);
      }
      acc[date].count++;
      return acc;
    }, {});

    const graphData = Object.values(groupedData).map((dateData: any) => {
      let avg = null;
      if (dateData.patient_counts.length > 0) {
        const sum = dateData.patient_counts.reduce((sum: number, count: number) => sum + count, 0);
        avg = Math.round((sum / dateData.patient_counts.length) * 100) / 100;
      }
      return {
        date: dateData.date,
        total_patients_average: avg,
        record_count: dateData.count
      };
    });

    return {
      success: true,
      data: {
        department_id: department_id || null,
        facility_id: facility_id || null,
        date_range: { start_date, end_date },
        graph_data: graphData
      }
    };
  } catch (error) {
    console.error('Error getting patient graph:', error);
    throw error;
  }
};

/// Get staff count graph data
export const getSumStaffGraph = async (filters: {
  department_id?: number;
  facility_id?: number;
  start_date: string;
  end_date: string;
}) => {
  const { department_id, facility_id, start_date, end_date } = filters;

  if (!department_id && !facility_id) {
    throw new Error('Either department_id or facility_id must be provided.');
  }

  try {
    const whereClause: any = {
      shift_date: { [Op.between]: [start_date, end_date] },
      is_active: true,
    };

    if (department_id) {
      whereClause.department_id = department_id;
    } else if (facility_id) {
      const departments = await DepartmentModel.findAll({
        where: { facility_id },
        attributes: ['id'],
      });
      const departmentIds = departments.map((d) => d.id);
      
      if (departmentIds.length === 0) {
        return { success: true, data: { graph_data: [] } };
      }
      whereClause.department_id = { [Op.in]: departmentIds };
    }

    const allShiftCounts = await ScheduleShiftModel.findAll({
      attributes: [
        'shift_date',
        [fn('COUNT', fn('DISTINCT', col('ScheduleShiftModel.employee_id'))), 'unique_staff_count'],
        [fn('COUNT', fn('DISTINCT', col('ScheduleShiftModel.shift_type_id'))), 'shift_count']
      ],
      where: whereClause,
      group: ['shift_date'],
      order: [['shift_date', 'ASC']],
      include: [
        {
          model: ShiftTypeModel,
          as: 'shift_type',
          required: true,
          attributes: [],
          where: {
            short_name: { [Op.notIn]: ['X', 'V', 'TRN'] }
          }
        },
        {
          model: UserModel,
          as: 'employee',
          required: true,
          attributes: [],
          include: [{
            model: UserRoleModel, as: 'user_role', required: true, attributes: [],
            include: [{
              model: RoleModel, as: 'role', required: true, attributes: [],
              where: { id: [5, 30, 31] }
            }]
          }]
        }
      ],
      raw: true,
    });

    const graphData = (allShiftCounts as any[]).map((data) => {
      const date = dayjs(data.shift_date).format('YYYY-MM-DD');
      const uniqueStaffCount = parseInt(data.unique_staff_count, 10);
      const shiftCount = parseInt(data.shift_count, 10);
      
      return {
        date,
        sum_staff_average: uniqueStaffCount,
        record_count: shiftCount
      };
    });

    return {
      success: true,
      data: {
        department_id: department_id || null,
        facility_id: facility_id || null,
        date_range: { start_date, end_date },
        graph_data: graphData
      }
    };
  } catch (error) {
    console.error('Error getting staff graph:', error);
    throw error;
  }
};

/// Get used bed graph data
export const getSumUsedBedGraph = async (filters: {
  department_id?: number;
  facility_id?: number;
  start_date: string;
  end_date: string;
}) => {
  const { department_id, facility_id, start_date, end_date } = filters;

  if (!department_id && !facility_id) {
    throw new Error('Either department_id or facility_id must be provided.');
  }

  try {
    const whereClause: any = {
      shift_date: { [Op.between]: [start_date, end_date] }
    };

    if (department_id) {
      whereClause.department_id = department_id;
    } else if (facility_id) {
      const departments = await DepartmentModel.findAll({
        where: { facility_id },
        attributes: ['id']
      });
      const departmentIds = departments.map(d => d.id);

      if (departmentIds.length === 0) {
        return { success: true, data: { graph_data: [] } };
      }
      whereClause.department_id = { [Op.in]: departmentIds };
    }

    const records = await ProductivityRecordModel.findAll({
      where: whereClause,
      order: [['shift_date', 'ASC']]
    });

    // Group by date and calculate average used bed count (total_patients_calculated)
    const groupedData = records.reduce((acc: any, record) => {
      const date = record.shift_date.toString();
      if (!acc[date]) {
        acc[date] = {
          date,
          used_bed_counts: [],
          count: 0
        };
      }
      // Only include non-null used bed counts
      if (record.total_patients_calculated !== null && record.total_patients_calculated !== undefined) {
        acc[date].used_bed_counts.push(record.total_patients_calculated);
      }
      acc[date].count++;
      return acc;
    }, {});

    const graphData = Object.values(groupedData).map((dateData: any) => {
      let avg = null;
      if (dateData.used_bed_counts.length > 0) {
        const sum = dateData.used_bed_counts.reduce((sum: number, count: number) => sum + count, 0);
        avg = Math.round((sum / dateData.used_bed_counts.length) * 100) / 100;
      }
      return {
        date: dateData.date,
        used_bed_average: avg,
        record_count: dateData.count
      };
    });

    return {
      success: true,
      data: {
        department_id: department_id || null,
        facility_id: facility_id || null,
        date_range: { start_date, end_date },
        graph_data: graphData
      }
    };
  } catch (error) {
    console.error('Error getting used bed graph:', error);
    throw error;
  }
};

// ========== Graphs Regional Health Director&Permanent Secretary ========== //
/// get single health region data (helper function)
const getSingleHealthRegionData = async (regionId: number, startDate: string, endDate: string, includeProvinces: boolean = true) => {
  // Always use facility-level aggregation for consistent results
  const provinces = await getProvinceDetailsForRegion(regionId, startDate, endDate);

  if (provinces.length === 0) {
    return null;
  }

  // Get region metadata
  const regionQuery = `
    SELECT 
      hr.id as health_region_id,
      hr.region_name_th,
      hr.region_name_en
    FROM health_regions hr
    WHERE hr.id = ?
  `;

  const regionResults = await sequelize.query(regionQuery, {
    replacements: [regionId],
    type: QueryTypes.SELECT
  });

  if (regionResults.length === 0) {
    return null;
  }

  const regionInfo: any = regionResults[0];

  // Aggregate totals from province-level data (computed from facility averages)
  const totalFacilities = provinces.reduce((s: number, p: any) => s + (p.facility_sum || 0), 0);
  const totalBedsUsed = provinces.reduce((s: number, p: any) => s + (p.bed_used_sum || 0), 0);
  const totalBeds = provinces.reduce((s: number, p: any) => s + (p.total_beds_sum || 0), 0);
  const totalFreeBeds = provinces.reduce((s: number, p: any) => s + (p.free_beds_sum || 0), 0);
  const avgOccupancy = provinces.length > 0 ? Math.round((provinces.reduce((s: number, p: any) => s + (p.bed_occupancy_rate || 0), 0) / provinces.length) * 100) / 100 : 0;

  // Aggregate statistics
  const totalRecords = provinces.reduce((s: number, p: any) => s + (p.statistics.total_records || 0), 0);
  const departmentCount = provinces.reduce((s: number, p: any) => s + (p.statistics.department_count || 0), 0);
  const dateRangeDays = provinces.length > 0 ? Math.max(...provinces.map((p: any) => p.statistics.date_range_days || 0)) : 0;

  const result: any = {
    health_region_id: regionInfo.health_region_id,
    region_name_th: regionInfo.region_name_th,
    region_name_en: regionInfo.region_name_en,
    facility_sum: totalFacilities,
    bed_occupancy_rate: avgOccupancy,
    bed_used_sum: Math.round(totalBedsUsed * 100) / 100,
    total_beds_sum: Math.round(totalBeds * 100) / 100,
    free_beds_sum: Math.round(totalFreeBeds * 100) / 100,
    statistics: {
      total_records: totalRecords,
      department_count: departmentCount,
      date_range_days: dateRangeDays,
      utilization_rate: totalBeds > 0 ?
        Math.round((totalBedsUsed / totalBeds) * 100 * 100) / 100 : 0
    }
  };

  // Only include provinces if requested
  if (includeProvinces) {
    result.provinces = provinces;
  }

  return result;
};

/// get province breakdown for a specific health region (helper function)
const getProvinceDetailsForRegion = async (regionId: number, startDate: string, endDate: string) => {
  // Get province list first to process sequentially (memory-optimized)
  const provinceListQuery = `
    SELECT 
      hrp.province_geocode,
      p.province_name_th,
      p.province_name_en
    FROM health_region_provinces hrp
    LEFT JOIN provinces p ON p.province_code = CAST(hrp.province_geocode AS UNSIGNED)
    WHERE hrp.health_region_id = ?
    ORDER BY hrp.province_geocode
  `;

  const provinceList = await sequelize.query(provinceListQuery, {
    replacements: [regionId],
    type: QueryTypes.SELECT
  });

  // Process provinces sequentially to reduce memory usage
  const provinces = [];
  for (const row of provinceList as any[]) {
    const provinceCode = String(row.province_geocode);
    try {
      const facilityDetails = await getFacilityDetailsForProvince(provinceCode, startDate, endDate, regionId);

      const facilitySum = facilityDetails.length;
      const totalBedsSumFromFacilities = facilityDetails.reduce((s: number, f: any) => s + (f.averages.total_beds_avg || 0), 0);
      const totalBedsUsedFromFacilities = facilityDetails.reduce((s: number, f: any) => s + (f.averages.bed_used_avg || 0), 0);
      const totalFreeBedsFromFacilities = facilityDetails.reduce((s: number, f: any) => s + (f.averages.free_beds_avg || 0), 0);
      const avgOccupancy = facilityDetails.length > 0 ? Math.round((facilityDetails.reduce((s: number, f: any) => s + (f.averages.bed_occupancy_rate || 0), 0) / facilityDetails.length) * 100) / 100 : 0;

      // Aggregate statistics
      const totalRecords = facilityDetails.reduce((s: number, f: any) => s + (f.statistics.total_records || 0), 0);
      const departmentCount = facilityDetails.reduce((s: number, f: any) => s + (f.department_count || 0), 0);
      const dateRangeDays = facilityDetails.length > 0 ? Math.max(...facilityDetails.map((f: any) => f.statistics.date_range_days || 0)) : 0;

      provinces.push({
        province_geocode: row.province_geocode,
        province_name_th: row.province_name_th || `จังหวัดรหัส ${row.province_geocode}`,
        province_name_en: row.province_name_en || `Province ${row.province_geocode}`,
        facility_sum: facilitySum,
        bed_occupancy_rate: avgOccupancy,
        bed_used_sum: Math.round(totalBedsUsedFromFacilities * 100) / 100,
        total_beds_sum: Math.round(totalBedsSumFromFacilities * 100) / 100,
        free_beds_sum: Math.round(totalFreeBedsFromFacilities * 100) / 100,
        statistics: {
          total_records: totalRecords,
          department_count: departmentCount,
          date_range_days: dateRangeDays,
          utilization_rate: totalBedsSumFromFacilities > 0 ?
            Math.round((totalBedsUsedFromFacilities / totalBedsSumFromFacilities) * 100 * 100) / 100 : 0
        }
      });
    } catch (error) {
      console.error(`❌ Error processing province ${provinceCode} in region ${regionId}:`, error);
      // Continue with other provinces even if one fails
    }
  }

  return provinces;
};

/// Get health region dashboard data with fiscal year logic (Optimized)
export const getHealthRegionDashboard = async (filters: {
  fiscal_year?: number | string;
  health_region_id?: number | string;
  start_date?: string;
  end_date?: string;
}) => {
  const {
    fiscal_year: rawFiscalYear,
    health_region_id: rawHealthRegionId,
    start_date: rawStartDate,
    end_date: rawEndDate
  } = filters;

  try {
    // Input validation and type conversion
    const fiscal_year = rawFiscalYear ?
      (typeof rawFiscalYear === 'string' ? parseInt(rawFiscalYear, 10) : rawFiscalYear) : undefined;
    const health_region_id = rawHealthRegionId ?
      (typeof rawHealthRegionId === 'string' ? parseInt(rawHealthRegionId, 10) : rawHealthRegionId) : undefined;

    // Validate inputs
    if (!rawStartDate && !rawEndDate && !fiscal_year) {
      throw new Error('Either fiscal_year or both start_date and end_date must be provided');
    }

    if (fiscal_year && (!Number.isInteger(fiscal_year) || fiscal_year < 2500 || fiscal_year > 2600)) {
      throw new Error(`Invalid fiscal_year: ${rawFiscalYear}. Must be a valid Buddhist year (2500-2600)`);
    }

    if (health_region_id && (!Number.isInteger(health_region_id) || health_region_id < 1 || health_region_id > 13)) {
      throw new Error(`Invalid health_region_id: ${rawHealthRegionId}. Must be 1-13`);
    }

    // Date validation for custom date range
    if (rawStartDate && !rawEndDate) {
      throw new Error('end_date is required when start_date is provided');
    }
    if (rawEndDate && !rawStartDate) {
      throw new Error('start_date is required when end_date is provided');
    }

    let startDate: string;
    let endDate: string;

    if (rawStartDate && rawEndDate) {
      // Use custom date range
      const startDateObj = new Date(rawStartDate);
      const endDateObj = new Date(rawEndDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format');
      }

      if (startDateObj > endDateObj) {
        throw new Error('start_date must be earlier than or equal to end_date');
      }

      startDate = rawStartDate;
      endDate = rawEndDate;

      console.log(`Custom date range: ${startDate} to ${endDate}`);
    } else if (fiscal_year) {
      // Calculate fiscal year date range
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();

      // Convert fiscal year from Buddhist to Christian
      const fiscalChristianYear = fiscal_year - 543;
      const fiscalStartYear = fiscalChristianYear - 1;
      startDate = `${fiscalStartYear}-10-01`;

      const fiscalEndDate = new Date(`${fiscalChristianYear}-10-01`);
      if (currentDate < fiscalEndDate) {
        endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      } else {
        endDate = `${fiscalChristianYear}-09-30`;
      }

      console.log(`Fiscal Year ${fiscal_year} (${fiscalChristianYear}): ${startDate} to ${endDate}`);
    } else {
      throw new Error('Unable to determine date range from provided parameters');
    }

    let processedResults: any[] = [];

    if (health_region_id) {
      // Single region query (fast path) with province details
      console.log(`⚡ Fast query for region ${health_region_id} with province details`);
      const singleResult = await getSingleHealthRegionData(health_region_id, startDate, endDate, true);
      if (singleResult) {
        processedResults = [singleResult];
      }
    } else {
      // OPTIMIZED: Single query for all 13 regions overview (no province details)
      console.log(`⚡ FAST: Single query for all 13 regions overview`);

      const allRegionsQuery = `
        SELECT 
          hr.id as health_region_id,
          hr.region_name_th,
          hr.region_name_en,
          COUNT(DISTINCT f.id) as facility_sum,
          
          -- Region-level aggregations using facility-level averages
          ROUND(AVG(facility_stats.facility_bed_occupancy_rate), 2) as bed_occupancy_rate,
          ROUND(SUM(facility_stats.facility_bed_used_avg), 2) as bed_used_sum,
          ROUND(SUM(facility_stats.facility_total_beds_avg), 2) as total_beds_sum,
          ROUND(SUM(facility_stats.facility_free_beds_avg), 2) as free_beds_sum,
          
          -- Region statistics (handle null values properly)
          COALESCE(SUM(facility_stats.facility_total_records), 0) as total_records,
          COALESCE(SUM(facility_stats.facility_department_count), 0) as department_count,
          COALESCE(MAX(facility_stats.facility_date_range_days), 0) as date_range_days
          
        FROM health_regions hr
        LEFT JOIN health_region_provinces hrp ON hr.id = hrp.health_region_id
        LEFT JOIN facilities f ON CAST(f.province_code AS CHAR) = hrp.province_geocode
        LEFT JOIN (
          SELECT 
            f2.id as facility_id,
            ROUND(AVG(dept_stats.avg_bed_occupancy_rate), 2) as facility_bed_occupancy_rate,
            ROUND(SUM(dept_stats.avg_bed_used), 2) as facility_bed_used_avg,
            ROUND(SUM(dept_stats.avg_total_beds), 2) as facility_total_beds_avg,
            ROUND(SUM(dept_stats.avg_free_beds), 2) as facility_free_beds_avg,
            SUM(dept_stats.total_records) as facility_total_records,
            COUNT(DISTINCT dept_stats.dept_id) as facility_department_count,
            MAX(dept_stats.date_range_days) as facility_date_range_days
          FROM facilities f2
          JOIN (
            SELECT 
              d.id as dept_id,
              d.facility_id,
              AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END) as avg_bed_occupancy_rate,
              AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END) as avg_bed_used,
              AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END) as avg_total_beds,
              AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END) as avg_free_beds,
              COUNT(pr.id) as total_records,
              COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days
            FROM departments d
            LEFT JOIN productivity_records pr ON pr.department_id = d.id 
              AND pr.shift_date BETWEEN ? AND ?
            GROUP BY d.id, d.facility_id
          ) dept_stats ON dept_stats.facility_id = f2.id
          GROUP BY f2.id
        ) facility_stats ON facility_stats.facility_id = f.id
        WHERE f.id IS NOT NULL
        GROUP BY hr.id, hr.region_name_th, hr.region_name_en
        ORDER BY hr.id ASC
      `;

      const allRegionsResults = await sequelize.query(allRegionsQuery, {
        replacements: [startDate, endDate],
        type: QueryTypes.SELECT
      });

      processedResults = allRegionsResults.map((row: any) => ({
        health_region_id: row.health_region_id,
        region_name_th: row.region_name_th,
        region_name_en: row.region_name_en,
        facility_sum: parseInt(row.facility_sum) || 0,
        bed_occupancy_rate: parseFloat(row.bed_occupancy_rate) || 0,
        bed_used_sum: Math.round((parseFloat(row.bed_used_sum) || 0) * 100) / 100,
        total_beds_sum: Math.round((parseFloat(row.total_beds_sum) || 0) * 100) / 100,
        free_beds_sum: Math.round((parseFloat(row.free_beds_sum) || 0) * 100) / 100,
        statistics: {
          total_records: parseInt(row.total_records) || 0,
          department_count: parseInt(row.department_count) || 0,
          date_range_days: parseInt(row.date_range_days) || 0,
          utilization_rate: (parseFloat(row.total_beds_sum) || 0) > 0 ?
            Math.round(((parseFloat(row.bed_used_sum) || 0) / (parseFloat(row.total_beds_sum) || 0)) * 100 * 100) / 100 : 0
        }
      }));
    }

    // Calculate overall summary if returning all regions
    let summary = null;
    if (!health_region_id && processedResults.length > 0) {
      const totalFacilities = processedResults.reduce((sum: number, region: any) => sum + region.facility_sum, 0);
      const avgOccupancyRate = processedResults.length > 0 ?
        Math.round((processedResults.reduce((sum: number, region: any) => sum + region.bed_occupancy_rate, 0) / processedResults.length) * 100) / 100 : 0;
      const totalBedsUsed = processedResults.reduce((sum: number, region: any) => sum + region.bed_used_sum, 0);
      const totalBeds = processedResults.reduce((sum: number, region: any) => sum + region.total_beds_sum, 0);
      const totalFreeBedsSum = processedResults.reduce((sum: number, region: any) => sum + region.free_beds_sum, 0);

      summary = {
        total_health_regions: processedResults.length,
        total_facilities: totalFacilities,
        overall_avg_bed_occupancy_rate: avgOccupancyRate,
        total_bed_used_sum: Math.round(totalBedsUsed * 100) / 100,
        total_beds_sum: Math.round(totalBeds * 100) / 100,
        total_free_beds_sum: Math.round(totalFreeBedsSum * 100) / 100,
        overall_utilization_rate: totalBeds > 0 ?
          Math.round((totalBedsUsed / totalBeds) * 100 * 100) / 100 : 0
      };
    }

    // Calculate summary for response
    const isYearToDate = rawStartDate && rawEndDate ?
      false : // Custom date range is not year-to-date
      fiscal_year ?
        new Date() < new Date(`${fiscal_year - 543}-10-01`) : // Fiscal year logic
        false;

    return {
      success: true,
      message: health_region_id ?
        `Health region ${health_region_id} dashboard data retrieved successfully` :
        'All health regions dashboard data retrieved successfully',
      data: {
        fiscal_year: fiscal_year || null,
        custom_date_range: rawStartDate && rawEndDate ? { start_date: startDate, end_date: endDate } : null,
        date_range: {
          start_date: startDate,
          end_date: endDate,
          is_year_to_date: isYearToDate
        },
        health_region_id: health_region_id || null,
        regions: processedResults,
        summary
      }
    };

  } catch (error) {
    console.error('Error getting health region dashboard:', error);
    throw error;
  }
};

// ========== For Dialog Details ========== //

/// get facility breakdown for a specific category (helper function)
const getFacilityDetailsForCategory = async (
  categoryId: number,
  startDate: string,
  endDate: string,
  healthRegionId?: number,
  includeTotals: boolean = false
) => {
  let query = `
    SELECT 
      f.id as facility_id,
      f.name as facility_name,
      f.province_code,
      p.province_name_th,
      p.province_name_en,
      COUNT(DISTINCT d.id) as department_count,
      
      -- Facility-level aggregations for this category
      ROUND(AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END), 2) as bed_occupancy_rate,
      ROUND(AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END), 2) as bed_used_avg,
      ROUND(AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END), 2) as total_beds_avg,
      ROUND(AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END), 2) as free_beds_avg,
      ROUND(AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END), 2) as productivity_score_avg,
      
      -- Sum totals for facility in this category
      SUM(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated ELSE 0 END) as total_patients_sum,
      SUM(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds ELSE 0 END) as total_beds_sum,
      SUM(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated ELSE 0 END) as free_beds_sum,
      SUM(CASE WHEN pr.admitted_patients IS NOT NULL THEN pr.admitted_patients ELSE 0 END) as total_admissions,
      SUM(CASE WHEN pr.discharged_patients IS NOT NULL THEN pr.discharged_patients ELSE 0 END) as total_discharges,
      
      -- Facility statistics
      COUNT(pr.id) as total_records,
      COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days,
      MIN(pr.shift_date) as first_record_date,
      MAX(pr.shift_date) as last_record_date
      
    FROM facilities f
    LEFT JOIN provinces p ON CAST(f.province_code AS CHAR) = CAST(p.province_code AS CHAR)
    LEFT JOIN departments d ON d.facility_id = f.id
    LEFT JOIN department_category dc ON dc.department_id = d.id AND dc.is_active = 1 AND dc.category_id = ?
    LEFT JOIN category_master cm ON cm.id = dc.category_id
    LEFT JOIN productivity_records pr ON pr.department_id = d.id 
      AND pr.shift_date BETWEEN ? AND ?
  `;

  const replacements: any[] = [categoryId, startDate, endDate];

  // Add health region filter if provided
  if (healthRegionId) {
    query += ` 
      WHERE f.id IN (
        SELECT DISTINCT f2.id 
        FROM facilities f2 
        JOIN health_region_provinces hrp ON CAST(f2.province_code AS CHAR) = hrp.province_geocode 
        WHERE hrp.health_region_id = ?
      )`;
    replacements.push(healthRegionId);
  }

  query += `
    GROUP BY f.id, f.name, f.province_code, p.province_name_th, p.province_name_en
    HAVING COUNT(DISTINCT d.id) > 0
    ORDER BY f.name
  `;

  const results = await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT
  });

  return results.map((row: any) => {
    const totalBedsSum = parseFloat(row.total_beds_sum) || 0;
    const totalPatientsSum = parseFloat(row.total_patients_sum) || 0;

    const base = {
      facility_id: row.facility_id,
      facility_name: row.facility_name,
      province_info: {
        province_code: row.province_code,
        province_name_th: row.province_name_th,
        province_name_en: row.province_name_en
      },
      department_count: parseInt(row.department_count) || 0,
      averages: {
        bed_occupancy_rate: parseFloat(row.bed_occupancy_rate) || 0,
        bed_used_avg: parseFloat(row.bed_used_avg) || 0,
        total_beds_avg: parseFloat(row.total_beds_avg) || 0,
        free_beds_avg: parseFloat(row.free_beds_avg) || 0,
        productivity_score_avg: parseFloat(row.productivity_score_avg) || 0
      },
      statistics: {
        total_records: parseInt(row.total_records) || 0,
        date_range_days: parseInt(row.date_range_days) || 0,
        first_record_date: row.first_record_date,
        last_record_date: row.last_record_date,
        utilization_rate: totalBedsSum > 0 ?
          Math.round((totalPatientsSum / totalBedsSum) * 100 * 100) / 100 : 0,
        avg_patients_per_day: row.date_range_days > 0 ?
          Math.round((parseInt(row.total_patients_sum) || 0) / parseInt(row.date_range_days) * 100) / 100 : 0
      }
    } as any;

    if (includeTotals) {
      base.totals = {
        total_patients_sum: parseInt(row.total_patients_sum) || 0,
        total_beds_sum: parseInt(row.total_beds_sum) || 0,
        free_beds_sum: parseInt(row.free_beds_sum) || 0,
        total_admissions: parseInt(row.total_admissions) || 0,
        total_discharges: parseInt(row.total_discharges) || 0
      };
    }

    return base;
  });
};

/// get facility breakdown for a specific province (helper function)
const getFacilityDetailsForProvince = async (
  provinceCode: string,
  startDate: string,
  endDate: string,
  healthRegionId?: number,
  includeTotals: boolean = false // flag for totals sum not used
) => {
  let query = `
    SELECT 
      f.id as facility_id,
      f.name as facility_name,
      f.province_code,
      p.province_name_th,
      p.province_name_en,
      
      -- Facility-level totals (sum of department averages)
      COUNT(DISTINCT dept_stats.dept_id) as department_count,
      ROUND(AVG(dept_stats.avg_bed_occupancy_rate), 2) as bed_occupancy_rate,
      ROUND(SUM(dept_stats.avg_bed_used), 2) as bed_used_avg,
      ROUND(SUM(dept_stats.avg_total_beds), 2) as total_beds_avg,
      ROUND(SUM(dept_stats.avg_free_beds), 2) as free_beds_avg,
      ROUND(AVG(dept_stats.avg_productivity_score), 2) as productivity_score_avg,
      
      -- Facility statistics (aggregated from departments)
      SUM(dept_stats.total_records) as total_records,
      MAX(dept_stats.date_range_days) as date_range_days,
      MIN(dept_stats.first_record_date) as first_record_date,
      MAX(dept_stats.last_record_date) as last_record_date
      
    FROM facilities f
    LEFT JOIN provinces p ON CAST(f.province_code AS CHAR) = CAST(p.province_code AS CHAR)
    JOIN (
      SELECT 
        d.id as dept_id,
        d.facility_id,
        
        -- Department-level averages (correct approach)
        AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END) as avg_bed_occupancy_rate,
        AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END) as avg_bed_used,
        AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END) as avg_total_beds,
        AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END) as avg_free_beds,
        AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END) as avg_productivity_score,
        
        -- Department statistics
        COUNT(pr.id) as total_records,
        COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days,
        MIN(pr.shift_date) as first_record_date,
        MAX(pr.shift_date) as last_record_date
        
      FROM departments d
      LEFT JOIN productivity_records pr ON pr.department_id = d.id 
        AND pr.shift_date BETWEEN ? AND ?
      GROUP BY d.id, d.facility_id
      HAVING COUNT(pr.id) > 0
    ) dept_stats ON dept_stats.facility_id = f.id
    WHERE dept_stats.facility_id IS NOT NULL  -- Only facilities with productivity data
  `;

  const replacements: any[] = [startDate, endDate];

  // Add province filter
  query += ` AND CAST(f.province_code AS CHAR) = ?`;
  replacements.push(provinceCode);

  // Add health region filter if provided
  if (healthRegionId) {
    query += ` 
      AND f.id IN (
        SELECT DISTINCT f2.id 
        FROM facilities f2 
        JOIN health_region_provinces hrp ON CAST(f2.province_code AS CHAR) = hrp.province_geocode 
        WHERE hrp.health_region_id = ?
      )`;
    replacements.push(healthRegionId);
  }

  // Group by and order
  query += `
    GROUP BY f.id, f.name, f.province_code, p.province_name_th, p.province_name_en
    HAVING COUNT(dept_stats.dept_id) > 0
    ORDER BY f.name ASC
  `;

  const results = await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT
  });

  return results.map((row: any) => {
    const totalBedsSum = parseFloat(row.total_beds_sum) || 0;
    const totalPatientsSum = parseFloat(row.total_patients_sum) || 0;

    const base = {
      facility_id: row.facility_id,
      facility_name: row.facility_name,
      province_info: {
        province_code: row.province_code,
        province_name_th: row.province_name_th,
        province_name_en: row.province_name_en
      },
      department_count: parseInt(row.department_count) || 0,
      averages: {
        bed_occupancy_rate: parseFloat(row.bed_occupancy_rate) || 0,
        bed_used_avg: parseFloat(row.bed_used_avg) || 0,
        total_beds_avg: parseFloat(row.total_beds_avg) || 0,
        free_beds_avg: parseFloat(row.free_beds_avg) || 0,
        productivity_score_avg: parseFloat(row.productivity_score_avg) || 0
      },
      statistics: {
        total_records: parseInt(row.total_records) || 0,
        date_range_days: parseInt(row.date_range_days) || 0,
        first_record_date: row.first_record_date,
        last_record_date: row.last_record_date,
        utilization_rate: totalBedsSum > 0 ?
          Math.round((totalPatientsSum / totalBedsSum) * 100 * 100) / 100 : 0,
        avg_patients_per_day: row.date_range_days > 0 ?
          Math.round((parseInt(row.total_patients_sum) || 0) / parseInt(row.date_range_days) * 100) / 100 : 0
      }
    } as any;

    if (includeTotals) {
      base.totals = {
        total_patients_sum: parseInt(row.total_patients_sum) || 0,
        total_beds_sum: parseInt(row.total_beds_sum) || 0,
        free_beds_sum: parseInt(row.free_beds_sum) || 0,
        total_admissions: parseInt(row.total_admissions) || 0,
        total_discharges: parseInt(row.total_discharges) || 0
      };
    }

    return base;
  });
};

/// Get province dashboard data with fiscal year logic
export const getProvinceDashboard = async (filters: {
  province_code: string;
  fiscal_year?: number | string;
  health_region_id?: number | string;
  start_date?: string;
  end_date?: string;
}) => {
  const {
    province_code,
    fiscal_year: rawFiscalYear,
    health_region_id: rawHealthRegionId,
    start_date: rawStartDate,
    end_date: rawEndDate
  } = filters;

  try {
    // Input validation and type conversion
    const fiscal_year = rawFiscalYear ?
      (typeof rawFiscalYear === 'string' ? parseInt(rawFiscalYear, 10) : rawFiscalYear) : undefined;
    const health_region_id = rawHealthRegionId ?
      (typeof rawHealthRegionId === 'string' ? parseInt(rawHealthRegionId, 10) : rawHealthRegionId) : undefined;

    // Validate inputs
    if (!rawStartDate && !rawEndDate && !fiscal_year) {
      throw new Error('Either fiscal_year or both start_date and end_date must be provided');
    }

    if (fiscal_year && (!Number.isInteger(fiscal_year) || fiscal_year < 2500 || fiscal_year > 2600)) {
      throw new Error(`Invalid fiscal_year: ${rawFiscalYear}. Must be a valid Buddhist year (2500-2600)`);
    }

    if (health_region_id && (!Number.isInteger(health_region_id) || health_region_id < 1 || health_region_id > 13)) {
      throw new Error(`Invalid health_region_id: ${rawHealthRegionId}. Must be 1-13`);
    }

    // Date validation for custom date range
    if (rawStartDate && !rawEndDate) {
      throw new Error('end_date is required when start_date is provided');
    }
    if (rawEndDate && !rawStartDate) {
      throw new Error('start_date is required when end_date is provided');
    }

    let startDate: string;
    let endDate: string;

    if (rawStartDate && rawEndDate) {
      // Use custom date range
      const startDateObj = new Date(rawStartDate);
      const endDateObj = new Date(rawEndDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format');
      }

      if (startDateObj > endDateObj) {
        throw new Error('start_date must be earlier than or equal to end_date');
      }

      startDate = rawStartDate;
      endDate = rawEndDate;

      console.log(`Custom date range: ${startDate} to ${endDate}`);
    } else if (fiscal_year) {
      // Calculate fiscal year date range
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();

      // Convert fiscal year from Buddhist to Christian
      const fiscalChristianYear = fiscal_year - 543;
      const fiscalStartYear = fiscalChristianYear - 1;
      startDate = `${fiscalStartYear}-10-01`;

      const fiscalEndDate = new Date(`${fiscalChristianYear}-10-01`);
      if (currentDate < fiscalEndDate) {
        endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      } else {
        endDate = `${fiscalChristianYear}-09-30`;
      }

      console.log(`Fiscal Year ${fiscal_year} (${fiscalChristianYear}): ${startDate} to ${endDate}`);
    } else {
      throw new Error('Unable to determine date range from provided parameters');
    }

    // Build the query with optional health_region_id filter
    let query = `
      SELECT 
        p.province_code,
        p.province_name_th,
        p.province_name_en,
        hr.id as health_region_id,
        hr.region_name_th,
        hr.region_name_en,
        COUNT(DISTINCT f.id) as facility_sum,
        
        -- Province-level aggregations
        ROUND(AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END), 2) as bed_occupancy_rate,
        ROUND(AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END), 2) as bed_used_sum,
        ROUND(AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END), 2) as total_beds_sum,
        ROUND(AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END), 2) as free_beds_sum,
        ROUND(AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END), 2) as productivity_score_avg,
        
        -- Province statistics
        COUNT(pr.id) as total_records,
        COUNT(DISTINCT d.id) as department_count,
        COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days
        
      FROM provinces p
      LEFT JOIN health_region_provinces hrp ON CAST(p.province_code AS CHAR) = hrp.province_geocode
      LEFT JOIN health_regions hr ON hr.id = hrp.health_region_id
      LEFT JOIN facilities f ON CAST(f.province_code AS CHAR) = CAST(p.province_code AS CHAR)
      LEFT JOIN departments d ON d.facility_id = f.id
      LEFT JOIN productivity_records pr ON pr.department_id = d.id 
        AND pr.shift_date BETWEEN ? AND ?
      WHERE CAST(p.province_code AS CHAR) = ?
    `;

    const replacements: any[] = [startDate, endDate, province_code];

    // Add health_region_id filter if provided
    if (health_region_id) {
      query += ` AND hr.id = ?`;
      replacements.push(health_region_id);
    }

    query += `
      GROUP BY p.province_code, p.province_name_th, p.province_name_en, hr.id, hr.region_name_th, hr.region_name_en
      ORDER BY p.province_code
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    if (results.length === 0) {
      return {
        success: true,
        message: 'No data found for the specified province and criteria',
        data: {
          province_code,
          fiscal_year: fiscal_year || null,
          custom_date_range: rawStartDate && rawEndDate ? { start_date: startDate, end_date: endDate } : null,
          date_range: {
            start_date: startDate,
            end_date: endDate,
            is_year_to_date: rawStartDate && rawEndDate ? false : fiscal_year ? new Date() < new Date(`${fiscal_year - 543}-10-01`) : false
          },
          health_region_id: health_region_id || null,
          province_data: null,
          facilities: []
        }
      };
    }

    const row: any = results[0];

    // Get facility details for this province and compute province totals from per-facility metrics
    const facilityDetails = await getFacilityDetailsForProvince(province_code, startDate, endDate, health_region_id);

    // Sum per-facility averages to create province-level totals (more representative than AVG over all records)
    const facilitySum = facilityDetails.length;
    const totalBedsSumFromFacilities = facilityDetails.reduce((sum: number, f: any) => sum + (f.averages.total_beds_avg || 0), 0);
    const totalBedsUsedFromFacilities = facilityDetails.reduce((sum: number, f: any) => sum + (f.averages.bed_used_avg || 0), 0);
    const totalFreeBedsFromFacilities = facilityDetails.reduce((sum: number, f: any) => sum + (f.averages.free_beds_avg || 0), 0);
    const avgOccupancy = facilityDetails.length > 0 ? Math.round((facilityDetails.reduce((s: number, f: any) => s + (f.averages.bed_occupancy_rate || 0), 0) / facilityDetails.length) * 100) / 100 : 0;

    const provinceData = {
      province_code: row.province_code,
      province_name_th: row.province_name_th,
      province_name_en: row.province_name_en,
      health_region: {
        health_region_id: row.health_region_id,
        region_name_th: row.region_name_th,
        region_name_en: row.region_name_en
      },
      facility_sum: facilitySum,
      averages: {
        bed_occupancy_rate: avgOccupancy,
        // these are sums across facilities (approximate total beds / used beds)
        bed_used_sum: Math.round(totalBedsUsedFromFacilities * 100) / 100,
        total_beds_sum: Math.round(totalBedsSumFromFacilities * 100) / 100,
        free_beds_sum: Math.round(totalFreeBedsFromFacilities * 100) / 100,
        productivity_score_avg: parseFloat(row.productivity_score_avg) || 0
      },
      statistics: {
        total_records: parseInt(row.total_records) || 0,
        department_count: parseInt(row.department_count) || 0,
        date_range_days: parseInt(row.date_range_days) || 0,
        utilization_rate: totalBedsSumFromFacilities > 0 ?
          Math.round((totalBedsUsedFromFacilities / totalBedsSumFromFacilities) * 100 * 100) / 100 : 0
      }
    };

    // Calculate summary for response
    const isYearToDate = rawStartDate && rawEndDate ?
      false : // Custom date range is not year-to-date
      fiscal_year ?
        new Date() < new Date(`${fiscal_year - 543}-10-01`) : // Fiscal year logic
        false;

    return {
      success: true,
      message: `Province ${province_code} dashboard data retrieved successfully`,
      data: {
        province_code,
        fiscal_year: fiscal_year || null,
        custom_date_range: rawStartDate && rawEndDate ? { start_date: startDate, end_date: endDate } : null,
        date_range: {
          start_date: startDate,
          end_date: endDate,
          is_year_to_date: isYearToDate
        },
        health_region_id: health_region_id || null,
        province_data: provinceData,
        facilities: facilityDetails
      }
    };

  } catch (error) {
    console.error('Error getting province dashboard:', error);
    throw error;
  }
};

// ========== For Category Master ========== //

/// get single category data (helper function) - now using facility-level aggregation
const getSingleCategoryData = async (categoryId: number, startDate: string, endDate: string, healthRegionId?: number) => {
  // Get facility details for this category and compute totals from facility averages
  const facilityDetails = await getFacilityDetailsForCategory(categoryId, startDate, endDate, healthRegionId);

  if (facilityDetails.length === 0) {
    return null;
  }

  // Get category metadata
  const categoryQuery = `
    SELECT 
      cm.id as category_id,
      cm.code as category_code,
      cm.name_th as category_name_th,
      cm.name_en as category_name_en
    FROM category_master cm
    WHERE cm.id = ?
  `;

  const categoryResults = await sequelize.query(categoryQuery, {
    replacements: [categoryId],
    type: QueryTypes.SELECT
  });

  if (categoryResults.length === 0) {
    return null;
  }

  const categoryInfo: any = categoryResults[0];

  // Aggregate totals from facility-level data
  const facilitySum = facilityDetails.length;
  const departmentCount = facilityDetails.reduce((sum: number, f: any) => sum + (f.department_count || 0), 0);
  const totalBedsSum = facilityDetails.reduce((sum: number, f: any) => sum + (f.averages.total_beds_avg || 0), 0);
  const totalBedsUsed = facilityDetails.reduce((sum: number, f: any) => sum + (f.averages.bed_used_avg || 0), 0);
  const totalFreeBeds = facilityDetails.reduce((sum: number, f: any) => sum + (f.averages.free_beds_avg || 0), 0);
  const avgOccupancy = facilityDetails.length > 0 ? Math.round((facilityDetails.reduce((s: number, f: any) => s + (f.averages.bed_occupancy_rate || 0), 0) / facilityDetails.length) * 100) / 100 : 0;

  // Aggregate statistics
  const totalRecords = facilityDetails.reduce((sum: number, f: any) => sum + (f.statistics.total_records || 0), 0);
  const dateRangeDays = facilityDetails.length > 0 ? Math.max(...facilityDetails.map((f: any) => f.statistics.date_range_days || 0)) : 0;

  return {
    category_id: categoryInfo.category_id,
    category_code: categoryInfo.category_code,
    category_name_th: categoryInfo.category_name_th,
    category_name_en: categoryInfo.category_name_en,
    facility_sum: facilitySum,
    department_count: departmentCount,
    bed_occupancy_rate: avgOccupancy,
    bed_used_sum: Math.round(totalBedsUsed * 100) / 100,
    total_beds_sum: Math.round(totalBedsSum * 100) / 100,
    free_beds_sum: Math.round(totalFreeBeds * 100) / 100,
    statistics: {
      total_records: totalRecords,
      date_range_days: dateRangeDays,
      utilization_rate: totalBedsSum > 0 ?
        Math.round((totalBedsUsed / totalBedsSum) * 100 * 100) / 100 : 0
    }
  };
};

/// Get category dashboard data with fiscal year logic (similar to getHealthRegionDashboard)
export const getCategoryDashboard = async (filters: {
  fiscal_year?: number | string;
  category_id?: number | string;
  health_region_id?: number | string;
  start_date?: string;
  end_date?: string;
}) => {
  const {
    fiscal_year: rawFiscalYear,
    category_id: rawCategoryId,
    health_region_id: rawHealthRegionId,
    start_date: rawStartDate,
    end_date: rawEndDate
  } = filters;

  try {
    // Input validation and type conversion
    const fiscal_year = rawFiscalYear ?
      (typeof rawFiscalYear === 'string' ? parseInt(rawFiscalYear, 10) : rawFiscalYear) : undefined;
    const category_id = rawCategoryId ?
      (typeof rawCategoryId === 'string' ? parseInt(rawCategoryId, 10) : rawCategoryId) : undefined;
    const health_region_id = rawHealthRegionId ?
      (typeof rawHealthRegionId === 'string' ? parseInt(rawHealthRegionId, 10) : rawHealthRegionId) : undefined;

    // Validate inputs
    if (!rawStartDate && !rawEndDate && !fiscal_year) {
      throw new Error('Either fiscal_year or both start_date and end_date must be provided');
    }

    if (fiscal_year && (!Number.isInteger(fiscal_year) || fiscal_year < 2500 || fiscal_year > 2600)) {
      throw new Error(`Invalid fiscal_year: ${rawFiscalYear}. Must be a valid Buddhist year (2500-2600)`);
    }

    if (category_id && (!Number.isInteger(category_id) || category_id < 1)) {
      throw new Error(`Invalid category_id: ${rawCategoryId}. Must be a positive integer`);
    }

    if (health_region_id && (!Number.isInteger(health_region_id) || health_region_id < 1 || health_region_id > 13)) {
      throw new Error(`Invalid health_region_id: ${rawHealthRegionId}. Must be 1-13`);
    }

    // Date validation for custom date range
    if (rawStartDate && !rawEndDate) {
      throw new Error('end_date is required when start_date is provided');
    }
    if (rawEndDate && !rawStartDate) {
      throw new Error('start_date is required when end_date is provided');
    }

    let startDate: string;
    let endDate: string;

    if (rawStartDate && rawEndDate) {
      // Use custom date range
      const startDateObj = new Date(rawStartDate);
      const endDateObj = new Date(rawEndDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format');
      }

      if (startDateObj > endDateObj) {
        throw new Error('start_date must be earlier than or equal to end_date');
      }

      startDate = rawStartDate;
      endDate = rawEndDate;

      console.log(`Custom date range: ${startDate} to ${endDate}`);
    } else if (fiscal_year) {
      // Calculate fiscal year date range
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();

      // Convert fiscal year from Buddhist to Christian
      const fiscalChristianYear = fiscal_year - 543;
      const fiscalStartYear = fiscalChristianYear - 1;
      startDate = `${fiscalStartYear}-10-01`;

      const fiscalEndDate = new Date(`${fiscalChristianYear}-10-01`);
      if (currentDate < fiscalEndDate) {
        endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      } else {
        endDate = `${fiscalChristianYear}-09-30`;
      }

      console.log(`Fiscal Year ${fiscal_year} (${fiscalChristianYear}): ${startDate} to ${endDate}`);
    } else {
      throw new Error('Unable to determine date range from provided parameters');
    }

    let processedResults: any[] = [];

    if (category_id) {
      // Single category query (fast path)
      console.log(`⚡ Fast query for category ${category_id}`);
      const singleResult = await getSingleCategoryData(category_id, startDate, endDate, health_region_id);
      if (singleResult) {
        processedResults = [singleResult];
      }
    } else {
      // Fast overview for all categories using optimized single query (much faster)
      console.log(`⚡ Fast overview query for all categories (optimized for speed)`);

      let query = `
        SELECT 
          cm.id as category_id,
          cm.code as category_code,
          cm.name_th as category_name_th,
          cm.name_en as category_name_en,
          COUNT(DISTINCT facility_stats.facility_id) as facility_sum,
          COUNT(DISTINCT facility_stats.dept_id) as department_count,
          
          -- Fast aggregations using facility-level averages
          ROUND(
            CASE WHEN SUM(facility_stats.avg_total_beds) > 0 
              THEN (SUM(facility_stats.avg_bed_used) / SUM(facility_stats.avg_total_beds)) * 100
              ELSE NULL 
            END, 2
          ) as bed_occupancy_rate,
          ROUND(SUM(facility_stats.avg_bed_used), 2) as bed_used_sum,
          ROUND(SUM(facility_stats.avg_total_beds), 2) as total_beds_sum,
          ROUND(SUM(facility_stats.avg_free_beds), 2) as free_beds_sum,
          
          -- Statistics (handle null values properly)
          COALESCE(SUM(facility_stats.total_records), 0) as total_records,
          COALESCE(MAX(facility_stats.date_range_days), 0) as date_range_days
          
        FROM category_master cm
        JOIN (
          SELECT 
            f2.id as facility_id,
            d2.id as dept_id,
            dc2.category_id,
            AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END) as avg_bed_occupancy_rate,
            AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END) as avg_bed_used,
            AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END) as avg_total_beds,
            AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END) as avg_free_beds,
            COUNT(pr.id) as total_records,
            COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days
          FROM facilities f2
          JOIN departments d2 ON d2.facility_id = f2.id
          JOIN department_category dc2 ON dc2.department_id = d2.id AND dc2.is_active = 1
          LEFT JOIN productivity_records pr ON pr.department_id = d2.id 
            AND pr.shift_date BETWEEN ? AND ?
          ${health_region_id ? `
          WHERE f2.id IN (
            SELECT DISTINCT f3.id FROM facilities f3 
            JOIN health_region_provinces hrp ON CAST(f3.province_code AS CHAR) = hrp.province_geocode 
            WHERE hrp.health_region_id = ?
          )` : ''}
          GROUP BY f2.id, d2.id, dc2.category_id
        ) facility_stats ON facility_stats.category_id = cm.id
      `;

      const replacements: any[] = [startDate, endDate];
      if (health_region_id) {
        replacements.push(health_region_id);
      }

      query += ` GROUP BY cm.id, cm.code, cm.name_th, cm.name_en ORDER BY cm.code`;

      const results = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT
      });

      processedResults = results.map((row: any) => ({
        category_id: row.category_id,
        category_code: row.category_code,
        category_name_th: row.category_name_th,
        category_name_en: row.category_name_en,
        facility_sum: parseInt(row.facility_sum) || 0,
        department_count: parseInt(row.department_count) || 0,
        bed_occupancy_rate: row.bed_occupancy_rate !== null ? parseFloat(row.bed_occupancy_rate) : null,
        bed_used_sum: parseFloat(row.bed_used_sum) || 0,
        total_beds_sum: parseFloat(row.total_beds_sum) || 0,
        free_beds_sum: parseFloat(row.free_beds_sum) || 0,
        statistics: {
          total_records: parseInt(row.total_records) || 0,
          date_range_days: parseInt(row.date_range_days) || 0,
          utilization_rate: row.total_beds_sum > 0 ?
            Math.round((parseFloat(row.bed_used_sum) / parseFloat(row.total_beds_sum)) * 100 * 100) / 100 : 0
        }
      }));
    }

    // Calculate overall summary if returning all categories
    let summary = null;
    if (!category_id && processedResults.length > 0) {
      // Query for unique facilities count across all categories (to prevent double counting)
      let uniqueFacilitiesQuery = `
        SELECT COUNT(DISTINCT f.id) as unique_facilities
        FROM facilities f
        JOIN departments d ON d.facility_id = f.id
        JOIN department_category dc ON dc.department_id = d.id AND dc.is_active = 1
        LEFT JOIN productivity_records pr ON pr.department_id = d.id 
          AND pr.shift_date BETWEEN ? AND ?
        WHERE d.id IS NOT NULL -- All facilities with departments
      `;

      const uniqueReplacements: any[] = [startDate, endDate];
      if (health_region_id) {
        uniqueFacilitiesQuery += `
          AND f.id IN (
            SELECT DISTINCT f2.id FROM facilities f2
            JOIN health_region_provinces hrp ON CAST(f2.province_code AS CHAR) = hrp.province_geocode
            WHERE hrp.health_region_id = ?
          )
        `;
        uniqueReplacements.push(health_region_id);
      }

      const uniqueResult: any[] = await sequelize.query(uniqueFacilitiesQuery, {
        replacements: uniqueReplacements,
        type: QueryTypes.SELECT
      });
      const totalUniqueFacilities = uniqueResult && uniqueResult[0] ?
        parseInt(uniqueResult[0].unique_facilities) || 0 : 0;

      const totalBedsUsed = processedResults.reduce((sum: number, category: any) => sum + category.bed_used_sum, 0);
      const totalBeds = processedResults.reduce((sum: number, category: any) => sum + category.total_beds_sum, 0);
      const totalFreeBedsSum = processedResults.reduce((sum: number, category: any) => sum + category.free_beds_sum, 0);

      const avgOccupancyRate = totalBeds > 0 ?
        Math.round((totalBedsUsed / totalBeds) * 100 * 100) / 100 : null;

      summary = {
        total_categories: processedResults.length,
        total_facilities: totalUniqueFacilities, // Use unique count instead of sum
        overall_avg_bed_occupancy_rate: avgOccupancyRate,
        total_bed_used_sum: Math.round(totalBedsUsed * 100) / 100,
        total_beds_sum: Math.round(totalBeds * 100) / 100,
        total_free_beds_sum: Math.round(totalFreeBedsSum * 100) / 100,
        overall_utilization_rate: totalBeds > 0 ?
          Math.round((totalBedsUsed / totalBeds) * 100 * 100) / 100 : 0
      };
    }

    // Calculate summary for response
    const isYearToDate = rawStartDate && rawEndDate ?
      false : // Custom date range is not year-to-date
      fiscal_year ?
        new Date() < new Date(`${fiscal_year - 543}-10-01`) : // Fiscal year logic
        false;

    return {
      success: true,
      message: category_id ?
        `Category ${category_id} dashboard data retrieved successfully` :
        'All categories dashboard data retrieved successfully',
      data: {
        fiscal_year: fiscal_year || null,
        custom_date_range: rawStartDate && rawEndDate ? { start_date: startDate, end_date: endDate } : null,
        date_range: {
          start_date: startDate,
          end_date: endDate,
          is_year_to_date: isYearToDate
        },
        category_id: category_id || null,
        health_region_id: health_region_id || null,
        categories: processedResults,
        summary
      }
    };

  } catch (error) {
    console.error('Error getting category dashboard:', error);
    throw error;
  }
};

/// Get provinces dashboard by category - shows provinces for a specific category
export const getProvinceDashboardByCategory = async (filters: {
  category_id: number | string;
  fiscal_year?: number | string;
  health_region_id?: number | string;
  start_date?: string;
  end_date?: string;
}) => {
  const {
    category_id: rawCategoryId,
    fiscal_year: rawFiscalYear,
    health_region_id: rawHealthRegionId,
    start_date: rawStartDate,
    end_date: rawEndDate
  } = filters;

  try {
    // Input validation and type conversion
    const category_id = rawCategoryId ?
      (typeof rawCategoryId === 'string' ? parseInt(rawCategoryId, 10) : rawCategoryId) : undefined;
    const fiscal_year = rawFiscalYear ?
      (typeof rawFiscalYear === 'string' ? parseInt(rawFiscalYear, 10) : rawFiscalYear) : undefined;
    const health_region_id = rawHealthRegionId ?
      (typeof rawHealthRegionId === 'string' ? parseInt(rawHealthRegionId, 10) : rawHealthRegionId) : undefined;

    // Validate required category_id
    if (!category_id || !Number.isInteger(category_id) || category_id < 1) {
      throw new Error(`Invalid category_id: ${rawCategoryId}. Must be a positive integer`);
    }

    // Validate inputs
    if (!rawStartDate && !rawEndDate && !fiscal_year) {
      throw new Error('Either fiscal_year or both start_date and end_date must be provided');
    }

    if (fiscal_year && (!Number.isInteger(fiscal_year) || fiscal_year < 2500 || fiscal_year > 2600)) {
      throw new Error(`Invalid fiscal_year: ${rawFiscalYear}. Must be a valid Buddhist year (2500-2600)`);
    }

    if (health_region_id && (!Number.isInteger(health_region_id) || health_region_id < 1 || health_region_id > 13)) {
      throw new Error(`Invalid health_region_id: ${rawHealthRegionId}. Must be 1-13`);
    }

    // Date validation for custom date range
    if (rawStartDate && !rawEndDate) {
      throw new Error('end_date is required when start_date is provided');
    }
    if (rawEndDate && !rawStartDate) {
      throw new Error('start_date is required when end_date is provided');
    }

    let startDate: string;
    let endDate: string;

    if (rawStartDate && rawEndDate) {
      // Use custom date range
      const startDateObj = new Date(rawStartDate);
      const endDateObj = new Date(rawEndDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format');
      }

      if (startDateObj > endDateObj) {
        throw new Error('start_date must be earlier than or equal to end_date');
      }

      startDate = rawStartDate;
      endDate = rawEndDate;

      console.log(`Custom date range: ${startDate} to ${endDate}`);
    } else if (fiscal_year) {
      // Calculate fiscal year date range
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();

      // Convert fiscal year from Buddhist to Christian
      const fiscalChristianYear = fiscal_year - 543;
      const fiscalStartYear = fiscalChristianYear - 1;
      startDate = `${fiscalStartYear}-10-01`;

      const fiscalEndDate = new Date(`${fiscalChristianYear}-10-01`);
      if (currentDate < fiscalEndDate) {
        endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      } else {
        endDate = `${fiscalChristianYear}-09-30`;
      }

      console.log(`Fiscal Year ${fiscal_year} (${fiscalChristianYear}): ${startDate} to ${endDate}`);
    } else {
      throw new Error('Unable to determine date range from provided parameters');
    }

    // Query to get provinces for a specific category using facility-level aggregation
    let query = `
      SELECT 
        p.province_code,
        p.province_name_th,
        p.province_name_en,
        hr.id as health_region_id,
        hr.region_name_th,
        hr.region_name_en,
        COUNT(DISTINCT f.id) as facility_sum,
        COUNT(DISTINCT d.id) as department_count,
        
        -- Province-level aggregations computed from facility averages
        ROUND(AVG(facility_stats.avg_bed_occupancy_rate), 2) as bed_occupancy_rate,
        ROUND(SUM(facility_stats.avg_bed_used), 2) as bed_used_sum,
        ROUND(SUM(facility_stats.avg_total_beds), 2) as total_beds_sum,
        ROUND(SUM(facility_stats.avg_free_beds), 2) as free_beds_sum,
        ROUND(AVG(facility_stats.avg_productivity_score), 0) as productivity_score_avg,
        
        -- Province statistics
        SUM(facility_stats.total_records) as total_records,
        MAX(facility_stats.date_range_days) as date_range_days
        
      FROM provinces p
      LEFT JOIN health_region_provinces hrp ON p.province_code = CAST(hrp.province_geocode AS UNSIGNED)
      LEFT JOIN health_regions hr ON hr.id = hrp.health_region_id
      LEFT JOIN facilities f ON CAST(f.province_code AS CHAR) = hrp.province_geocode
      LEFT JOIN departments d ON d.facility_id = f.id
      LEFT JOIN department_category dc ON dc.department_id = d.id AND dc.is_active = 1
      LEFT JOIN (
        SELECT 
          f2.id as facility_id,
          f2.province_code as facility_province,
          AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END) as avg_bed_occupancy_rate,
          AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END) as avg_bed_used,
          AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END) as avg_total_beds,
          AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END) as avg_free_beds,
          AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END) as avg_productivity_score,
          COUNT(pr.id) as total_records,
          COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days
        FROM facilities f2
        JOIN departments d2 ON d2.facility_id = f2.id
        JOIN department_category dc2 ON dc2.department_id = d2.id AND dc2.is_active = 1
        LEFT JOIN productivity_records pr ON pr.department_id = d2.id 
          AND pr.shift_date BETWEEN ? AND ?
        WHERE dc2.category_id = ?
        GROUP BY f2.id, f2.province_code
      ) facility_stats ON facility_stats.facility_id = f.id AND CAST(facility_stats.facility_province AS CHAR) = hrp.province_geocode
      WHERE dc.category_id = ?
    `;

    const replacements: any[] = [startDate, endDate, category_id, category_id];

    if (health_region_id) {
      query += ` AND hr.id = ?`;
      replacements.push(health_region_id);
    }

    query += ` 
      GROUP BY p.province_code, p.province_name_th, p.province_name_en, hr.id, hr.region_name_th, hr.region_name_en
      HAVING COUNT(DISTINCT f.id) > 0
      ORDER BY p.province_code
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    const processedResults = results.map((row: any) => ({
      province_code: parseInt(row.province_code) || 0,
      province_name_th: row.province_name_th || '',
      province_name_en: row.province_name_en || '',
      health_region: {
        health_region_id: row.health_region_id || null,
        region_name_th: row.region_name_th || '',
        region_name_en: row.region_name_en || ''
      },
      facility_sum: parseInt(row.facility_sum) || 0,
      averages: {
        bed_occupancy_rate: parseFloat(row.bed_occupancy_rate) || 0,
        bed_used_sum: parseFloat(row.bed_used_sum) || 0,
        total_beds_sum: parseFloat(row.total_beds_sum) || 0,
        free_beds_sum: parseFloat(row.free_beds_sum) || 0,
        productivity_score_avg: parseInt(row.productivity_score_avg) || 0
      },
      statistics: {
        total_records: parseInt(row.total_records) || 0,
        department_count: parseInt(row.department_count) || 0,
        date_range_days: parseInt(row.date_range_days) || 0,
        utilization_rate: row.total_beds_sum > 0 ?
          Math.round((parseFloat(row.bed_used_sum) / parseFloat(row.total_beds_sum)) * 100 * 100) / 100 : 0
      }
    }));

    // Calculate overall summary
    let summary = null;
    if (processedResults.length > 0) {
      const totalFacilities = processedResults.reduce((sum: number, province: any) => sum + province.facility_sum, 0);
      const totalDepartments = processedResults.reduce((sum: number, province: any) => sum + province.statistics.department_count, 0);
      const avgOccupancyRate = processedResults.length > 0 ?
        Math.round((processedResults.reduce((sum: number, province: any) => sum + province.averages.bed_occupancy_rate, 0) / processedResults.length) * 100) / 100 : 0;
      const totalBedsUsed = processedResults.reduce((sum: number, province: any) => sum + province.averages.bed_used_sum, 0);
      const totalBeds = processedResults.reduce((sum: number, province: any) => sum + province.averages.total_beds_sum, 0);
      const totalFreeBedsSum = processedResults.reduce((sum: number, province: any) => sum + province.averages.free_beds_sum, 0);
      const avgProductivityScore = processedResults.length > 0 ?
        Math.round(processedResults.reduce((sum: number, province: any) => sum + province.averages.productivity_score_avg, 0) / processedResults.length) : 0;

      summary = {
        total_provinces: processedResults.length,
        total_facilities: totalFacilities,
        total_departments: totalDepartments,
        overall_averages: {
          bed_occupancy_rate: avgOccupancyRate,
          bed_used_sum: Math.round(totalBedsUsed * 100) / 100,
          total_beds_sum: Math.round(totalBeds * 100) / 100,
          free_beds_sum: Math.round(totalFreeBedsSum * 100) / 100,
          productivity_score_avg: avgProductivityScore
        },
        overall_utilization_rate: totalBeds > 0 ?
          Math.round((totalBedsUsed / totalBeds) * 100 * 100) / 100 : 0
      };
    }

    // Calculate summary for response
    const isYearToDate = rawStartDate && rawEndDate ?
      false : // Custom date range is not year-to-date
      fiscal_year ?
        new Date() < new Date(`${fiscal_year - 543}-10-01`) : // Fiscal year logic
        false;

    return {
      success: true,
      message: `Provinces for category ${category_id} retrieved successfully`,
      data: {
        category_id,
        fiscal_year: fiscal_year || null,
        custom_date_range: rawStartDate && rawEndDate ? { start_date: startDate, end_date: endDate } : null,
        date_range: {
          start_date: startDate,
          end_date: endDate,
          is_year_to_date: isYearToDate
        },
        health_region_id: health_region_id || null,
        provinces: processedResults,
        summary
      }
    };

  } catch (error) {
    console.error('Error getting province dashboard by category:', error);
    throw error;
  }
};

/// Get facilities dashboard by province and category - shows facilities for a specific province and category
export const getFacilityDashboardGroupCategoryByProvince = async (filters: {
  province_code: string;
  category_id: number | string;
  fiscal_year?: number | string;
  health_region_id?: number | string;
  start_date?: string;
  end_date?: string;
}) => {
  const {
    province_code,
    category_id: rawCategoryId,
    fiscal_year: rawFiscalYear,
    health_region_id: rawHealthRegionId,
    start_date: rawStartDate,
    end_date: rawEndDate
  } = filters;

  try {
    // Input validation and type conversion
    const category_id = rawCategoryId ?
      (typeof rawCategoryId === 'string' ? parseInt(rawCategoryId, 10) : rawCategoryId) : undefined;
    const fiscal_year = rawFiscalYear ?
      (typeof rawFiscalYear === 'string' ? parseInt(rawFiscalYear, 10) : rawFiscalYear) : undefined;
    const health_region_id = rawHealthRegionId ?
      (typeof rawHealthRegionId === 'string' ? parseInt(rawHealthRegionId, 10) : rawHealthRegionId) : undefined;

    // Validate required parameters
    if (!province_code) {
      throw new Error('province_code is required');
    }
    if (!category_id || !Number.isInteger(category_id) || category_id < 1) {
      throw new Error(`Invalid category_id: ${rawCategoryId}. Must be a positive integer`);
    }

    // Validate inputs
    if (!rawStartDate && !rawEndDate && !fiscal_year) {
      throw new Error('Either fiscal_year or both start_date and end_date must be provided');
    }

    if (fiscal_year && (!Number.isInteger(fiscal_year) || fiscal_year < 2500 || fiscal_year > 2600)) {
      throw new Error(`Invalid fiscal_year: ${rawFiscalYear}. Must be a valid Buddhist year (2500-2600)`);
    }

    if (health_region_id && (!Number.isInteger(health_region_id) || health_region_id < 1 || health_region_id > 13)) {
      throw new Error(`Invalid health_region_id: ${rawHealthRegionId}. Must be 1-13`);
    }

    // Date validation for custom date range
    if (rawStartDate && !rawEndDate) {
      throw new Error('end_date is required when start_date is provided');
    }
    if (rawEndDate && !rawStartDate) {
      throw new Error('start_date is required when end_date is provided');
    }

    let startDate: string;
    let endDate: string;

    if (rawStartDate && rawEndDate) {
      // Use custom date range
      const startDateObj = new Date(rawStartDate);
      const endDateObj = new Date(rawEndDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format');
      }

      if (startDateObj > endDateObj) {
        throw new Error('start_date must be earlier than or equal to end_date');
      }

      startDate = rawStartDate;
      endDate = rawEndDate;

      console.log(`Custom date range: ${startDate} to ${endDate}`);
    } else if (fiscal_year) {
      // Calculate fiscal year date range
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();

      // Convert fiscal year from Buddhist to Christian
      const fiscalChristianYear = fiscal_year - 543;
      const fiscalStartYear = fiscalChristianYear - 1;
      startDate = `${fiscalStartYear}-10-01`;

      const fiscalEndDate = new Date(`${fiscalChristianYear}-10-01`);
      if (currentDate < fiscalEndDate) {
        endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      } else {
        endDate = `${fiscalChristianYear}-09-30`;
      }

      console.log(`Fiscal Year ${fiscal_year} (${fiscalChristianYear}): ${startDate} to ${endDate}`);
    } else {
      throw new Error('Unable to determine date range from provided parameters');
    }

    // Query to get facilities for a specific province and category
    let query = `
      SELECT 
        f.id as facility_id,
        f.name as facility_name,
        f.province_code,
        p.province_name_th,
        p.province_name_en,
        hr.id as health_region_id,
        hr.region_name_th,
        hr.region_name_en,
        cm.id as category_id,
        cm.code as category_code,
        cm.name_th as category_name_th,
        cm.name_en as category_name_en,
        COUNT(DISTINCT d.id) as department_count,
        
        -- Facility-level aggregations for the category
        ROUND(AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END), 2) as bed_occupancy_rate,
        ROUND(AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END), 2) as bed_used_avg,
        ROUND(AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END), 2) as total_beds_avg,
        ROUND(AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END), 2) as free_beds_avg,
        ROUND(AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END), 2) as productivity_score_avg,
        
        -- Sum totals for facility
        SUM(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated ELSE 0 END) as total_patients_sum,
        SUM(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds ELSE 0 END) as total_beds_sum,
        SUM(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated ELSE 0 END) as free_beds_sum,
        SUM(CASE WHEN pr.admitted_patients IS NOT NULL THEN pr.admitted_patients ELSE 0 END) as total_admissions,
        SUM(CASE WHEN pr.discharged_patients IS NOT NULL THEN pr.discharged_patients ELSE 0 END) as total_discharges,
        
        -- Facility statistics
        COUNT(pr.id) as total_records,
        COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days,
        MIN(pr.shift_date) as first_record_date,
        MAX(pr.shift_date) as last_record_date
        
      FROM facilities f
      LEFT JOIN provinces p ON CAST(f.province_code AS CHAR) = CAST(p.province_code AS CHAR)
      LEFT JOIN health_region_provinces hrp ON p.province_code = CAST(hrp.province_geocode AS UNSIGNED)
      LEFT JOIN health_regions hr ON hr.id = hrp.health_region_id
      LEFT JOIN departments d ON d.facility_id = f.id
      LEFT JOIN department_category dc ON dc.department_id = d.id AND dc.is_active = 1
      LEFT JOIN category_master cm ON cm.id = dc.category_id
      LEFT JOIN productivity_records pr ON pr.department_id = d.id 
        AND pr.shift_date BETWEEN ? AND ?
      WHERE CAST(f.province_code AS CHAR) = ? 
        AND dc.category_id = ?
    `;

    const replacements: any[] = [startDate, endDate, province_code, category_id];

    if (health_region_id) {
      query += ` AND hr.id = ?`;
      replacements.push(health_region_id);
    }

    query += ` 
      GROUP BY f.id, f.name, f.province_code, p.province_name_th, p.province_name_en, 
               hr.id, hr.region_name_th, hr.region_name_en,
               cm.id, cm.code, cm.name_th, cm.name_en
      HAVING COUNT(DISTINCT d.id) > 0
      ORDER BY f.name
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });

    const processedResults = results.map((row: any) => {
      const totalBedsSum = parseFloat(row.total_beds_sum) || 0;
      const totalPatientsSum = parseFloat(row.total_patients_sum) || 0;

      return {
        facility_id: row.facility_id,
        facility_name: row.facility_name,
        province_info: {
          province_code: row.province_code,
          province_name_th: row.province_name_th,
          province_name_en: row.province_name_en
        },
        health_region: {
          health_region_id: row.health_region_id || null,
          region_name_th: row.region_name_th || '',
          region_name_en: row.region_name_en || ''
        },
        category_info: {
          category_id: row.category_id,
          category_code: row.category_code,
          category_name_th: row.category_name_th,
          category_name_en: row.category_name_en
        },
        department_count: parseInt(row.department_count) || 0,
        averages: {
          bed_occupancy_rate: parseFloat(row.bed_occupancy_rate) || 0,
          bed_used_avg: parseFloat(row.bed_used_avg) || 0,
          total_beds_avg: parseFloat(row.total_beds_avg) || 0,
          free_beds_avg: parseFloat(row.free_beds_avg) || 0,
          productivity_score_avg: parseFloat(row.productivity_score_avg) || 0
        },
        totals: {
          total_patients_sum: totalPatientsSum,
          total_beds_sum: totalBedsSum,
          free_beds_sum: parseFloat(row.free_beds_sum) || 0,
          total_admissions: parseInt(row.total_admissions) || 0,
          total_discharges: parseInt(row.total_discharges) || 0
        },
        statistics: {
          total_records: parseInt(row.total_records) || 0,
          date_range_days: parseInt(row.date_range_days) || 0,
          first_record_date: row.first_record_date,
          last_record_date: row.last_record_date,
          utilization_rate: totalBedsSum > 0 ?
            Math.round((totalPatientsSum / totalBedsSum) * 100 * 100) / 100 : 0,
          avg_patients_per_day: row.date_range_days > 0 ?
            Math.round((totalPatientsSum) / parseInt(row.date_range_days) * 100) / 100 : 0
        }
      };
    });

    // Calculate overall summary
    let summary = null;
    if (processedResults.length > 0) {
      const totalFacilities = processedResults.length;
      const totalDepartments = processedResults.reduce((sum: number, facility: any) => sum + facility.department_count, 0);
      const avgOccupancyRate = processedResults.length > 0 ?
        Math.round((processedResults.reduce((sum: number, facility: any) => sum + facility.averages.bed_occupancy_rate, 0) / processedResults.length) * 100) / 100 : 0;
      const totalBedsUsed = processedResults.reduce((sum: number, facility: any) => sum + facility.totals.total_patients_sum, 0);
      const totalBeds = processedResults.reduce((sum: number, facility: any) => sum + facility.totals.total_beds_sum, 0);
      const totalFreeBedsSum = processedResults.reduce((sum: number, facility: any) => sum + facility.totals.free_beds_sum, 0);
      const totalAdmissions = processedResults.reduce((sum: number, facility: any) => sum + facility.totals.total_admissions, 0);
      const totalDischarges = processedResults.reduce((sum: number, facility: any) => sum + facility.totals.total_discharges, 0);
      const avgProductivityScore = processedResults.length > 0 ?
        Math.round(processedResults.reduce((sum: number, facility: any) => sum + facility.averages.productivity_score_avg, 0) / processedResults.length * 100) / 100 : 0;

      summary = {
        total_facilities: totalFacilities,
        total_departments: totalDepartments,
        overall_averages: {
          bed_occupancy_rate: avgOccupancyRate,
          bed_used_avg: Math.round((totalBedsUsed / totalFacilities) * 100) / 100,
          total_beds_avg: Math.round((totalBeds / totalFacilities) * 100) / 100,
          free_beds_avg: Math.round((totalFreeBedsSum / totalFacilities) * 100) / 100,
          productivity_score_avg: avgProductivityScore
        },
        overall_totals: {
          total_patients_sum: Math.round(totalBedsUsed * 100) / 100,
          total_beds_sum: Math.round(totalBeds * 100) / 100,
          free_beds_sum: Math.round(totalFreeBedsSum * 100) / 100,
          total_admissions: totalAdmissions,
          total_discharges: totalDischarges
        },
        overall_utilization_rate: totalBeds > 0 ?
          Math.round((totalBedsUsed / totalBeds) * 100 * 100) / 100 : 0
      };
    }

    // Calculate summary for response
    const isYearToDate = rawStartDate && rawEndDate ?
      false : // Custom date range is not year-to-date
      fiscal_year ?
        new Date() < new Date(`${fiscal_year - 543}-10-01`) : // Fiscal year logic
        false;

    return {
      success: true,
      message: `Facilities for province ${province_code} and category ${category_id} retrieved successfully`,
      data: {
        province_code,
        category_id,
        fiscal_year: fiscal_year || null,
        custom_date_range: rawStartDate && rawEndDate ? { start_date: startDate, end_date: endDate } : null,
        date_range: {
          start_date: startDate,
          end_date: endDate,
          is_year_to_date: isYearToDate
        },
        health_region_id: health_region_id || null,
        facilities: processedResults,
        summary
      }
    };

  } catch (error) {
    console.error('Error getting facility dashboard by province and category:', error);
    throw error;
  }
};

// Helper function to get department-level data for facility categories
const getDepartmentDataForFacilityCategories = async (
  facility_id: number,
  startDate: string,
  endDate: string,
  health_region_id?: number,
  category_id?: number
) => {
  let deptQueryBase = `
    SELECT
      IFNULL(cm.id, 0) as category_id,
      cm.code as category_code,
      d.id as department_id,
      d.name as department_name,
      ROUND(AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END),2) as bed_occupancy_rate,
      ROUND(AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END),2) as bed_used_avg,
      ROUND(AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END),2) as total_beds_avg,
      ROUND(AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END),2) as free_beds_avg,
      ROUND(AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END),2) as productivity_score_avg,
      COUNT(pr.id) as total_records,
      COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days
    FROM departments d
    LEFT JOIN facilities f ON d.facility_id = f.id
    LEFT JOIN department_category dc ON dc.department_id = d.id AND dc.is_active = 1
    LEFT JOIN category_master cm ON cm.id = dc.category_id
    LEFT JOIN productivity_records pr ON pr.department_id = d.id AND pr.shift_date BETWEEN ? AND ?
    WHERE d.facility_id = ?
  `;

  let deptReplacements: any[] = [startDate, endDate, facility_id];
  let deptQuery = deptQueryBase;

  // Use consistent query structure with main query when category_id is provided
  if (category_id) {
    deptQuery = `
      SELECT
        cm.id as category_id,
        cm.code as category_code,
        d.id as department_id,
        d.name as department_name,
        ROUND(AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END),2) as bed_occupancy_rate,
        ROUND(AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END),2) as bed_used_avg,
        ROUND(AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END),2) as total_beds_avg,
        ROUND(AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END),2) as free_beds_avg,
        ROUND(AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END),2) as productivity_score_avg,
        COUNT(pr.id) as total_records,
        COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days
      FROM departments d
      INNER JOIN facilities f ON d.facility_id = f.id
      INNER JOIN department_category dc ON dc.department_id = d.id AND dc.is_active = 1 AND dc.category_id = ?
      INNER JOIN category_master cm ON cm.id = dc.category_id
      LEFT JOIN productivity_records pr ON pr.department_id = d.id AND pr.shift_date BETWEEN ? AND ?
      WHERE d.facility_id = ?
    `;

    deptReplacements = [category_id, startDate, endDate, facility_id];
  }

  if (health_region_id) {
    deptQuery += ` AND f.id IN (
      SELECT DISTINCT f2.id FROM facilities f2 
      JOIN health_region_provinces hrp ON CAST(f2.province_code AS CHAR) = hrp.province_geocode 
      WHERE hrp.health_region_id = ?
    )`;
    deptReplacements.push(health_region_id);
  }

  deptQuery += ` GROUP BY d.id, d.name, IFNULL(cm.id,0), cm.code ORDER BY IFNULL(cm.code, 'ZZZ'), d.name`;

  const deptRows: any[] = await sequelize.query(deptQuery, {
    replacements: deptReplacements,
    type: QueryTypes.SELECT
  });

  // Group departments by category
  const departmentsByCategory: Record<number, any[]> = {};

  for (const row of deptRows) {
    const categoryId = parseInt(row.category_id) || 0;
    if (!departmentsByCategory[categoryId]) {
      departmentsByCategory[categoryId] = [];
    }

    departmentsByCategory[categoryId].push({
      department_id: parseInt(row.department_id) || 0,
      department_name: row.department_name || '',
      averages: {
        bed_occupancy_rate: parseFloat(row.bed_occupancy_rate) || 0,
        bed_used_avg: parseFloat(row.bed_used_avg) || 0,
        total_beds_avg: parseFloat(row.total_beds_avg) || 0,
        free_beds_avg: parseFloat(row.free_beds_avg) || 0,
        productivity_score_avg: parseFloat(row.productivity_score_avg) || 0
      },
      statistics: {
        total_records: parseInt(row.total_records) || 0,
        date_range_days: parseInt(row.date_range_days) || 0,
        utilization_rate: row.total_beds_avg > 0 ?
          Math.round((parseFloat(row.bed_used_avg) / parseFloat(row.total_beds_avg)) * 100 * 100) / 100 : 0
      }
    });
  }

  return departmentsByCategory;
};

// Facility category-level breakdown
// Groups department productivity by category for a specific facility
export const getFacilityCategoryBreakdown = async (filters: {
  facility_id: number;
  category_id?: number | string;
  fiscal_year?: number | string;
  health_region_id?: number | string;
  start_date?: string;
  end_date?: string;
}) => {
  const { facility_id, category_id: rawCategoryId, fiscal_year: rawFiscalYear, health_region_id: rawHealthRegionId, start_date: rawStartDate, end_date: rawEndDate } = filters as any;

  // Input validation and type conversion
  const category_id = rawCategoryId ?
    (typeof rawCategoryId === 'string' ? parseInt(rawCategoryId, 10) : rawCategoryId) : undefined;
  const fiscal_year = rawFiscalYear ?
    (typeof rawFiscalYear === 'string' ? parseInt(rawFiscalYear, 10) : rawFiscalYear) : undefined;
  const health_region_id = rawHealthRegionId ?
    (typeof rawHealthRegionId === 'string' ? parseInt(rawHealthRegionId, 10) : rawHealthRegionId) : undefined;

  // Validation
  if (!fiscal_year && !(rawStartDate && rawEndDate)) {
    throw new Error('fiscal_year is required unless both start_date and end_date are provided');
  }
  if ((rawStartDate && !rawEndDate) || (rawEndDate && !rawStartDate)) {
    throw new Error('Both start_date and end_date are required when one is provided');
  }
  if (category_id && (!Number.isInteger(category_id) || category_id < 1)) {
    throw new Error(`Invalid category_id: ${rawCategoryId}. Must be a positive integer`);
  }

  // Calculate date range
  let startDate: string;
  let endDate: string;

  if (rawStartDate && rawEndDate) {
    // Use custom date range
    const s = new Date(rawStartDate);
    const e = new Date(rawEndDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      throw new Error('Invalid date format');
    }
    if (s > e) {
      throw new Error('start_date must be earlier than or equal to end_date');
    }
    startDate = rawStartDate;
    endDate = rawEndDate;
  } else if (fiscal_year) {
    // Calculate fiscal year range (Buddhist to Christian calendar)
    const fiscalChristianYear = fiscal_year - 543;
    const fiscalStartYear = fiscalChristianYear - 1;
    startDate = `${fiscalStartYear}-10-01`;

    const currentDate = new Date();
    const fiscalEndDate = new Date(`${fiscalChristianYear}-10-01`);

    if (currentDate < fiscalEndDate) {
      // Current date is before fiscal year end, use current date
      const cy = currentDate.getFullYear();
      const cm = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const cd = currentDate.getDate().toString().padStart(2, '0');
      endDate = `${cy}-${cm}-${cd}`;
    } else {
      // Use fiscal year end date
      endDate = `${fiscalChristianYear}-09-30`;
    }
  } else {
    throw new Error('Unable to determine date range');
  }

  // Build main query for facility category breakdown
  let query = `
    SELECT
      IFNULL(cm.id, 0) as category_id,
      cm.code as category_code,
      cm.name_th as category_name_th,
      cm.name_en as category_name_en,
      COUNT(DISTINCT d.id) as department_count,
      COUNT(DISTINCT CASE WHEN pr.id IS NOT NULL THEN d.id END) as department_with_records,
      -- Facility-level aggregations
      ROUND(AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END),2) as bed_occupancy_rate,
      ROUND(AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END),2) as bed_used_avg,
      ROUND(AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END),2) as total_beds_avg,
      ROUND(AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END),2) as free_beds_avg,
      ROUND(AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END),2) as productivity_score_avg,
      COUNT(pr.id) as total_records,
      COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days
    FROM facilities f
    LEFT JOIN departments d ON d.facility_id = f.id
    LEFT JOIN department_category dc ON dc.department_id = d.id AND dc.is_active = 1
    LEFT JOIN category_master cm ON cm.id = dc.category_id
    LEFT JOIN productivity_records pr ON pr.department_id = d.id AND pr.shift_date BETWEEN ? AND ?
    WHERE f.id = ?
  `;

  const replacements: any[] = [startDate, endDate, facility_id];

  // Add health region filter if provided
  if (health_region_id) {
    query += ` AND f.id IN (
      SELECT DISTINCT f2.id FROM facilities f2 
      JOIN health_region_provinces hrp ON CAST(f2.province_code AS CHAR) = hrp.province_geocode 
      WHERE hrp.health_region_id = ?
    )`;
    replacements.push(health_region_id);
  }

  // Handle category filtering with different query structure
  if (category_id) {
    // When filtering by specific category, use INNER JOINs for better performance
    query = `
      SELECT
        cm.id as category_id,
        cm.code as category_code,
        cm.name_th as category_name_th,
        cm.name_en as category_name_en,
        COUNT(DISTINCT d.id) as department_count,
        COUNT(DISTINCT CASE WHEN pr.id IS NOT NULL THEN d.id END) as department_with_records,
        -- Facility-level aggregations
        ROUND(AVG(CASE WHEN pr.bed_occupancy_rate IS NOT NULL AND pr.bed_occupancy_rate >= 0 AND pr.bed_occupancy_rate <= 200 THEN pr.bed_occupancy_rate END),2) as bed_occupancy_rate,
        ROUND(AVG(CASE WHEN pr.total_patients_calculated IS NOT NULL AND pr.total_patients_calculated >= 0 THEN pr.total_patients_calculated END),2) as bed_used_avg,
        ROUND(AVG(CASE WHEN pr.total_beds IS NOT NULL AND pr.total_beds > 0 THEN pr.total_beds END),2) as total_beds_avg,
        ROUND(AVG(CASE WHEN pr.free_beds_calculated IS NOT NULL AND pr.free_beds_calculated >= 0 THEN pr.free_beds_calculated END),2) as free_beds_avg,
        ROUND(AVG(CASE WHEN pr.productivity_score IS NOT NULL AND pr.productivity_score >= 0 THEN pr.productivity_score END),2) as productivity_score_avg,
        COUNT(pr.id) as total_records,
        COUNT(DISTINCT DATE(pr.shift_date)) as date_range_days
      FROM facilities f
      INNER JOIN departments d ON d.facility_id = f.id
      INNER JOIN department_category dc ON dc.department_id = d.id AND dc.is_active = 1 AND dc.category_id = ?
      INNER JOIN category_master cm ON cm.id = dc.category_id
      LEFT JOIN productivity_records pr ON pr.department_id = d.id AND pr.shift_date BETWEEN ? AND ?
      WHERE f.id = ?
    `;

    // Reset replacements for specific category query
    replacements.length = 0;
    replacements.push(category_id, startDate, endDate, facility_id);

    // Re-add health region filter if provided
    if (health_region_id) {
      query += ` AND f.id IN (
        SELECT DISTINCT f2.id FROM facilities f2 
        JOIN health_region_provinces hrp ON CAST(f2.province_code AS CHAR) = hrp.province_geocode 
        WHERE hrp.health_region_id = ?
      )`;
      replacements.push(health_region_id);
    }
  }

  const finalQuery = query + ` GROUP BY IFNULL(cm.id,0), cm.code, cm.name_th, cm.name_en ORDER BY cm.code`;

  const results = await sequelize.query(finalQuery, { replacements, type: QueryTypes.SELECT });

  const processedResults: any[] = results.map((row: any) => ({
    category_id: parseInt(row.category_id) || 0,
    category_code: row.category_code || null,
    category_name_th: row.category_name_th || (parseInt(row.category_id) === 0 ? 'Uncategorized' : null),
    category_name_en: row.category_name_en || (parseInt(row.category_id) === 0 ? 'Uncategorized' : null),
    department_count: parseInt(row.department_count) || 0,
    department_with_records: parseInt(row.department_with_records) || 0,
    averages: {
      bed_occupancy_rate: parseFloat(row.bed_occupancy_rate) || 0,
      bed_used_avg: parseFloat(row.bed_used_avg) || 0,
      total_beds_avg: parseFloat(row.total_beds_avg) || 0,
      free_beds_avg: parseFloat(row.free_beds_avg) || 0,
      productivity_score_avg: parseFloat(row.productivity_score_avg) || 0
    },
    statistics: {
      total_records: parseInt(row.total_records) || 0,
      date_range_days: parseInt(row.date_range_days) || 0
    }
  }));

  // Add per-department averages for each category
  try {
    const departmentsByCategory = await getDepartmentDataForFacilityCategories(
      facility_id,
      startDate,
      endDate,
      health_region_id,
      category_id
    );

    // Attach departments array to each category
    for (const category of processedResults) {
      category.departments = departmentsByCategory[category.category_id] || [];
    }
  } catch (deptErr) {
    console.error('Error fetching department-level data for facility categories:', deptErr);
    // Ensure all categories have departments array even if query fails
    for (const category of processedResults) {
      category.departments = [];
    }
  }

  return processedResults;
};

/**
 * Get daily productivity summary for a facility, grouped by department category.
 * This service aggregates data from all shifts for the given date.
 * @param filters - Contains facility_id and shift_date.
 */
export const getFacilityDashboardByCategory = async (filters: {
  facility_id: number;
  shift_date: string;
}) => {
  const { facility_id, shift_date } = filters;

  try {
    // ดึงข้อมูล Facility
    const facility = await FacilityModel.findByPk(facility_id, {
      attributes: ['id', 'name']
    });

    if (!facility) {
      return {
        success: false,
        error: 'FACILITY_NOT_FOUND',
        message: `Facility with id ${facility_id} not found.`
      };
    }

    // ดึงข้อมูลแผนกทั้งหมดใน Facility พร้อมข้อมูล Category
    const allDepartments = await DepartmentModel.findAll({
      where: { facility_id },
      attributes: ['id', 'name'],
      include: [
        {
          model: DepartMentCategoryModel,
          as: 'department_categories',
          required: false,
          attributes: ['category_id'],
          include: [{
            model: CategoryMasterModel,
            as: 'category',
            attributes: ['id', 'name_th']
          }]
        }
      ],
      order: [['name', 'ASC']]
    });

    if (allDepartments.length === 0) {
      return {
        success: true,
        data: {
          facility_info: { id: facility.id, name: facility.name },
          categories: []
        },
        message: 'No departments found for this facility.'
      };
    }

    // ดึงข้อมูลยอดเวรของ "ทุกกะ" ในวันที่กำหนด
    const departmentIds = allDepartments.map(d => d.id);
    const dailyRecords = await ProductivityRecordModel.findAll({
      where: {
        department_id: { [Op.in]: departmentIds },
        shift_date,
      }
    });

    // คำนวณข้อมูลสรุปรายวันสำหรับแต่ละแผนก
    const aggregatedRecordMap = new Map<number, any>();
    const recordsByDept = dailyRecords.reduce((acc, record) => {
      const deptId = record.department_id;
      if (!acc[deptId]) acc[deptId] = [];
      acc[deptId].push(record);
      return acc;
    }, {} as Record<number, ProductivityRecordModel[]>);

    for (const deptIdStr in recordsByDept) {
      const deptId = parseInt(deptIdStr);
      const records = recordsByDept[deptId];

      if (records.length > 0) {
        const summary = records.reduce((acc, rec) => {
          const productivityScore = parseFloat(rec.productivity_score as any || '0');
          const totalPatients = rec.total_patients_calculated || 0;

          acc.sum_of_weighted_scores += productivityScore * totalPatients;
          acc.total_patients_calculated += totalPatients;

          const latestDate = acc.latest_record?.updated_at;
          const currentDate = rec.updated_at;

          if (!latestDate || (currentDate && new Date(currentDate) > new Date(latestDate))) {
            acc.latest_record = rec;
          }

          return acc;
        }, {
          sum_of_weighted_scores: 0,
          total_patients_calculated: 0,
          latest_record: null as ProductivityRecordModel | null,
        });

        const total_patients_sum = summary.total_patients_calculated;
        const total_beds_latest = summary.latest_record?.total_beds ?? 0;

        const weighted_avg_productivity = total_patients_sum > 0
          ? summary.sum_of_weighted_scores / total_patients_sum
          : 0;

        const daily_free_beds = total_beds_latest - total_patients_sum;
        const daily_bed_occupancy_rate = total_beds_latest > 0
          ? (total_patients_sum / total_beds_latest) * 100
          : 0;

        aggregatedRecordMap.set(deptId, {
          productivity_score: weighted_avg_productivity.toFixed(1),
          total_patients: total_patients_sum,
          free_beds: Math.round(daily_free_beds),
          bed_occupancy_rate: daily_bed_occupancy_rate.toFixed(0),
          total_beds: total_beds_latest,
        });
      }
    }

    const categoriesMap = new Map<number, {
      category_id: number;
      category_name: string;
      departments: any[];
    }>();

    for (const dept of allDepartments) {
      const aggregatedRecord = aggregatedRecordMap.get(dept.id);

      const categoryInfo = (dept as any).department_categories?.[0]?.category;
      const categoryId = categoryInfo?.id ?? 0; // 0 = Uncategorized
      const categoryName = categoryInfo?.name_th ?? 'ไม่ระบุหมวดหมู่';

      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          category_id: categoryId,
          category_name: categoryName,
          departments: []
        });
      }

      const departmentData = {
        department_id: dept.id,
        department_name: dept.name,
        productivity_score: aggregatedRecord?.productivity_score ?? null,
        total_patients: aggregatedRecord?.total_patients ?? 0,
        free_beds: aggregatedRecord?.free_beds ?? null,
        bed_occupancy_rate: aggregatedRecord?.bed_occupancy_rate ?? null,
        total_beds: aggregatedRecord?.total_beds ?? null,
      };

      categoriesMap.get(categoryId)?.departments.push(departmentData);
    }

    // แปลง Map กลับเป็น Array และจัดเรียง
    const result = Array.from(categoriesMap.values());
    result.sort((a, b) => {
      if (a.category_id === 0) return 1;
      if (b.category_id === 0) return -1;
      return a.category_name.localeCompare(b.category_name, 'th');
    });

    // สร้างโครงสร้าง Response สุดท้าย
    return {
      success: true,
      data: {
        facility_info: {
          id: facility.id,
          name: facility.name
        },
        categories: result
      }
    };

  } catch (error) {
    console.error('Error getting facility dashboard by category:', error);
    throw error;
  }
};