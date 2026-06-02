import { sequelize } from "../config/database";
import ContentStatsModel from "../models/ContentStatsModel";
import UserContentInteractionModel from "../models/UserContentInteractionModel";
import UserContentViewModel from "../models/UserContentView";

type ContentType = "event" | "news";
type InteractionType = "like" | "dislike";

/**
 * เพิ่มยอด view โดยเช็คจากฐานข้อมูลว่าเคยดูแล้วหรือยัง
 */
export const incrementView = async (
  contentType: ContentType,
  contentId: number,
  userId: number
) => {
  return sequelize.transaction(async (t) => {
    // 1. พยายามสร้าง "บันทึกการดู"
    const [viewRecord, created] = await UserContentViewModel.findOrCreate({
      where: {
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
      },
      transaction: t,
    });

    // 2. บวกยอดวิวก็ต่อเมื่อ "เพิ่งสร้างบันทึก" สำเร็จเท่านั้น
    if (created) {
      const [stats] = await ContentStatsModel.findOrCreate({
        where: { content_id: contentId, content_type: contentType },
        transaction: t,
      });
      await stats.increment("views", { by: 1, transaction: t });
      return { message: "View count incremented." };
    }

    // 3. ถ้าเจอ record เดิม (created = false) แปลว่าเคยดูแล้ว ไม่ต้องทำอะไร
    return { message: "User has already viewed this content." };
  });
};

/**
 * จัดการการกด Like/Dislike (Toggle Logic)
 */
export const toggleInteraction = async (
  contentType: ContentType,
  contentId: number,
  userId: number,
  newInteraction: InteractionType
) => {
  return sequelize.transaction(async (t) => {
    const [stats] = await ContentStatsModel.findOrCreate({
      where: { content_id: contentId, content_type: contentType },
      transaction: t,
    });

    const existingInteraction = await UserContentInteractionModel.findOne({
      where: {
        user_id: userId,
        content_id: contentId,
        content_type: contentType,
      },
      transaction: t,
    });

    const columnToUpdate = newInteraction === "like" ? "likes" : "dislikes";

    if (!existingInteraction) {
      await UserContentInteractionModel.create(
        {
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
          interaction_type: newInteraction,
        },
        { transaction: t }
      );
      await stats.increment(columnToUpdate, {
        by: 1,
        transaction: t,
      });
    } else if (existingInteraction.interaction_type === newInteraction) {
      await existingInteraction.destroy({ transaction: t });
      await stats.decrement(columnToUpdate, {
        by: 1,
        transaction: t,
      });
    } else {
      existingInteraction.interaction_type = newInteraction;
      await existingInteraction.save({ transaction: t });
      const oldInteractionColumn =
        newInteraction === "like" ? "dislikes" : "likes";
      await stats.decrement(oldInteractionColumn, { by: 1, transaction: t });
      await stats.increment(columnToUpdate, { by: 1, transaction: t });
    }

    const updatedStats = await ContentStatsModel.findByPk(stats.id, {
      transaction: t,
    });
    return updatedStats;
  });
};
