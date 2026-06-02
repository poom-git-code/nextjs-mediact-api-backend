import { Context } from 'koa';
import * as CreditTypeService from '../services/eventCreditTypeService';

export const getAllCreditTypes = async (ctx: Context) => {
    try {
        const creditTypes = await CreditTypeService.getAllCreditTypes();

        ctx.body = { creditTypes };

    } catch (error) {
        ctx.status = 400;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: 'An unknown error occurred while fetching credit types.' };
        }
    }
};