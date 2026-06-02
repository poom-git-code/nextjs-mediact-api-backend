import EventCreditTypeModel from "../models/EventCreditTypeModel";

/**
 * Service to fetch all event credit types from the database.
 * @returns {Promise<EventCreditTypeModel[]>}
 */
export const getAllCreditTypes = async () => {
    try {
        const creditTypes = await EventCreditTypeModel.findAll({
            order: [['name', 'ASC']],
        });

        return creditTypes;
    } catch (error) {
        console.error("Error fetching credit types:", error);
        throw new Error("Failed to fetch credit types.");
    }
};