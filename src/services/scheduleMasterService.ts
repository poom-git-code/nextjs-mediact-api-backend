import ScheduleMasterModel from '../models/ScheduleMasterModel';
import ScheduleShiftsModel from '../models/ScheduleShiftsModel';
import ScheduleShiftSummaryModel from '../models/ScheduleShiftSummaryModel';
import DepartmentModel from '../models/DepartmentModel';
import FacilityModel from '../models/FacilitiesModel';
import UserModel from '../models/UserModel';
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";
import { PipedaUserDataHandler } from '../middleware/pipedaUserDataHandler';


export const createScheduleMaster = async (data: any) => {
  return await ScheduleMasterModel.create(data);
};

export const updateScheduleMaster = async (id: number, updates: Partial<ScheduleMasterModel>) => {
  const schedule = await ScheduleMasterModel.findByPk(id);
  if (!schedule) {
    throw new Error('Schedule Master not found');
  }
  return await schedule.update(updates);
};

export const deleteScheduleMaster = async (id: number) => {
  const schedule = await ScheduleMasterModel.findByPk(id);
  if (!schedule) {
    throw new Error('Schedule Master not found');
  }
  return await schedule.destroy();
};

export const getScheduleMasterById = async (id: number) => {
  const schedule = await ScheduleMasterModel.findByPk(id, {
    include: [
      {
        model: DepartmentModel,
        as: 'department',
        attributes: ['id', 'name', 'type_id', 'facility_id'],
        required: false,
      },
      {
        model: FacilityModel,
        as: 'facility',
        attributes: ['id', 'name', 'address'],
        required: false,
      },
      {
        model: ScheduleShiftsModel,
        as: 'schedule_shifts',
        required: false,
        include: [
          {
            model: UserModel,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false,
          },
          {
            model: UserModel,
            as: 'init_employee',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false,
          }
        ]
      },
      {
        model: ScheduleShiftSummaryModel,
        as: 'schedule_shift_summaries',
        required: false,
      },
      {
        model: UserModel,
        as: 'created_by_user',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        required: false,
      },
      {
        model: UserModel,
        as: 'updated_by_user',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        required: false,
      },
    ]
  });
  if (!schedule) {
    throw new Error('Schedule Master not found');
  }
  return schedule;
};

export const getAllScheduleMasters = async () => {
  return await ScheduleMasterModel.findAll();
};

export const getScheduleMastersByMonthYearDepartment = async (
  month: number,
  year: number,
  departmentId: number
) => {
  return await ScheduleMasterModel.findAll({
    where: {
      month: month,
      year: year,
      department_id: departmentId
    },
    include: [
      {
        model: DepartmentModel,
        as: 'department',
        attributes: ['id', 'name', 'type_id', 'facility_id'],
        required: false,
      },
      {
        model: FacilityModel,
        as: 'facility',
        attributes: ['id', 'name', 'address'],
        required: false,
      },
      {
        model: ScheduleShiftsModel,
        as: 'schedule_shifts',
        required: false,
        include: [
          {
            model: UserModel,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false,
          },
          {
            model: UserModel,
            as: 'init_employee',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false,
          }
        ]
      },
      {
        model: ScheduleShiftSummaryModel,
        as: 'schedule_shift_summaries',
        required: false,
      },
      {
        model: UserModel,
        as: 'created_by_user',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        required: false,
      },
      {
        model: UserModel,
        as: 'updated_by_user',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        required: false,
      },
    ]
  });
};