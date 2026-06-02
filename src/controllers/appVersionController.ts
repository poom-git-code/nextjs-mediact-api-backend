import { Context } from "koa";

export const getAppVersions = async (ctx: Context) => {
  const minimumRequireVersion = process.env.APP_MINIMUM_REQUIRE_VERSION ?? null;

  ctx.status = 200;
  ctx.body = {
    minimumRequireVersion,
  };
};

export default {
  getAppVersions,
};
