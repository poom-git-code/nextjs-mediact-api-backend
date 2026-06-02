import { Op } from "sequelize";
import NotificationsModel from "../models/NotificationsModel";
import NotificationTypesModel from "../models/NotificationTypesModel";
import UserDeviceModel from "../models/UserDeviceModel";
import * as UserNotificationsRepo from "../repositories/userNotificationsRepository";
import * as NotificationsRepo from "../repositories/notificationsRepository";
import UserModel from "../models/UserModel";
import { UserNotificationPreferenceModel } from "../models/UserNotificationPreferenceModel";
import { sendPushNotification } from "./pushNotificationService";
import { Op as SequelizeOp } from "sequelize";

interface NotificationData {
  title: string;
  message: string;
  notification_type_id?: number;
  target_channel: string;
  target_value?: string;
  channels?: any;
  created_by?: number;
  updated_by?: number;
  data?: Record<string, any>;

  execution_user_ids?: number[];
}

export const sendNotification = async (notificationData: NotificationData) => {
  console.log("🚨🚨🚨 SEND NOTIFICATION [HYBRID V3] CALLED! 🚨🚨🚨");
  console.log("Notification data:", notificationData);

  const notification = await NotificationsModel.create({
    ...notificationData,
    data_payload: notificationData.data,
  });
  console.log(
    "============== Notification Intent Saved:",
    notificationData.target_channel,
    notificationData.target_value
  );

  let userIds: number[] = [];

  // --- รวบรวม User IDs ---
  if (
    notificationData.execution_user_ids &&
    notificationData.execution_user_ids.length > 0
  ) {
    console.log(
      "============== Handling PRE-QUERIED notification (Hybrid) =============="
    );
    userIds = notificationData.execution_user_ids;
  } else if (
    notificationData.target_channel === "user" &&
    notificationData.target_value
  ) {
    console.log(
      "============== Handling TARGETED notification (Legacy 'user') =============="
    );
    userIds = notificationData.target_value
      .toString()
      .split(",")
      .map((id: string) => parseInt(id.trim(), 10));
  } else if (
    notificationData.target_channel === "role" &&
    notificationData.target_value
  ) {
    console.log(
      "============== Handling TARGETED notification (Legacy 'role') =============="
    );
    const users = await UserModel.findAll({
      where: { role_id: notificationData.target_value },
      attributes: ["id"],
    });
    userIds = users.map((u) => u.id);
  } else if (
    notificationData.target_channel === "group" &&
    notificationData.target_value
  ) {
    console.log(
      "============== Handling TARGETED notification (Legacy 'group') =============="
    );
    const users = await UserModel.findAll({
      where: { group_id: notificationData.target_value },
      attributes: ["id"],
    });
    userIds = users.map((u) => u.id);
  }

  // --- Handle TOPIC notification via preference key lookup (NO FCM TOPIC PUSH) ---

  if (
    notificationData.target_channel === "topic" &&
    notificationData.target_value
  ) {
    const preferenceKey = notificationData.target_value;
    console.log(
      `============== Handling TOPIC notification via preference key: ${preferenceKey} =============`
    );

    // ค้นหา users ที่มี preference key นี้และเปิดใช้งาน
    if (userIds.length === 0) {
      try {
        const enabledPreferences = await UserNotificationPreferenceModel.findAll({
          where: {
            preference_key: preferenceKey,
            is_enabled: true,
          },
          attributes: ["user_id"],
          raw: true,
        });

        userIds = [...new Set(enabledPreferences.map((p: any) => p.user_id))] as number[];

        console.log(
          `============== Found ${userIds.length} users with preference key '${preferenceKey}' enabled.`
        );

        if (userIds.length === 0) {
          console.warn(
            `============== No users found with preference key '${preferenceKey}' enabled. Exiting.`
          );
          return notification;
        }
      } catch (error) {
        console.error(
          `============== Failed to query users for preference key '${preferenceKey}':`,
          error
        );
        return notification;
      }
    } else {
      console.log(
        `============== Topic notification will use pre-queried user IDs (${userIds.length} users).`
      );
    }
  }

  // --- สร้าง IN-APP NOTIFICATION (UserNotification) ---

  console.log(
    `============== Found ${userIds.length} total target users for execution.`
  );
  if (userIds.length === 0) {
    console.log("============== No users to execute for. Exiting.");
    return notification;
  }

  console.log(
    "============== [PERF_OPTIMIZED_V2] Starting batch process... =============="
  );

  const allDevices = await UserDeviceModel.findAll({
    where: {
      user_id: { [Op.in]: userIds },
      is_active: true,
      push_token: { [Op.ne]: null },
    },
  });
  console.log("============== Devices found:", allDevices.length);

  const deviceMap = new Map<number, UserDeviceModel[]>();
  for (const device of allDevices) {
    if (!deviceMap.has(device.user_id)) {
      deviceMap.set(device.user_id, []);
    }
    deviceMap.get(device.user_id)!.push(device);
  }

  const recordsToCreate: any[] = [];
  const devicesToSend: UserDeviceModel[] = []; // (สำหรับ individual push)

  for (const userId of userIds) {
    const userDevices = deviceMap.get(userId) || [];
    if (userDevices.length === 0) {
      recordsToCreate.push({
        notification_id: notification.id,
        user_id: userId,
        push_status: "failed",
        is_in_app: true,
        is_read: false,
        created_by: notificationData.created_by || null,
        updated_by: notificationData.created_by || null,
      });
    } else {
      for (const device of userDevices) {
        recordsToCreate.push({
          notification_id: notification.id,
          user_id: userId,
          push_status: "pending",
          is_in_app: true,
          is_read: false,
          push_token: device.push_token,
          created_by: notificationData.created_by || null,
          updated_by: notificationData.created_by || null,
        });
        devicesToSend.push(device);
      }
    }
  }

  if (recordsToCreate.length > 0) {
    await UserNotificationsRepo.bulkCreateUserNotifications(recordsToCreate);
    console.log(
      `============== Bulk created ${recordsToCreate.length} user_notifications.`
    );
  }

  // --- ส่ง PUSH รายคน ---

  if (devicesToSend.length === 0) {
    console.log("============== No devices to send push notifications to.");
    return notification;
  }

  console.log(
    `============== Sending ${devicesToSend.length} pushes in PARALLEL...`
  );
  let hasSuccessfulPush = false;

  const sendPromises = devicesToSend.map(async (device) => {
    try {
      const result = await sendPushNotification({
        title: notificationData.title,
        body: notificationData.message,
        token: device.push_token!,
        data: {
          notification_id: notification.id,
          ...notificationData.channels,
          ...notificationData.data,
        },
      });

      if (
        result.success === false &&
        result.reason === "UNREGISTERED_TOKEN_DEACTIVATED"
      ) {
        await UserNotificationsRepo.updateUserNotificationStatus(
          notification.id,
          device.user_id,
          device.push_token,
          { push_status: "failed", sent_at: new Date() }
        );
      } else {
        await UserNotificationsRepo.updateUserNotificationStatus(
          notification.id,
          device.user_id,
          device.push_token,
          { push_status: "success", sent_at: new Date() }
        );
        hasSuccessfulPush = true;
      }
    } catch (pushError) {
      console.error(
        `Push notification failed for user ${device.user_id}:`,
        pushError
      );
      await UserNotificationsRepo.updateUserNotificationStatus(
        notification.id,
        device.user_id,
        device.push_token,
        { push_status: "failed", sent_at: new Date() }
      );
    }
  });

  await Promise.all(sendPromises);
  console.log("============== All parallel pushes completed.");

  if (hasSuccessfulPush) {
    await NotificationsRepo.updateNotification(notification.id, {
      sent_at: new Date(),
    });
  }

  return notification;
};

