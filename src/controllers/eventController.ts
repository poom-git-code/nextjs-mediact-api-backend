import { Context } from "koa";
// import * as EventService from "../services/eventService";
import * as EventService from "../services/eventService";
import { createEventSchema, updateEventSchema } from "../validations/eventValidation";
import RoleModel from "../models/RolesModel";
import { Op } from "sequelize";

export const createEvent = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createEventSchema.validate(data);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const event = await EventService.createEvent(value, userId);
    ctx.status = 201;
    ctx.body = { message: "Event created successfully", event };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const createEventAndBroadcast = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createEventSchema.validate(data);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const event = await EventService.createEventAndBroadcast(value, userId);

    ctx.status = 201;
    ctx.body = { message: "Event created and broadcast successfully", event };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const broadcastEvent = async (ctx: Context) => {
  const { id } = ctx.params
  const broadcastData = ctx.request.body

  const userId = ctx.state.user?.id
  if (!userId) {
    ctx.status = 401
    ctx.body = { error: "Unauthorized: User ID not found in token" }
    return
  }

  try {
    await EventService.broadcastEvent(
      parseInt(id, 10),
      broadcastData,
      userId
    )

    ctx.status = 200
    ctx.body = { message: "Event broadcast notification has been sent successfully." }
  } catch (error) {
    ctx.status = 500;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "An unknown error occurred while broadcasting the event." };
    }
  }
}

export const updateEvent = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;

  const { error, value } = updateEventSchema.validate(updates);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const updatedEvent = await EventService.updateEvent(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { message: "Event updated successfully", updatedEvent };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const deleteEvent = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    await EventService.deleteEvent(Number(ctx.params.id), userId);
    ctx.body = { message: "Event deleted successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getEventById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const userId = ctx.state.user?.id; // ดึง userId จาก authentication
    const event = await EventService.getEventById(parseInt(id, 10), userId);
    ctx.body = { event };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAllEvents = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id; // ดึง userId จาก authentication
    const events = await EventService.getAllEvents(userId);
    ctx.body = { events };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAllEventsManagement = async (ctx: Context) => {
  try {
    const events = await EventService.getAllEventsManagement();

    const roleIds = new Set<number>();
    events.forEach(event => {
      if (event.role_tags) {
        event.role_tags.split(',').forEach(idStr => {
          const id = parseInt(idStr.trim(), 10);
          if (!isNaN(id)) {
            roleIds.add(id)
          }
        });
      }
    });

    const roles = await RoleModel.findAll({
      where: {
        id: {
          [Op.in]: [...roleIds]
        }
      },
      attributes: ['id', 'name']
    });

    const roleMap = new Map<number, string>();
    roles.forEach(role => {
      roleMap.set(role.id, role.name)
    });

    const results = events.map(event => {
      const roleNames: string[] = [];
      if (event.role_tags) {
        event.role_tags.split(',').forEach(idStr => {
          const id = parseInt(idStr.trim(), 10);
          const name = roleMap.get(id);
          if (name) {
            roleNames.push(name);
          }
        });
      }

      return {
        ...event.toJSON(),
        role_names: roleNames,
      };
    });

    ctx.body = { events: results };

  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};