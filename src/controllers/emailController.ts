import { Context } from "koa";
import { sendEmail } from "../services/emailService";

export const sendEmailController = async (ctx: Context) => {
  const { to, subject, text } = ctx.request.body as { to: string; subject: string; text: string };

  if (!to || !subject || !text) {
    ctx.status = 400;
    ctx.body = { error: "Missing required fields: to, subject, text" };
    return;
  }

  try {
    await sendEmail(to, subject, text);
    ctx.status = 200;
    ctx.body = { message: "Email sent successfully" };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Failed to send email" };
  }
};