// export const processScheduledNotifications = async () => {
//   console.log(`[${new Date().toISOString()}] Running Scheduled Notification Job...`);

//   const notificationsToSend = await NotificationsModel.findAll({
//     where: {
//       scheduled_at: {
//         [Op.lte]: new Date(),
//       },
//       sent_at: null,
//     },
//     limit: 20,
//   });

//   if (notificationsToSend.length === 0) {
//     console.log("No scheduled notifications to send at this time.");
//     return;
//   }

//   console.log(`Found ${notificationsToSend.length} notifications to process.`);

//   for (const notification of notificationsToSend) {
//     try {
//       await sendSingleScheduledNotification(notification);
//     } catch (error) {
//       console.error(`[CRITICAL] Failed to process notification ID ${notification.id}. Marking as sent to prevent re-queueing.`, error);

//       await NotificationsRepo.updateNotification(notification.id, {
//         sent_at: new Date(),
//       });
//     }
//   }

//   console.log("Scheduled Notification Job finished.");
// };

// const sendSingleScheduledNotification = async (notification: NotificationsModel) => {
//   console.log(`============== Processing Scheduled Notification ID: ${notification.id}`);

//   const notificationData = {
//     id: notification.id,
//     title: notification.title,
//     message: notification.message,
//     target_channel: notification.target_channel,
//     target_value: notification.target_value,
//     data: notification.data_payload,
//     created_by: notification.created_by,
//     channels: {},
//   };

