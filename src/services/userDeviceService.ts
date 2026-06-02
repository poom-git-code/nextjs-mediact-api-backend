import UserDeviceModel from "../models/UserDeviceModel";

// Register or update device info (by user)
export const registerDevice = async (userId: number, data: any) => {
  const {
    device_id,
    device_type,
    os_name,
    os_version,
    app_version,
    device_model,
    push_token,
    ip_address,
  } = data;

  const [device, created] = await UserDeviceModel.findOrCreate({
    where: { user_id: userId, device_id },
    defaults: {
      device_type,
      os_name,
      os_version,
      app_version,
      device_model,
      push_token,
      is_active: true,
      trusted_device: false,
      last_login_at: new Date(),
      ip_address,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  if (!created) {
    await device.update({
      device_type,
      os_name,
      os_version,
      app_version,
      device_model,
      push_token,
      is_active: true,
      last_login_at: new Date(),
      ip_address,
      updated_by: userId,
      updated_at: new Date(),
    });
  }

  return device;
};

// Update device info (by user)
export const updateDevice = async (
  userId: number,
  deviceId: string,
  updates: any
) => {
  const device = await UserDeviceModel.findOne({
    where: { device_id: deviceId, user_id: userId },
  });
  if (!device) throw new Error("Device not found");
  await device.update({
    ...updates,
    updated_by: userId,
    updated_at: new Date(),
  });
  return device;
};

// Deactivate device (by user)
export const deactivateDevice = async (userId: number, deviceId: number) => {
  console.log("Deactivating device:", deviceId, "for user:", userId);
  const device = await UserDeviceModel.findOne({
    where: { device_id: deviceId, user_id: userId },
  });
  if (!device) throw new Error("Device not found");
  await device.update({
    is_active: false,
    updated_by: userId,
    updated_at: new Date(),
  });
  return true;
};

// Get all devices for current user
export const getMyDevices = async (userId: number) => {
  return await UserDeviceModel.findAll({ where: { user_id: userId } });
};

// Admin: Get all devices for any user
export const getUserDevicesByAdmin = async (userId: number) => {
  return await UserDeviceModel.findAll({ where: { user_id: userId } });
};
