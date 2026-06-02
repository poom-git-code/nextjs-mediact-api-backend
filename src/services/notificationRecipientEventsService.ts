import NotificationRecipientEventModel from "../models/NotificationRecipientEventsModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import { PipedaUserDataHandler } from '../middleware/pipedaUserDataHandler';

export const createRecipients = async (
    notificationId: number,
    userIds: number[],
    createdBy: number
) => {
    const records = userIds.map((userId) => ({
        notification_id: notificationId,
        user_id: userId,
        is_read: false,
        responded: false,
        is_selected: false,
        created_by: createdBy,
        updated_by: createdBy,
    }));

    return await NotificationRecipientEventModel.bulkCreate(records);
};

export const getRecipientsByNotification = async (notificationId: number) => {
    const recipients = await NotificationRecipientEventModel.findAll({
        where: { notification_id: notificationId },
        include: [{ 
            association: "user",
            attributes: getBasicUserAttributes(),
        }],
    });

    // Process PIPEDA decryption for recipients
    const processedRecipients = recipients.map((recipient: any) => {
        const recipientData = recipient.get({ plain: true });

        // Decrypt user data
        if (recipientData.user) {
            recipientData.user = decryptAndCleanUserData(recipientData.user);
        }

        return recipientData;
    });

    return processedRecipients;
};

export const markAsRead = async (notificationId: number, userId: number) => {
    const record = await NotificationRecipientEventModel.findOne({
        where: { notification_id: notificationId, user_id: userId },
    });

    if (!record) {
        throw new Error("Notification recipient not found");
    }

    return await record.update({
        is_read: true,
        read_at: new Date(),
    });
};

export const markAsResponded = async (
    notificationId: number,
    userId: number
) => {
    const record = await NotificationRecipientEventModel.findOne({
        where: { notification_id: notificationId, user_id: userId },
    });

    if (!record) {
        throw new Error("Notification recipient not found");
    }

    return await record.update({
        responded: true,
        responded_at: new Date(),
    });
};

export const getNotificationsForUser = async (userId: number) => {
    return await NotificationRecipientEventModel.findAll({
        where: { user_id: userId },
        include: [{ association: "notification" }],
        order: [["created_at", "DESC"]],
    });
};

export const getAllRecipients = async () => {
    return await NotificationRecipientEventModel.findAll();
};
