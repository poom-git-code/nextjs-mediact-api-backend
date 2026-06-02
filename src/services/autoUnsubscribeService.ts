import { sendPushNotification } from "./pushNotificationService";
import NotificationsModel from "../models/NotificationsModel";
import UserModel from "../models/UserModel";
import { Op } from "sequelize";
import * as UserNotificationsRepo from "../repositories/userNotificationsRepository";

export const sendAutoUnsubscribeForTopic = async (topicName: string, createdBy?: number) => {
    const dataPayload = { action: "AUTO_UNSUBSCRIBE", topicName };

    // platform flags for silent push (match processScheduledNotifications behavior)
    const apns = {
        headers: {
            "apns-push-type": "background",
            "apns-priority": "5"
        },
        payload: { aps: { 'content-available': 1 } }
    };
    const android = { priority: 'high' };

    try {
        await sendPushNotification({
            data: dataPayload,
            topic: topicName,
            apns,
            android,
        } as any);

        const record = await NotificationsModel.create({
            title: "Auto unsubscribe topic",
            message: `Auto unsubscribe for topic: ${topicName}`,
            data_payload: dataPayload,
            target_channel: "topic",
            target_value: topicName,
            sent_at: new Date(),
            status: 'sent',
            created_by: createdBy ?? null,
            updated_by: createdBy ?? null,
        });

        try {
            const activeUsers = await UserModel.findAll({
                where: {
                    // FOR TEST - keep same filter used elsewhere
                    // id: {
                    //     [Op.in]: [1, 172, 210],
                    // },
                    //
                },
                include: [
                    {
                        model: require("../models/UserStatusModel").default,
                        as: "user_status",
                        where: { name: "Active" },
                        required: true,
                    },
                ],
                attributes: ["id"],
            });

            const userNotificationsData = activeUsers.map((user) => ({
                notification_id: record.id,
                user_id: user.id,
                push_status: "success",
                sent_at: new Date(),
                is_in_app: true,
                is_read: false,
                created_by: createdBy ?? null,
                updated_by: createdBy ?? null,
            }));

            if (userNotificationsData.length > 0) {
                await UserNotificationsRepo.bulkCreateUserNotifications(userNotificationsData);
                console.log(
                    `Created ${userNotificationsData.length} user_notifications records for auto-unsubscribe topic: ${topicName}`
                );
            }
        } catch (createErr) {
            console.error(`Failed to create user_notifications for auto-unsubscribe topic ${topicName}:`, createErr);
        }

        return record;
    } catch (err) {
        console.error(`Failed to send auto-unsubscribe for topic ${topicName}:`, err);
        throw err;
    }
};