//   if (notificationData.target_channel === "topic") {
//     console.log("============== Handling TOPIC notification")

//     const topicName = notificationData.target_value

//     if (!topicName) {
//       console.error("Topic name is missing in target_value for a topic notification.")
//       return notification
//     }

//     const payloadToSend = {
//       title: notificationData.title,
//       body: notificationData.message,
//       topic: topicName,
//       data: {
//         notification_id: notificationData.id,
//         ...notificationData.channels,
//         ...notificationData.data,
//       },
//     }

//     console.log("!!! DEBUG: Payload being sent to push service:", payloadToSend)

//     try {
//       await sendPushNotification(payloadToSend)

//       await NotificationsRepo.updateNotification(notificationData.id, {
//         sent_at: new Date(),
//       })
//     } catch (pushError) {
//       console.error(`Failed to send push notification to topic "${topicName}":`, pushError)
//     }

//     // find all users with active status
//     const activeUsers = await UserModel.findAll({
//       where: {
//         // FOR TEST
//         id: {
//           [Op.in]: [1, 172, 210]
//         }
//         ///////////////////////////////////////////////////////////////////////////////////////////
//       },
//       include: [
//         {
//           model: require("../models/UserStatusModel").default,
//           as: "user_status",
//           where: { name: "Active" },
//           required: true,
//         }
//       ],
//       attributes: ["id"]
//     })

//     const userNotificationsData = activeUsers.map((user) => ({
//       notification_id: notificationData.id,
//       user_id: user.id,
//       push_status: "success",
//       sent_at: new Date(),
//       is_in_app: true,
//       is_read: false,
//       created_by: notificationData.created_by || null,
//       updated_by: notificationData.created_by || null,
//     }))

//     if (userNotificationsData.length > 0) {
//       await UserNotificationsRepo.bulkCreateUserNotifications(userNotificationsData)
//       console.log(`Created ${userNotificationsData.length} user_notifications records for topic: ${topicName}.`)
//     }
//   }
//   else {
//     console.log("============== Handling TARGETED notification")

//     let users: any[] = []
//     if (notificationData.target_channel === "user" && notificationData.target_value) {
//       const userIds = notificationData.target_value
//         .toString()
//         .split(",")
//         .map((id: string) => parseInt(id.trim(), 10))
//       users = await UserModel.findAll({ where: { id: userIds } })
//     } else if (notificationData.target_channel === "role" && notificationData.target_value) {
//       users = await UserModel.findAll({ where: { role_id: notificationData.target_value } })
//     } else if (notificationData.target_channel === "group" && notificationData.target_value) {
//       users = await UserModel.findAll({ where: { group_id: notificationData.target_value } })
//     }

//     console.log("============== Users found for notification:", users.length)
//     let hasSuccessfulPush = false

//     for (const user of users) {
//       const devices = await UserDeviceModel.findAll({
//         where: {
//           user_id: user.id,
//           is_active: true,
//           push_token: { [Op.ne]: null },
//         },
//       })

