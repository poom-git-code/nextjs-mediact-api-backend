import { Context } from "koa";
import Joi from "joi";
import * as UserNotificationPreferenceService from "../services/userNotificationPreferenceService";
import {
    upsertPreferenceSchema,
    createPreferenceSchema,
    updatePreferenceSchema,
    updateByKeyTypeSchema,
} from "../validations/userNotificationPreferenceValidation";

/**
 * [สำหรับแอป] อัปเดต (Upsert) การตั้งค่าของ User ที่ล็อกอินอยู่
 */
export const upsertCurrentUserPreference = async (ctx: Context) => {
    // ตรวจสอบ Validation
    const { error, value } = upsertPreferenceSchema.validate(ctx.request.body);
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    // ดึง userId จาก state
    const userId = ctx.state.user?.id;
    if (!userId) {
        ctx.status = 401;
        ctx.body = { error: "Authentication required" };
        return;
    }

    try {
        // เรียกใช้ Service
        const [preference, created] =
            await UserNotificationPreferenceService.upsertUserPreference(
                userId,
                value.key,
                value.enabled
            );

        ctx.status = created ? 201 : 200; // 201 (Created) หรือ 200 (OK/Updated)
        ctx.body = {
            message: `Preference '${value.key}' set to ${value.enabled}`,
            preference,
        };
    } catch (error) {
        ctx.status = 500; // ใช้ 500
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

/**
 * [สำหรับแอป] อัปเดต preferences ทั้งหมดที่มี key_type_id เดียวกันของ User ที่ล็อกอินอยู่
 */
export const updateCurrentUserPreferencesByKeyType = async (ctx: Context) => {
    // ตรวจสอบ Validation
    const { error, value } = updateByKeyTypeSchema.validate(ctx.request.body);
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    // ดึง userId จาก state
    const userId = ctx.state.user?.id;
    if (!userId) {
        ctx.status = 401;
        ctx.body = { error: "Authentication required" };
        return;
    }

    try {
        // เรียกใช้ Service
        const affectedCount =
            await UserNotificationPreferenceService.updatePreferencesByKeyType(
                userId,
                value.key_type_id,
                value.enabled
            );

        ctx.status = 200;
        ctx.body = {
            message: `Updated ${affectedCount} preference(s) with key_type_id ${value.key_type_id}`,
            affected_count: affectedCount,
        };
    } catch (error) {
        ctx.status = 500;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

/**
 * [สำหรับแอป] ดึงการตั้งค่าทั้งหมดของ User ที่ล็อกอินอยู่
 */
export const getCurrentUserPreferences = async (ctx: Context) => {
    // ดึง userId จาก state
    const userId = ctx.state.user?.id;
    if (!userId) {
        ctx.status = 401;
        ctx.body = { error: "Authentication required" };
        return;
    }

    try {
        // เรียกใช้ Service
        const preferences =
            await UserNotificationPreferenceService.getPreferencesByUserId(userId);

        ctx.status = 200;
        ctx.body = { preferences };
    } catch (error) {
        ctx.status = 500;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const getAllPreferences = async (ctx: Context) => {
    try {
        const page = parseInt(ctx.query.page as string, 10) || 1;
        const pageSize = parseInt(ctx.query.pageSize as string, 10) || 20;
        const userId = ctx.query.user_id
            ? parseInt(ctx.query.user_id as string, 10)
            : undefined;
        const preferenceKey = ctx.query.preference_key as string | undefined;

        const { preferences, total } =
            await UserNotificationPreferenceService.getAllPreferences({
                page,
                pageSize,
                user_id: userId,
                preference_key: preferenceKey,
            });

        ctx.status = 200;
        ctx.body = {
            preferences,
            pagination: {
                total: total,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const getPreferenceById = async (ctx: Context) => {
    const { id } = ctx.params;

    try {
        const preference =
            await UserNotificationPreferenceService.getPreferenceById(parseInt(id, 10));

        ctx.status = 200;
        ctx.body = { preference };
    } catch (error) {
        ctx.status = 404;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const createPreference = async (ctx: Context) => {
    // ตรวจสอบ Validation
    const { error, value } = createPreferenceSchema.validate(ctx.request.body);
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    try {
        // เรียกใช้ Service
        const preference =
            await UserNotificationPreferenceService.createPreference(value);

        ctx.status = 201;
        ctx.body = {
            message: "Preference created successfully",
            preference,
        };
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const updatePreference = async (ctx: Context) => {
    const { id } = ctx.params;

    // ตรวจสอบ Validation
    const { error, value } = updatePreferenceSchema.validate(ctx.request.body);
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    try {
        // เรียกใช้ Service
        const updatedPreference =
            await UserNotificationPreferenceService.updatePreferenceStatus(
                parseInt(id, 10),
                value.is_enabled
            );

        ctx.status = 200;
        ctx.body = {
            message: "Preference updated successfully",
            updatedPreference,
        };
    } catch (error) {
        ctx.status = 404;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const deletePreference = async (ctx: Context) => {
    const { id } = ctx.params;

    try {
        await UserNotificationPreferenceService.deletePreference(parseInt(id, 10));

        ctx.status = 200;
        ctx.body = { message: "Preference deleted successfully" };
    } catch (error) {
        ctx.status = 404;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const enablePreference = async (ctx: Context) => {
    const { id } = ctx.params;

    try {
        const preference =
            await UserNotificationPreferenceService.enablePreference(parseInt(id, 10));

        ctx.status = 200;
        ctx.body = {
            message: "Preference enabled successfully",
            preference,
        };
    } catch (error) {
        ctx.status = 404; // ไม่พบ ID
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const disablePreference = async (ctx: Context) => {
    const { id } = ctx.params;

    try {
        const preference =
            await UserNotificationPreferenceService.disablePreference(parseInt(id, 10));

        ctx.status = 200;
        ctx.body = {
            message: "Preference disabled successfully",
            preference,
        };
    } catch (error) {
        ctx.status = 404; // ไม่พบ ID
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};