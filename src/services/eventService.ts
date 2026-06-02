import { Op } from "sequelize";
import EventModel from "../models/EventsModel";
import { sendNotification } from "./notificationsService";
import { format, isSameDay } from "date-fns";
import { sequelize } from "../config/database";
import EventCreditModel from "../models/EventCreditModel";
import EventCreditTypeModel from "../models/EventCreditTypeModel";
import { Transaction } from "sequelize";
import ContentStatsModel from "../models/ContentStatsModel";
import UserContentInteractionModel from "../models/UserContentInteractionModel";

interface CreditInput {
  credit_type_id: number;
  score: number;
}

interface CreateEventInput {
  title: string;
  description: string;
  is_active: boolean;
  credits: CreditInput[];
  start_date?: string;
  end_date?: string;
  location?: string;
  image_url?: string;
  content?: string;
  role_tags?: string;
  max_participants?: number | null;
  url?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

// const TOPIC_NAME = "test-events" // FOR TEST
const TOPIC_NAME = "events";

const stripHtml = (html: string | null | undefined): string => {
  if (!html) return "";

  return html.replace(/<[^>]*>/g, "");
};

/**
 * @internal - Core function to create an event and its credits within a transaction.
 */
const _createEventInTransaction = async (
  data: CreateEventInput,
  createdBy: number,
  t: Transaction
): Promise<EventModel> => {
  const { title, description, is_active, credits, ...eventData } = data;

  const event = await EventModel.create(
    {
      ...eventData,
      title,
      description,
      is_active,
      created_by: createdBy,
      updated_by: createdBy,
    },
    { transaction: t }
  );

  if (credits && Array.isArray(credits) && credits.length > 0) {
    const creditRecords = credits.map((credit: CreditInput) => ({
      // ✅ Type for credit item
      event_id: event.id,
      credit_type_id: credit.credit_type_id,
      score: credit.score,
    }));
    await EventCreditModel.bulkCreate(creditRecords, { transaction: t });
  }

  return event;
};

/**
 * @internal - Helper function to build and send a notification for a created event.
 */
const _sendCreationNotification = async (
  event: EventModel,
  data: CreateEventInput,
  createdBy: number
): Promise<void> => {
  const notificationTitle = stripHtml(data.title);
  let notificationMessage = "";

  if (data.start_date && data.end_date) {
    const formattedStartDate = format(new Date(data.start_date), "d MMM yyyy");
    if (isSameDay(new Date(data.start_date), new Date(data.end_date))) {
      notificationMessage = `${formattedStartDate}\n${event.location}`;
    } else {
      const formattedEndDate = format(new Date(data.end_date), "d MMM yyyy");
      notificationMessage = `${formattedStartDate} - ${formattedEndDate}\n${event.location}`;
    }
  } else {
    notificationMessage = stripHtml(data.description || "");
  }

  await sendNotification({
    title: notificationTitle,
    message: notificationMessage,
    notification_type_id: 4,
    target_channel: "topic",
    target_value: TOPIC_NAME,
    created_by: createdBy,
    updated_by: createdBy,
    data: {
      eventId: event.id,
      topic: "Event update",
      action: "open_event",
    },
  });
};

/**
 * Service to create an event without sending a notification.
 */
export const createEvent = async (
  data: CreateEventInput,
  createdBy: number
): Promise<EventModel> => {
  try {
    const result = await sequelize.transaction(async (t: Transaction) => {
      return await _createEventInTransaction(data, createdBy, t);
    });
    return result;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

/**
 * Service to create an event and broadcast a notification if it's active.
 */
export const createEventAndBroadcast = async (
  data: CreateEventInput,
  createdBy: number
): Promise<EventModel> => {
  let createdEvent: EventModel;
  try {
    createdEvent = await sequelize.transaction(async (t: Transaction) => {
      return await _createEventInTransaction(data, createdBy, t);
    });

    if (createdEvent && data.is_active) {
      await _sendCreationNotification(createdEvent, data, createdBy);
    }

    return createdEvent;
  } catch (error) {
    console.error("Error creating event or sending notification:", error);
    throw error;
  }
};

// export const createEvent = async (
//   data: any,
//   createdBy: number
// ) => {
//   const { title, description, is_active, credits, ...eventData } = data

//   try {
//     const result = await sequelize.transaction(async (t) => {
//       const event = await EventModel.create({
//         ...eventData,
//         title,
//         description,
//         is_active,
//         created_by: createdBy,
//         updated_by: createdBy
//       }, { transaction: t })

//       if (credits && Array.isArray(credits) && credits.length > 0) {
//         const creditRecords = credits.map((credit: any) => ({
//           event_id: event.id,
//           credit_type_id: credit.credit_type_id,
//           score: credit.score
//         }))

//         await EventCreditModel.bulkCreate(creditRecords, { transaction: t })
//       }

//       return event
//     })

//     // if (result && is_active) {
//     //   const notificationTitle = stripHtml(title)
//     //   let notificationMessage = '';

//     //   if (data.start_date && data.end_date) {
//     //     const formattedStartDate = format(new Date(data.start_date), 'd MMM yyyy')
//     //     if (isSameDay(new Date(data.start_date), new Date(data.end_date))) {
//     //       notificationMessage = `${formattedStartDate}\n${result.location}`;
//     //     } else {
//     //       const formattedEndDate = format(new Date(data.end_date), 'd MMM yyyy')
//     //       notificationMessage = `${formattedStartDate} - ${formattedEndDate}\n${result.location}`;
//     //     }
//     //   } else {
//     //     notificationMessage = stripHtml(data.description || '');
//     //   }

//     //   await sendNotification({
//     //     title: notificationTitle,
//     //     message: notificationMessage,
//     //     target_channel: "topic",
//     //     target_value: TOPIC_NAME,
//     //     created_by: createdBy,
//     //     updated_by: createdBy,
//     //     data: {
//     //       eventId: result.id,
//     //       topic: "Event update",
//     //       action: "open_event"
//     //     }
//     //   })
//     // }

//     return result
//   } catch (error) {
//     console.error("Error creating event or sending notification:", error)
//     throw error
//   }
// }

export const broadcastEvent = async (
  id: number,
  updates: Partial<EventModel>,
  updatedBy: number
) => {
  const { title, is_active } = updates;

  if (is_active) {
    const event = await EventModel.findByPk(id);

    if (!event) {
      console.error(`Event with id ${id} not found.`);
      return;
    }

    let notificationMessage = "";

    if (event.start_date && event.end_date) {
      const formattedStartDate = format(event.start_date, "d MMM yyyy");

      if (isSameDay(event.start_date, event.end_date)) {
        notificationMessage = `${formattedStartDate}\n${event.location}`;
      } else {
        const formattedEndDate = format(event.end_date, "d MMM yyyy");
        notificationMessage = `${formattedStartDate} - ${formattedEndDate}\n${event.location}`;
      }
    } else {
      notificationMessage = stripHtml(event.description || "");
    }

    const notificationTitle = stripHtml(title || event.title);

    await sendNotification({
      title: notificationTitle,
      message: notificationMessage,
      notification_type_id: 4,
      target_channel: "topic",
      target_value: TOPIC_NAME,
      updated_by: updatedBy,
      data: {
        eventId: id,
        topic: "Event update",
        action: "open_event",
      },
    },);
  }
};

interface CreditEntry {
  credit_type_id: number;
  score: number;
}

interface UpdateEventData {
  credits?: CreditEntry[];
  [key: string]: any; // Allows for other event properties
}

export const updateEvent = async (
  id: number,
  updates: UpdateEventData,
  updatedBy: number
) => {
  const { credits: newCredits = [], ...eventUpdates } = updates;

  try {
    const result = await sequelize.transaction(async (t) => {
      const event = await EventModel.findByPk(id, { transaction: t });
      if (!event) {
        throw new Error("Event not found");
      }
      await event.update(
        { ...eventUpdates, updated_by: updatedBy },
        { transaction: t }
      );

      const existingCredits = await EventCreditModel.findAll({
        where: { event_id: id },
        transaction: t,
      });

      const existingCreditsMap = new Map(
        existingCredits.map((c) => [c.credit_type_id, c])
      );

      const newCreditsMap = new Map<number, CreditEntry>(
        newCredits.map((c) => [c.credit_type_id, c])
      );

      const creditsToAdd: CreditEntry[] = [];
      const creditsToUpdate: CreditEntry[] = [];
      const creditTypeIdsToDelete: number[] = [];

      for (const [typeId, credit] of existingCreditsMap.entries()) {
        if (!newCreditsMap.has(typeId)) {
          creditTypeIdsToDelete.push(typeId);
        }
      }

      for (const [typeId, newCredit] of newCreditsMap.entries()) {
        if (existingCreditsMap.has(typeId)) {
          const existingCredit = existingCreditsMap.get(typeId)!;
          if (
            parseFloat(String(existingCredit.score)) !==
            parseFloat(String(newCredit.score))
          ) {
            creditsToUpdate.push(newCredit);
          }
        } else {
          creditsToAdd.push(newCredit);
        }
      }

      if (creditTypeIdsToDelete.length > 0) {
        await EventCreditModel.destroy({
          where: { event_id: id, credit_type_id: creditTypeIdsToDelete },
          transaction: t,
        });
      }
      if (creditsToAdd.length > 0) {
        const records = creditsToAdd.map((c) => ({ ...c, event_id: id }));
        await EventCreditModel.bulkCreate(records, { transaction: t });
      }
      if (creditsToUpdate.length > 0) {
        await Promise.all(
          creditsToUpdate.map((c) =>
            EventCreditModel.update(
              { score: c.score },
              {
                where: { event_id: id, credit_type_id: c.credit_type_id },
                transaction: t,
              }
            )
          )
        );
      }

      return event;
    });

    return result;
  } catch (error) {
    console.error("Error updating event with credits (sync method):", error);
    throw error;
  }
};

export const deleteEvent = async (id: number, userId: number) => {
  const event = await EventModel.findByPk(id);
  if (!event) throw new Error("Event not found");
  return await event.update({ is_active: false, updated_by: userId });
};

export const getEventById = async (id: number, userId?: number) => {
  const event = await EventModel.findByPk(id, {
    include: [
      {
        model: EventCreditModel,
        as: "credits",
        attributes: ["score"],
        include: [
          {
            model: EventCreditTypeModel,
            as: "creditType",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: ContentStatsModel,
        as: "stats",
        attributes: ["views", "likes", "dislikes"],
      },
    ],
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const eventJson = event.toJSON();
  if (!eventJson.stats) {
    eventJson.stats = { views: 0, likes: 0, dislikes: 0 };
  }

  let userLiked = false;
  if (userId) {
    const userInteraction = await UserContentInteractionModel.findOne({
      where: {
        user_id: userId,
        content_id: id,
        content_type: "event",
        interaction_type: "like",
      },
    });
    userLiked = !!userInteraction;
  }

  return {
    ...eventJson,
    user_liked: userLiked,
  };
};

export const getAllEvents = async (userId?: number) => {
  const events = await EventModel.findAll({
    where: { is_active: true },
    order: [["created_at", "DESC"]],
    include: [
      {
        model: EventCreditModel,
        as: "credits",
        attributes: ["score"],
        include: [
          {
            model: EventCreditTypeModel,
            as: "creditType",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: ContentStatsModel,
        as: "stats",
        attributes: ["views", "likes", "dislikes"],
        required: false,
      },
    ],
  });

  // เช็ค user interactions สำหรับทุก event (หาก userId มี)
  let userInteractions: UserContentInteractionModel[] = [];
  if (userId) {
    const eventIds = events.map(event => event.id);
    userInteractions = await UserContentInteractionModel.findAll({
      where: {
        user_id: userId,
        content_id: { [Op.in]: eventIds },
        content_type: "event",
        interaction_type: "like",
      },
    });
  }

  const userLikedEventIds = new Set(userInteractions.map(interaction => interaction.content_id));

  // ให้ default stats และ user_liked flag หากไม่มีข้อมูล
  return events.map((event) => {
    const eventJson = event.toJSON();
    if (!eventJson.stats) {
      eventJson.stats = { views: 0, likes: 0, dislikes: 0 };
    }
    
    return {
      ...eventJson,
      user_liked: userLikedEventIds.has(event.id),
    };
  });
};

export const getAllEventsManagement = async () => {
  const events = await EventModel.findAll({
    include: [
      {
        model: EventCreditModel,
        as: "credits",
        attributes: ["score"],
        include: [
          {
            model: EventCreditTypeModel,
            as: "creditType",
            attributes: ["id", "name"],
          },
        ],
      },
    ],
    order: [["start_date", "DESC"]],
  });

  if (!events) {
    throw new Error("Events not found");
  }

  return events;
};

export const expiredOldEvents = async () => {
  const now = new Date();
  await EventModel.update(
    { is_active: false },
    {
      where: {
        start_date: { [Op.lt]: now },
        is_active: true,
      },
    }
  );
};
