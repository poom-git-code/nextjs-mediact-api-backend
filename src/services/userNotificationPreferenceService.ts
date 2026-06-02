import { UserNotificationPreferenceModel } from '../models/UserNotificationPreferenceModel';
import { UserModel } from '../models/UserModel';
import { PreferenceKeyTypeModel } from '../models/PreferenceKeyTypeModel';
import { Op } from 'sequelize';

/**
 * Determine key_type_id based on preference_key prefix
 * @param key - preference_key string
 * @returns {number | null} - key_type_id or null
 */
const determineKeyTypeId = (key: string): number | null => {
    if (key.startsWith('jobs_')) {
        return 3;
    } else if (key.startsWith('last-update')) {
        return 1;
    } else if (key.startsWith('events')) {
        return 2;
    } else if (key.startsWith('marketing')) {
        return 4;
    } else if (key.startsWith('qr-booth-events')) {
        return 5;
    }
    return null;
};

/**
 * อัปเดตหรือสร้าง (Upsert) การตั้งค่าการแจ้งเตือนสำหรับ User
 * @param userId - ID ของ User
 * @param key - กุญแจของ Preference (เช่น 'jobs_facility_123')
 * @param enabled - สถานะ (true/false)
 * @returns {Promise<[UserNotificationPreferenceModel, boolean | null]>} - ส่งคืน [instance, created]
 */
export const upsertUserPreference = async (
    userId: number,
    key: string,
    enabled: boolean
): Promise<[UserNotificationPreferenceModel, boolean | null]> => {

    try {
        const keyTypeId = determineKeyTypeId(key);
        
        const [preference, created] = await UserNotificationPreferenceModel.upsert({
            user_id: userId,
            preference_key: key,
            key_type_id: keyTypeId,
            is_enabled: enabled,
        });

        if (keyTypeId !== null && !created) {
            await UserNotificationPreferenceModel.update(
                { is_enabled: enabled },
                {
                    where: {
                        user_id: userId,
                        key_type_id: keyTypeId,
                        preference_key: { [Op.ne]: key }
                    }
                }
            );
        }

        return [preference, created];

    } catch (error) {
        console.error("Error in upsertUserPreference:", error);
        throw new Error("Could not update user preference");
    }
};

export const updatePreferencesByKeyType = async (
    userId: number,
    keyTypeId: number,
    enabled: boolean
): Promise<number> => {
    try {
        const [affectedCount] = await UserNotificationPreferenceModel.update(
            { is_enabled: enabled },
            {
                where: {
                    user_id: userId,
                    key_type_id: keyTypeId
                }
            }
        );
        return affectedCount;
    } catch (error) {
        console.error("Error in updatePreferencesByKeyType:", error);
        throw new Error("Could not update preferences by key type");
    }
};

/**
 * ดึงการตั้งค่าทั้งหมดของ User คนเดียว
 * (มีประโยชน์สำหรับหน้า Setting ในแอป เพื่อแสดงค่าสวิตช์ทั้งหมด)
 *
 * @param userId - ID ของ User
 * @returns {Promise<UserNotificationPreferenceModel[]>}
 */
export const getPreferencesByUserId = async (
    userId: number
): Promise<UserNotificationPreferenceModel[]> => {
    try {
        const preferences = await UserNotificationPreferenceModel.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: PreferenceKeyTypeModel,
                    as: 'key_type',
                    attributes: ['id', 'type_code', 'type_name_th', 'type_name_en'],
                },
            ],
            order: [['preference_key', 'ASC']],
        });
        return preferences;
    } catch (error) {
        console.error("Error getting preferences by user ID:", error);
        throw new Error("Could not retrieve preferences");
    }
};

/**
 * (Create) สร้าง Preference
 *
 * @param data - { user_id, preference_key, is_enabled }
 */
export const createPreference = async (data: {
    user_id: number;
    preference_key: string;
    is_enabled: boolean;
}) => {
    try {
        return await UserNotificationPreferenceModel.create(data);
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error('This preference setting already exists for this user.');
        }
        throw error;
    }
};

/**
 * (Read) ดึง Preference ด้วย ID ของมัน
 *
 * @param id - ID ของแถว user_notification_preferences (PK)
 */
export const getPreferenceById = async (id: number) => {
    const preference = await UserNotificationPreferenceModel.findByPk(id, {
        include: [
            {
                model: UserModel,
                as: 'user',
                attributes: ['id', 'username'],
            },
        ],
    });

    if (!preference) {
        throw new Error('Preference not found');
    }
    return preference;
};

/**
 * (Read) ดึง Preference ทั้งหมด
 */
export const getAllPreferences = async (options: {
    page?: number;
    pageSize?: number;
    user_id?: number;
    preference_key?: string;
}) => {
    const { page = 1, pageSize = 20, user_id, preference_key } = options;
    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    const whereClause: any = {};
    if (user_id) {
        whereClause.user_id = user_id;
    }
    if (preference_key) {
        whereClause.preference_key = { [Op.like]: `%${preference_key}%` };
    }

    const { count, rows } = await UserNotificationPreferenceModel.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: UserModel,
                as: 'user',
                attributes: ['id', 'username'],
            },
        ],
        limit: limit,
        offset: offset,
        order: [['updated_at', 'DESC']],
    });

    return { preferences: rows, total: count };
};

/**
 * (Update) อัปเดต Preference ด้วย ID
 *
 * @param id - ID ของแถว user_notification_preferences (PK)
 * @param isEnabled - สถานะใหม่ (true/false)
 */
export const updatePreferenceStatus = async (id: number, isEnabled: boolean) => {
    const preference = await UserNotificationPreferenceModel.findByPk(id);
    if (!preference) {
        throw new Error('Preference not found');
    }

    return await preference.update({ is_enabled: isEnabled });
};

/**
 * (Delete) ลบ Preference ด้วย ID
 *
 * @param id - ID ของแถว user_notification_preferences (PK)
 */
export const deletePreference = async (id: number) => {
    const preference = await UserNotificationPreferenceModel.findByPk(id);
    if (!preference) {
        throw new Error('Preference not found');
    }

    await preference.destroy();
    return { message: 'Preference deleted successfully' };
};

/**
 * (Update) Disable (ปิด) Preference ด้วย ID
 *
 * @param id - ID ของแถว user_notification_preferences (PK)
 */
export const disablePreference = async (id: number) => {
    return await updatePreferenceStatus(id, false);
};

/**
 * (Update) Enable (เปิด) Preference ด้วย ID
 *
 * @param id - ID ของแถว user_notification_preferences (PK)
 */
export const enablePreference = async (id: number) => {
    return await updatePreferenceStatus(id, true);
};