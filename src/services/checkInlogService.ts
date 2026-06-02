import CheckInLogs from "../models/checkInLogsModel";

export const createLog = async (
  userId: number,
  action: string,
  description: string,
  metadata: object
) => {
  const log = await CheckInLogs.create({
    user_id: userId,
    action,
    description,
    metadata,
  });
  return log;
};

export const getLogs = async () => {
  return await CheckInLogs.findAll();
};

export const getUserLogs = async (userId: number) => {
  return await CheckInLogs.findAll({ where: { user_id: userId } });
};
