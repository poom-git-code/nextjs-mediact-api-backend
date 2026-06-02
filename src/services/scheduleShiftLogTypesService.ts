import ScheduleShiftLogTypesModel from "../models/ScheduleShiftLogTypesModel";

// Create a new schedule shift log type
export const createScheduleShiftLogType = async (data: any) => {
  return await ScheduleShiftLogTypesModel.create(data);
};

// Update a schedule shift log type
export const updateScheduleShiftLogType = async (id: number, updates: Partial<ScheduleShiftLogTypesModel>) => {
  const logType = await ScheduleShiftLogTypesModel.findByPk(id);
  if (!logType) {
    throw new Error("Schedule shift log type not found");
  }
  return await logType.update(updates);
};

// Delete a schedule shift log type
export const deleteScheduleShiftLogType = async (id: number) => {
  const logType = await ScheduleShiftLogTypesModel.findByPk(id);
  if (!logType) {
    throw new Error("Schedule shift log type not found");
  }
  return await logType.destroy();
};

// Get schedule shift log type by ID
export const getScheduleShiftLogTypeById = async (id: number) => {
  const logType = await ScheduleShiftLogTypesModel.findByPk(id);
  if (!logType) {
    throw new Error("Schedule shift log type not found");
  }
  return logType;
};

// Get all schedule shift log types
export const getAllScheduleShiftLogTypes = async () => {
  return await ScheduleShiftLogTypesModel.findAll({
    order: [["name", "ASC"]],
  });
};

// Get log type by name
export const getScheduleShiftLogTypeByName = async (name: string) => {
  return await ScheduleShiftLogTypesModel.findOne({
    where: { name },
  });
};

// Initialize default log types
export const initializeDefaultLogTypes = async () => {
  const defaultTypes = [
    { name: "CHECK_IN", description: "Employee check-in log" },
    { name: "CHECK_OUT", description: "Employee check-out log" },
    { name: "BREAK_START", description: "Break time start log" },
    { name: "BREAK_END", description: "Break time end log" },
    { name: "OVERTIME_START", description: "Overtime period start log" },
    { name: "OVERTIME_END", description: "Overtime period end log" },
  ];

  const createdTypes = [];
  for (const type of defaultTypes) {
    try {
      const existingType = await getScheduleShiftLogTypeByName(type.name);
      if (!existingType) {
        const newType = await createScheduleShiftLogType(type);
        createdTypes.push(newType);
      }
    } catch (error) {
      console.error(`Error creating log type ${type.name}:`, error);
    }
  }

  return createdTypes;
};
