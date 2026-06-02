import { Op } from "sequelize";
import UserDeviceModel from "../models/UserDeviceModel";

// ดึงเฉพาะ push_token ที่ is_active = 1
export const getAllPushTokens = async (): Promise<string[]> => {
  const devices = await UserDeviceModel.findAll({
    where: {
      push_token: { [Op.ne]: null },
      is_active: 1
    },
    attributes: ["push_token"]
  });
  return devices
    .map(d => d.get("push_token") as string)
    .filter(token => !!token);
};