import NotificationBoothEventModel from "../models/NotificationBoothEventsModel";
import NotificationRecipientEventModel from "../models/NotificationRecipientEventsModel";
import UserModel from "../models/UserModel";
import { Op } from "sequelize";
import { sendNotification } from "./notificationsService";
import { getAllPushTokens } from "../repositories/pushTokenRepository";
import { sendPushNotification } from "./pushNotificationService";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";
import { getBasicUserAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import { sequelize } from "../config/database";
import UserDeviceModel from "../models/UserDeviceModel";
import JobModel from "../models/JobsModel";
import { format } from "date-fns";
import NotificationsModel from "../models/NotificationsModel";
import { formatInTimeZone } from "date-fns-tz";

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
}

const JOB_STATUS = { OPEN: 1 };
// const TOPIC_NAME = 'test-booth-events'; // FOR TEST
// const TOPIC_NAME = 'test-qr-booth-events'; // FOR TEST
// const TOPIC_NAME = 'booth-events';
const TOPIC_NAME = 'qr-booth-events';

interface CreateNotificationData {
    title: string;
    content: string;
    start_datetime: string | Date;
    end_datetime: string | Date;
    registration_limit: number;
    is_active?: boolean;
    created_by: number;
}

export const createNotification = async (data: CreateNotificationData) => {
    const {
        title,
        content,
        start_datetime,
        end_datetime,
        registration_limit,
        is_active = true,
        created_by,
    } = data;

    const transaction = await sequelize.transaction();

    try {
        // --- สร้าง Notification Booth Event ---
        const notification = await NotificationBoothEventModel.create(
            {
                title,
                content,
                start_datetime,
                end_datetime,
                registration_limit,
                is_active,
                created_by,
                updated_by: created_by,
            }, { transaction }
        );

        // --- เพิ่ม Job จาก Notification ---
        const start = new Date(start_datetime);
        const end = new Date(end_datetime);
        const timeZone = 'Asia/Bangkok';

        const job = await JobModel.create({
            job_title: title,
            job_description: content,
            
            work_date: formatInTimeZone(start, timeZone, 'yyyy-MM-dd'),

            start_time: formatInTimeZone(start, timeZone, 'HH:mm:ss'),
            end_time: formatInTimeZone(end, timeZone, 'HH:mm:ss'),

            status_id: JOB_STATUS.OPEN,
            max_applicants: registration_limit,
            job_fee_vat_included: 0,
            auto_close_type: "max_applicants",
            is_active: true,
            created_by,
            updated_by: created_by,
        }, { transaction });

        // --- ส่ง Notification ไปยัง Topic ทันที ---
        console.log("=== Sending notification immediately to topic:", TOPIC_NAME);

        const notificationData: NotificationData = {
            title: title,
            message: content,
            notification_type_id: 3,
            data: {
                notification_booth_id: notification.id,
                jobId: job.id,
                action: "open_job"
            },
            target_channel: "topic",
            target_value: TOPIC_NAME,
            created_by: created_by,
        };

        await sendNotification(notificationData);

        console.log("=== Notification sent successfully ===");

        await transaction.commit();

        return notification;
    } catch (error: any) {
        await transaction.rollback();
        console.error("Failed to create notification, job, and send notification:", error);
        throw error;
    }
};

export const createNotificationNoJob = async (data: any) => {
    const {
        title,
        content,
        start_datetime,
        end_datetime,
        registration_limit,
        is_active = true,
        selected_user_ids = [],
        created_by,
    } = data;

    if (selected_user_ids && selected_user_ids.length > 0) {
        const users = await UserModel.findAll({ where: { id: selected_user_ids } });
        if (users.length !== selected_user_ids.length) {
            throw new Error("One or more selected users do not exist.");
        }
    }

    const transaction = await sequelize.transaction();

    try {
        // --- สร้าง Notification Booth Event ---
        const notification = await NotificationBoothEventModel.create(
            {
                title,
                content,
                start_datetime,
                end_datetime,
                registration_limit,
                is_active,
                created_by,
                updated_by: created_by,
            },
            { transaction }
        );

        // --- สร้าง recipients ถ้ามีการระบุ selected_user_ids ---
        if (selected_user_ids && selected_user_ids.length > 0) {
            const recipients = selected_user_ids.map((user_id: number) => ({
                notification_id: notification.id,
                user_id,
                is_selected: true,
                created_by,
                updated_by: created_by,
            }));
            await NotificationRecipientEventModel.bulkCreate(recipients, { transaction });
        }

        console.log("=== Preparing to send notification immediately ===");

        let notificationData: NotificationData;

        const basePayload = {
            title: title,
            message: content,
            notification_type_id: 3,
            data: {
                notification_booth_id: notification.id,
                action: "open_announcement"
            },
            created_by: created_by,
        };

        // --- กำหนดเป้าหมายการส่งและสร้าง object ที่สมบูรณ์ ---
        if (selected_user_ids && selected_user_ids.length > 0) {
            notificationData = {
                ...basePayload,
                target_channel: "user",
                target_value: selected_user_ids.join(","),
            };
            console.log(`Sending to ${selected_user_ids.length} specific users.`);
        } else {
            notificationData = {
                ...basePayload,
                target_channel: "topic",
                target_value: TOPIC_NAME,
            };
            console.log(`Sending to topic: ${TOPIC_NAME}`);
        }

        // เรียกฟังก์ชันเพื่อส่ง Notification ทันที
        await sendNotification(notificationData);

        console.log("=== Notification sent successfully ===");

        await transaction.commit();

        return notification;
    } catch (error: any) {
        await transaction.rollback();
        console.error("Failed to create and send notification:", error);
        throw error;
    }
};

