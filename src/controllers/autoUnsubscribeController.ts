import { Context } from "koa";
import { sendAutoUnsubscribeForTopic } from "../services/autoUnsubscribeService";

export const sendAutoUnsubscribe = async (ctx: Context) => {
  const { topicName } = ctx.request.body || {};
  const userId = ctx.state.user?.id;

  try {
    const record = await sendAutoUnsubscribeForTopic(topicName || "booth-events", userId);
    ctx.status = 200;
    ctx.body = { message: "Auto-unsubscribe sent", record };
  } catch (err: any) {
    ctx.status = 500;
    ctx.body = { error: err?.message || "Failed to send auto-unsubscribe" };
  }
};
