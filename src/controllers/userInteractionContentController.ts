import { Context } from "koa";
import * as InteractionService from "../services/userInteractionContentService";

type ContentType = "event" | "news";
type InteractionType = "like" | "dislike";

const validateParams = (
  ctx: Context
): { contentType: ContentType; contentId: number } | null => {
  const { contentType, contentIdStr } = ctx.params;
  if (contentType !== "event" && contentType !== "news") {
    ctx.status = 400;
    ctx.body = { error: 'Invalid content type. Must be "event" or "news".' };
    return null;
  }
  const contentId = parseInt(contentIdStr, 10);
  if (isNaN(contentId)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid content ID." };
    return null;
  }
  return { contentType, contentId };
};

export const recordView = async (ctx: Context) => {
  const params = validateParams(ctx);
  if (!params) return;

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Authentication required to record a view." };
    return;
  }

  const { contentType, contentId } = params;

  try {
    const result = await InteractionService.incrementView(
      contentType,
      contentId,
      userId
    );
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "SequelizeUniqueConstraintError"
    ) {
      ctx.status = 200;
      ctx.body = {
        message: "User has already viewed this content (concurrent request).",
      };
      return;
    }
    ctx.status = 500;
    ctx.body = { error: "An error occurred while recording the view." };
  }
};

export const handleInteraction = async (ctx: Context) => {
  const params = validateParams(ctx);
  if (!params) return;

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Authentication required." };
    return;
  }

  const { interactionType } = ctx.params;
  if (interactionType !== "like" && interactionType !== "dislike") {
    ctx.status = 400;
    ctx.body = {
      error: 'Invalid interaction type. Must be "like" or "dislike".',
    };
    return;
  }

  try {
    const updatedStats = await InteractionService.toggleInteraction(
      params.contentType,
      params.contentId,
      userId,
      interactionType as InteractionType
    );
    ctx.status = 200;
    ctx.body = { message: "Interaction successful", stats: updatedStats };
  } catch (error) {
    console.error("Interaction Error:", error);
    ctx.status = 500;
    ctx.body = { error: "An error occurred while handling the interaction." };
  }
};