export const updateNotification = async (id: number, data: any) => {
    const notification = await NotificationBoothEventModel.findByPk(id);
    if (!notification) {
        throw new Error("Notification not found");
    }

    const {
        title,
        content,
        start_datetime,
        end_datetime,
        is_active,
        selected_user_ids = [],
        updated_by,
    } = data;

    await notification.update({
        title,
        content,
        start_datetime,
        end_datetime,
        is_active,
        updated_by,
    });

    return notification;
};

export const getNotificationById = async (id: number) => {
    const notification = await NotificationBoothEventModel.findByPk(id, {
        include: [
            {
                model: NotificationRecipientEventModel,
                as: "recipients",
                include: [{ model: UserModel, as: "user", attributes: getBasicUserAttributes() }],
            },
        ],
    });

    if (!notification) {
        throw new Error("Notification not found");
    }

    // Decrypt user data in recipients
    const notificationData = notification.toJSON() as any;
    if (notificationData.recipients) {
        notificationData.recipients.forEach((recipient: any) => {
            if (recipient.user) {
                recipient.user = decryptAndCleanUserData(recipient.user);
            }
        });
    }

    return notificationData;
};

// export const getAllNotifications = async () => {
//     return await NotificationBoothEventModel.findAll({
//         include: [
//             {
//                 model: NotificationRecipientEventModel,
//                 as: "recipients",
//                 include: [{ model: UserModel, as: "user" }],
//             },
//         ],
//         order: [["start_datetime", "DESC"]],
//     });
// };

export const getAllNotifications = async () => {
    return await NotificationBoothEventModel.findAll({
        order: [["created_at", "DESC"]]
    });
};

export const deleteNotification = async (id: number, userId: number) => {
    const notification = await NotificationBoothEventModel.findByPk(id);
    if (!notification) {
        throw new Error("Notification not found");
    }

    await notification.update({
        is_active: false,
        updated_by: userId,
    });

    return { message: "Notification deactivated (soft deleted)" };
};

export const expireOldNotifications = async () => {
    const now = new Date();
    // 1. ปิด notification ที่หมดอายุ
    await NotificationBoothEventModel.update(
        { is_active: false },
        {
            where: {
                end_datetime: { [Op.lt]: now },
                is_active: true,
            },
        }
    );

    // 2. ปิด job ที่เกี่ยวข้องกับ notification ที่หมดอายุ
    // await JobModel.update(
    //     { status_id: 3 },
    //     {
    //         where: {
    //             [Op.and]: [
    //                 // เงื่อนไขวันที่สร้าง job/notification ตั้งแต่ 2025-07-07 เป็นต้นไป
    //                 { created_at: { [Op.gte]: new Date('2025-07-07') } },
    //                 // วันที่ต้องน้อยกว่าหรือเท่ากับวันนี้
    //                 { work_date: { [Op.lte]: now } },
    //                 // ถ้าวันเดียวกัน ให้เช็ค end_time ด้วย
    //                 {
    //                     [Op.or]: [
    //                         { work_date: { [Op.lt]: now } },
    //                         {
    //                             [Op.and]: [
    //                                 { work_date: now.toISOString().slice(0, 10) },
    //                                 { end_time: { [Op.lt]: now.toTimeString().slice(0, 8) } }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 { status_id: { [Op.ne]: 3 } }
    //             ]
    //         }
    //     }
    // );
};