import { Context, Next } from 'koa';

export const errorHandler = async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      if (err instanceof Error) {
        ctx.status = (err as any).status || 500;
        ctx.body = { message: err.message || 'Internal Server Error' };
      } else {
        ctx.status = 500;
        ctx.body = { message: 'Unknown Error' };
      }
      ctx.app.emit('error', err, ctx);
    }
  };