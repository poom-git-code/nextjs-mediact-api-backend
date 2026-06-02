import { Context, Next } from "koa";
import { verifyToken } from "../utils/jwt";

export const authenticate = async (ctx: Context, next: Next) => {
  const authHeader = ctx.headers.authorization;

  console.log("authHeader: ", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.status = 401;
    ctx.body = { message: "Unauthorized" };
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    // console.log("decoded: ", decoded);

    ctx.state.user = decoded;
    await next();
  } catch (err) {
    console.log("err: ", err);

    ctx.status = 401;
    ctx.body = { message: "Invalid token" };
  }
};