//       if (devices.length === 0) {
//         await UserNotificationsRepo.createUserNotification({
//           notification_id: notificationData.id,
//           user_id: user.id,
//           push_status: "no_device",
//           is_in_app: true,
//           is_read: false,
//           created_by: notificationData.created_by || null,
//           updated_by: notificationData.created_by || null,
//         })
//       }

//       for (const device of devices) {
//         await UserNotificationsRepo.createUserNotification({
//           notification_id: notificationData.id,
//           user_id: user.id,
//           push_status: "pending",
//           is_in_app: true,
//           is_read: false,
//           push_token: device.push_token,
//           created_by: notificationData.created_by || null,
//           updated_by: notificationData.created_by || null,
//           created_at: new Date(),
//           updated_at: new Date(),
//         })

//         // ส่ง push notification
//         if (device.push_token) {
//           try {
//             const result = await sendPushNotification({
//               title: notificationData.title,
//               body: notificationData.message,
//               token: device.push_token,
//               data: {
//                 notification_id: notificationData.id,
//                 ...notificationData.channels,
//                 ...notificationData.data,
//               },
//             })

//             // ตรวจสอบว่าส่งสำเร็จหรือไม่
//             if (result.success === false && result.reason === "UNREGISTERED_TOKEN_DEACTIVATED") {
//               // อัปเดต push_status เป็น failed สำหรับ token ที่ถูก deactivate
//               await UserNotificationsRepo.updateUserNotificationStatus(
//                 notificationData.id,
//                 user.id,
//                 device.push_token,
//                 {
//                   push_status: "failed",
//                   sent_at: new Date(),
//                 }
//               )
//             } else {
//               // อัปเดต push_status และ sent_at สำหรับการส่งที่สำเร็จ
//               await UserNotificationsRepo.updateUserNotificationStatus(
//                 notificationData.id,
//                 user.id,
//                 device.push_token,
//                 {
//                   push_status: "success",
//                   sent_at: new Date(),
//                 }
//               )

//               // ทำเครื่องหมายว่ามี push notification ที่ส่งสำเร็จ
//               hasSuccessfulPush = true
//             }
//           } catch (pushError) {
//             console.error(`Push notification failed for user ${user.id}:`, pushError)

//             // อัปเดต push_status เป็น failed
//             await UserNotificationsRepo.updateUserNotificationStatus(
//               notificationData.id,
//               user.id,
//               device.push_token,
//               {
//                 push_status: "failed",
//                 sent_at: new Date(),
//               }
//             )
//           }
//         }
//       }
//     }

//     if (hasSuccessfulPush) {
//       await NotificationsRepo.updateNotification(notificationData.id, {
//         sent_at: new Date(),
//       });
//     }
//   }
// }

/**
 * Process NotificationsModel entries that have scheduled_at <= now and sent_at IS NULL
 * This will send push via topic/token using sendPushNotification and mark sent_at.
 */
// export const processScheduledNotifications = async () => {
//   const now = new Date();

//   const pendingNotifications = await NotificationsModel.findAll({
//     where: {
//       scheduled_at: { [Op.lte]: now },
//       status: 'pending',
//     },
//     limit: 10
//   });

//   if (!pendingNotifications || pendingNotifications.length === 0) return;

//   const notificationIds = pendingNotifications.map(n => n.id);
//   await NotificationsModel.update(
//     { status: 'processing' },
//     { where: { id: { [Op.in]: notificationIds } } }
//   );

//   for (const notif of pendingNotifications) {
//     try {
//       const dataPayload = (notif.data_payload as any) || {};

//       if (notif.target_channel === "topic" && notif.target_value) {
//         console.log(`Processing topic notification for topic: ${notif.target_value}`);

//         await sendPushNotification({
//           title: notif.title,
//           body: notif.message,
//           data: dataPayload,
//           topic: notif.target_value,
//         } as any);

//         try {
//           const activeUsers = await UserModel.findAll({
//             where: {
//               // FOR TEST
//               id: {
//                 [Op.in]: [1, 172, 210]
//               }
//               ///////////////////////////////////////////////////////////////////////////////////////////
//             },
//             include: [
//               {
//                 model: require("../models/UserStatusModel").default,
//                 as: "user_status",
//                 where: { name: "Active" },
//                 required: true,
//               }
//             ],
//             attributes: ["id"]
//           })

