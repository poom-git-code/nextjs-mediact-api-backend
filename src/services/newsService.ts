import NewsModel from "../models/NewsModel";
import { sendNotification } from "./notificationsService";
import ContentStatsModel from "../models/ContentStatsModel";
import UserContentInteractionModel from "../models/UserContentInteractionModel";
import { Op } from "sequelize";

// const TOPIC_NAME = 'test-last-update'; // FOR TEST
const TOPIC_NAME = "last-update";

const stripHtml = (html: string | null | undefined): string => {
  if (!html) return "";

  return html.replace(/<[^>]*>/g, "");
};

export const createNews = async (data: any, createdBy: number) => {
  try {
    const news = await NewsModel.create({
      ...data,
      created_by: createdBy,
      updated_by: createdBy,
    });
    return news;
  } catch (error) {
    console.error("Error creating news:", error);
    throw error;
  }
};

export const createNewsAndBroadcast = async (data: any, createdBy: number) => {
  const news = await createNews(data, createdBy);

  if (data.is_active) {
    try {
      const notificationTitle = stripHtml(news.title || "News Update");

      await sendNotification({
        title: notificationTitle,
        message: news.category || "See details for more information",
        notification_type_id: 5,
        target_channel: "topic",
        target_value: TOPIC_NAME,
        created_by: createdBy,
        data: {
          newsId: news.id,
          topic: "Last update",
          action: "open_news",
        },
      });
    } catch (notificationError) {
      console.error(
        "News created successfully, but failed to send notification:",
        notificationError
      );
    }
  }

  return news;
};

export const broadcastNews = async (
  id: number,
  updates: Partial<NewsModel>,
  updatedBy: number
) => {
  if (!updates.is_active) {
    return;
  }

  const news = await NewsModel.findByPk(id);
  if (!news) {
    throw new Error("News not found");
  }

  const notificationTitle = stripHtml(news.title || "News Update");

  await sendNotification({
    title: notificationTitle,
    message: news.category || "See details for more information",
    notification_type_id: 5,
    target_channel: "topic",
    target_value: TOPIC_NAME,
    created_by: updatedBy,
    data: {
      newsId: id,
      topic: "Last update",
      action: "open_news",
    },
  });
};

export const updateNews = async (
  id: number,
  updates: Partial<NewsModel>,
  updatedBy: number
) => {
  const news = await NewsModel.findByPk(id);
  if (!news) {
    throw new Error("News not found");
  }
  return await news.update({
    ...updates,
    updated_by: updatedBy,
  });
};

export const deleteNews = async (id: number, userId: number) => {
  const news = await NewsModel.findByPk(id);
  if (!news) throw new Error("News not found");
  return await news.update({ is_active: false, updated_by: userId });
};

export const getNewsById = async (id: number, userId?: number) => {
  const news = await NewsModel.findByPk(id, {
    include: [
      {
        model: ContentStatsModel,
        as: "stats",
        attributes: ["views", "likes", "dislikes"],
      },
    ],
  });

  if (!news) {
    throw new Error("News not found");
  }

  const newsJson = news.toJSON();
  if (!newsJson.stats) {
    newsJson.stats = { views: 0, likes: 0, dislikes: 0 };
  }

  let userLiked = false;
  if (userId) {
    const userInteraction = await UserContentInteractionModel.findOne({
      where: {
        user_id: userId,
        content_id: id,
        content_type: "news",
        interaction_type: "like",
      },
    });
    userLiked = !!userInteraction;
  }

  return {
    ...newsJson,
    user_liked: userLiked,
  };
};

export const getAllNews = async (userId?: number) => {
  const news = await NewsModel.findAll({
    where: { is_active: true },
    order: [["updated_at", "DESC"]],
    include: [
      {
        model: ContentStatsModel,
        as: "stats",
        attributes: ["views", "likes", "dislikes"],
        required: false,
      },
    ],
  });

  // เช็ค user interactions สำหรับทุก news (หาก userId มี)
  let userInteractions: UserContentInteractionModel[] = [];
  if (userId) {
    const newsIds = news.map(newsItem => newsItem.id);
    userInteractions = await UserContentInteractionModel.findAll({
      where: {
        user_id: userId,
        content_id: { [Op.in]: newsIds },
        content_type: "news",
        interaction_type: "like",
      },
    });
  }

  const userLikedNewsIds = new Set(userInteractions.map(interaction => interaction.content_id));

  // ให้ default stats และ user_liked flag หากไม่มีข้อมูล
  return news.map((newsItem) => {
    const newsJson = newsItem.toJSON();
    if (!newsJson.stats) {
      newsJson.stats = { views: 0, likes: 0, dislikes: 0 };
    }
    
    return {
      ...newsJson,
      user_liked: userLikedNewsIds.has(newsItem.id),
    };
  });
};

export const getAllNewsManagement = async () => {
  return await NewsModel.findAll({
    order: [["updated_at", "DESC"]],
  });
};
