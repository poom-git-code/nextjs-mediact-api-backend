import FacilityModel from "../models/FacilitiesModel";

export interface SubscriptionFeatures {
    full_schedule: boolean | null;
    mediact_match: boolean | null;
}

export interface FacilitySubscription {
    facility_id: number;
    facility_name: string;
    features: SubscriptionFeatures;
}

/**
 * Get subscription features for a specific facility
 * @param facilityId The ID of the facility to check features for
 * @returns Promise<FacilitySubscription> Facility subscription details with features
 */
export const getFacilitySubscriptionFeatures = async (facilityId: number): Promise<FacilitySubscription> => {
    const facility = await FacilityModel.findByPk(facilityId, {
        attributes: ['id', 'name', 'full_schedule', 'mediact_match']
    });

    if (!facility) {
        throw new Error("Facility not found");
    }

    return {
        facility_id: facility.id,
        facility_name: facility.name,
        features: {
            full_schedule: facility.full_schedule,
            mediact_match: facility.mediact_match
        }
    };
};

/**
 * Check if a specific feature is available for a facility
 * @param facilityId The ID of the facility to check
 * @param feature The feature name to check ('full_schedule' | 'mediact_match')
 * @returns Promise<boolean> True if feature is available (true), false if disabled (false) or null
 */
export const checkFacilityFeatureAvailability = async (
    facilityId: number, 
    feature: 'full_schedule' | 'mediact_match'
): Promise<boolean> => {
    const facility = await FacilityModel.findByPk(facilityId, {
        attributes: ['id', feature]
    });

    if (!facility) {
        throw new Error("Facility not found");
    }

    // Return true only if feature is explicitly true, false otherwise (null or false)
    return facility[feature] === true;
};

/**
 * Get all facilities with their subscription features
 * @returns Promise<FacilitySubscription[]> List of all facilities with their subscription features
 */
export const getAllFacilitiesSubscriptionFeatures = async (): Promise<FacilitySubscription[]> => {
    const facilities = await FacilityModel.findAll({
        attributes: ['id', 'name', 'full_schedule', 'mediact_match'],
        where: { is_active: true },
        order: [['name', 'ASC']]
    });

    return facilities.map(facility => ({
        facility_id: facility.id,
        facility_name: facility.name,
        features: {
            full_schedule: facility.full_schedule,
            mediact_match: facility.mediact_match
        }
    }));
};