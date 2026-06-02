import UserDutyModel from '../models/UserDutyModel';
import { Op, fn, col, literal } from 'sequelize';

export const createUserDuty = async (data: any, userId: number) => {
  // Check if user duty already exists for the same user and date
  const existingDuty = await UserDutyModel.findOne({
    where: {
      user_id: data.user_id,
      duty_date: data.duty_date,
      duty_type_id: data.duty_type_id,
      is_active: true
    }
  });

  if (existingDuty) {
    throw new Error('User duty already exists for this date and duty type');
  }

  return await UserDutyModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateUserDuty = async (id: number, updates: any, userId: number) => {
  const userDuty = await UserDutyModel.findByPk(id);
  if (!userDuty) {
    throw new Error('User duty not found');
  }

  // Check for conflicts if updating user_id, duty_date, or duty_type_id
  if (updates.user_id || updates.duty_date || updates.duty_type_id) {
    const checkUserId = updates.user_id || userDuty.user_id;
    const checkDutyDate = updates.duty_date || userDuty.duty_date;
    const checkDutyTypeId = updates.duty_type_id || userDuty.duty_type_id;

    const existingDuty = await UserDutyModel.findOne({
      where: {
        user_id: checkUserId,
        duty_date: checkDutyDate,
        duty_type_id: checkDutyTypeId,
        is_active: true,
        id: { [Op.ne]: id }
      }
    });

    if (existingDuty) {
      throw new Error('User duty already exists for this date and duty type');
    }
  }

  return await userDuty.update({
    ...updates,
    updated_by: userId,
  });
};

export const deleteUserDuty = async (id: number, userId: number) => {
  const userDuty = await UserDutyModel.findByPk(id);
  if (!userDuty) {
    throw new Error('User duty not found');
  }

  // Soft delete by setting is_active to false
  return await userDuty.update({
    is_active: false,
    updated_by: userId,
  });
};

export const getUserDutyById = async (id: number) => {
  const userDuty = await UserDutyModel.findByPk(id);
  if (!userDuty) {
    throw new Error('User duty not found');
  }
  return userDuty;
};

export const getUserDutyByUserAndDate = async (userId: number, dutyDate: string) => {
  return await UserDutyModel.findAll({
    where: {
      user_id: userId,
      duty_date: dutyDate,
      is_active: true
    },
    order: [['start_time', 'ASC']]
  });
};

export const getAllUserDuties = async (filters: any = {}) => {
  const whereClause: any = {};

  // Apply filters
  if (filters.user_id) {
    whereClause.user_id = filters.user_id;
  }

  if (filters.duty_date) {
    whereClause.duty_date = filters.duty_date;
  }

  if (filters.duty_date_from && filters.duty_date_to) {
    whereClause.duty_date = {
      [Op.between]: [filters.duty_date_from, filters.duty_date_to]
    };
  } else if (filters.duty_date_from) {
    whereClause.duty_date = {
      [Op.gte]: filters.duty_date_from
    };
  } else if (filters.duty_date_to) {
    whereClause.duty_date = {
      [Op.lte]: filters.duty_date_to
    };
  }

  if (filters.duty_type_id) {
    whereClause.duty_type_id = filters.duty_type_id;
  }

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.department_id) {
    whereClause.department_id = filters.department_id;
  }

  if (filters.schedule_master_id) {
    whereClause.schedule_master_id = filters.schedule_master_id;
  }

  if (filters.is_active !== undefined) {
    whereClause.is_active = filters.is_active;
  }

  const options: any = {
    where: whereClause,
    order: [['duty_date', 'DESC'], ['start_time', 'ASC']],
    attributes: [
      'id',
      'user_id',
      'duty_date',
      'duty_type_id',
      'reference_id',
      'shift_type_id',
      'start_time',
      'end_time',
      'total_hours',
      'status',
      'department_id',
      'schedule_master_id',
      'is_active',
      'created_at',
      'updated_at'
    ]
  };

  // Add pagination if provided
  if (filters.limit) {
    options.limit = filters.limit;
  }
  if (filters.offset) {
    options.offset = filters.offset;
  }

  return await UserDutyModel.findAll(options);
};

