import { Context } from "koa";
import * as ProfileCompletenessService from "../services/userProfileCompletenessService";

export const calculateProfileCompleteness = async (ctx: Context) => {
    const { id } = ctx.params;
    const userId = parseInt(ctx.state.user.id)

    try {
        const completeness = await ProfileCompletenessService.calculateUserProfileCompleteness(Number(id), userId);
        ctx.body = { message: "Profile completeness calculated", completeness };
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: error instanceof Error ? error.message : "Unknown error" };
    }
};