//           const userNotificationsData = activeUsers.map((user) => ({
//             notification_id: notif.id,
//             user_id: user.id,
//             push_status: "success",
//             sent_at: new Date(),
//             is_in_app: true,
//             is_read: false,
//             created_by: notif.created_by || null,
//             updated_by: notif.created_by || null,
//           }));

//           if (userNotificationsData.length > 0) {
//             await UserNotificationsRepo.bulkCreateUserNotifications(userNotificationsData);
//             console.log(`Created ${userNotificationsData.length} user_notifications records for scheduled topic: ${notif.target_value}`);
//           }
//         } catch (createErr) {
//           console.error(`Failed to create user_notifications for scheduled notification id=${notif.id}:`, createErr);
//         }
//       }
//       else if (notif.target_channel === "user" && notif.target_value) {
//         const dataPayloadForDevices = (notif.data_payload as any) || {};

//         const userIds = notif.target_value
//           .toString()
//           .split(",")
//           .map((id: string) => parseInt(id.trim(), 10));

//         const users = await UserModel.findAll({ where: { id: userIds } });

//         let hasSuccessfulPushForScheduled = false;

//         for (const user of users) {
//           const devices = await UserDeviceModel.findAll({
//             where: {
//               user_id: user.id,
//               is_active: true,
//               push_token: { [Op.ne]: null },
//             },
//           });

//           if (devices.length === 0) {
//             await UserNotificationsRepo.createUserNotification({
//               notification_id: notif.id,
//               user_id: user.id,
//               push_status: "no_device",
//               is_in_app: true,
//               is_read: false,
//               created_by: notif.created_by || null,
//               updated_by: notif.created_by || null,
//             });
//           }

//           for (const device of devices) {
//             await UserNotificationsRepo.createUserNotification({
//               notification_id: notif.id,
//               user_id: user.id,
//               push_status: "pending",
//               is_in_app: true,
//               is_read: false,
//               push_token: device.push_token,
//               created_by: notif.created_by || null,
//               updated_by: notif.created_by || null,
//               created_at: new Date(),
//               updated_at: new Date(),
//             });

//             if (device.push_token) {
//               try {
//                 const result = await sendPushNotification({
//                   title: notif.title,
//                   body: notif.message,
//                   token: device.push_token,
//                   data: {
//                     notification_id: notif.id,
//                     ...dataPayloadForDevices,
//                   },
//                 } as any);

//                 if (result && result.success === false && result.reason === "UNREGISTERED_TOKEN_DEACTIVATED") {
//                   await UserNotificationsRepo.updateUserNotificationStatus(
//                     notif.id,
//                     user.id,
//                     device.push_token,
//                     {
//                       push_status: "failed",
//                       sent_at: new Date(),
//                     }
//                   );
//                 } else {
//                   await UserNotificationsRepo.updateUserNotificationStatus(
//                     notif.id,
//                     user.id,
//                     device.push_token,
//                     {
//                       push_status: "success",
//                       sent_at: new Date(),
//                     }
//                   );

//                   hasSuccessfulPushForScheduled = true;
//                 }
//               } catch (pushErr) {
//                 console.error(`Push notification failed for scheduled user ${user.id}:`, pushErr);
//                 await UserNotificationsRepo.updateUserNotificationStatus(
//                   notif.id,
//                   user.id,
//                   device.push_token,
//                   {
//                     push_status: "failed",
//                     sent_at: new Date(),
//                   }
//                 );
//               }
//             }
//           }
//         }
//       }
//       else {
//         console.log(`Scheduled notification with id ${notif.id} has unsupported target_channel ${notif.target_channel}`);
//       }

//       await NotificationsRepo.updateNotification(notif.id, {
//         sent_at: new Date(),
//         status: 'sent'
//       });

//     } catch (err) {
//       console.error(`Failed to process scheduled notification id=${notif.id}:`, err);

//       await NotificationsRepo.updateNotification(notif.id, {
//         status: 'failed'
//       });
//     }
//   }
// };