export const getUserDutiesByUser = async (userId: number, filters: any = {}) => {
  const whereClause: any = {
    user_id: userId,
    is_active: true
  };

  // Apply date filters
  if (filters.duty_date_from && filters.duty_date_to) {
    whereClause.duty_date = {
      [Op.between]: [filters.duty_date_from, filters.duty_date_to]
    };
  } else if (filters.duty_date_from) {
    whereClause.duty_date = {
      [Op.gte]: filters.duty_date_from
    };
  } else if (filters.duty_date_to) {
    whereClause.duty_date = {
      [Op.lte]: filters.duty_date_to
    };
  }

  if (filters.duty_type_id) {
    whereClause.duty_type_id = filters.duty_type_id;
  }

  if (filters.status) {
    whereClause.status = filters.status;
  }

  return await UserDutyModel.findAll({
    where: whereClause,
    order: [['duty_date', 'DESC'], ['start_time', 'ASC']],
    limit: filters.limit || 100,
    offset: filters.offset || 0
  });
};

export const bulkUpdateUserDuties = async (userDutyIds: number[], updates: any, userId: number) => {
  // Validate that all user duties exist
  const userDuties = await UserDutyModel.findAll({
    where: { id: { [Op.in]: userDutyIds } }
  });

  if (userDuties.length !== userDutyIds.length) {
    throw new Error('One or more user duties not found');
  }

  // Perform bulk update
  const result = await UserDutyModel.update(
    { ...updates, updated_by: userId },
    {
      where: { id: { [Op.in]: userDutyIds } },
      returning: true
    }
  );

  return result;
};

export const getUserDutyStats = async (filters: any = {}) => {
  const whereClause: any = {
    is_active: true
  };

  // Apply filters
  if (filters.user_id) {
    whereClause.user_id = filters.user_id;
  }

  if (filters.department_id) {
    whereClause.department_id = filters.department_id;
  }

  // Date filters
  if (filters.month && filters.year) {
    whereClause.duty_date = {
      [Op.and]: [
        literal(`MONTH(duty_date) = ${filters.month}`),
        literal(`YEAR(duty_date) = ${filters.year}`)
      ]
    };
  } else if (filters.year) {
    whereClause.duty_date = {
      [Op.and]: [
        literal(`YEAR(duty_date) = ${filters.year}`)
      ]
    };
  }

  const stats = await UserDutyModel.findAll({
    where: whereClause,
    attributes: [
      'duty_type_id',
      'status',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('total_hours')), 'total_hours'],
      [fn('AVG', col('total_hours')), 'avg_hours']
    ],
    group: ['duty_type_id', 'status'],
    order: [['duty_type_id', 'ASC'], ['status', 'ASC']]
  });

  return stats;
};

export const getUserDutyCount = async (filters: any = {}) => {
  const whereClause: any = {};

  // Apply same filters as getAllUserDuties
  if (filters.user_id) {
    whereClause.user_id = filters.user_id;
  }

  if (filters.duty_date) {
    whereClause.duty_date = filters.duty_date;
  }

  if (filters.duty_date_from && filters.duty_date_to) {
    whereClause.duty_date = {
      [Op.between]: [filters.duty_date_from, filters.duty_date_to]
    };
  } else if (filters.duty_date_from) {
    whereClause.duty_date = {
      [Op.gte]: filters.duty_date_from
    };
  } else if (filters.duty_date_to) {
    whereClause.duty_date = {
      [Op.lte]: filters.duty_date_to
    };
  }

  if (filters.duty_type_id) {
    whereClause.duty_type_id = filters.duty_type_id;
  }

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.department_id) {
    whereClause.department_id = filters.department_id;
  }

  if (filters.schedule_master_id) {
    whereClause.schedule_master_id = filters.schedule_master_id;
  }

  if (filters.is_active !== undefined) {
    whereClause.is_active = filters.is_active;
  }

  return await UserDutyModel.count({ where: whereClause });
};

export const getUserDutyCalendar = async (userId: number, year: number, month: number) => {
  return await UserDutyModel.findAll({
    where: {
      user_id: userId,
      duty_date: {
        [Op.and]: [
          literal(`YEAR(duty_date) = ${year}`),
          literal(`MONTH(duty_date) = ${month}`)
        ]
      },
      is_active: true
    },
    order: [['duty_date', 'ASC'], ['start_time', 'ASC']]
  });
};
