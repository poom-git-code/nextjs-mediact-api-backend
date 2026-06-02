import AdsModel from '../models/AdsModel';
import AdMediaModel from '../models/AdMediaModel';
import AdImpressionModel from '../models/AdImpressionsModel';
import { Op, Sequelize } from 'sequelize';
import AdTargetModel from '../models/AdTargetsModel';
import UserModel from '../models/UserModel';
import GenderModel from '../models/GenderModel';
import RoleModel from '../models/RolesModel';
import UserRoleModel from '../models/UserRolesModel';
import AddressModel from '../models/AddressesModel';

// Create ad media
export const createAdMedia = async (data: any, userId: number) => {
    return await AdMediaModel.create({
        ...data,
        created_by: userId,
        updated_by: userId,
    });
};

// Get ad media by ID
export const getAdMediaById = async (id: number) => {
    const media = await AdMediaModel.findByPk(id);
    if (!media) {
        throw new Error('Ad media not found');
    }
    return media;
};

// Get all media by ad_id
export const getAdMediaByAdId = async (adId: number) => {
    return await AdMediaModel.findAll({
        where: { ad_id: adId },
    });
};

// Update ad media by ID
export const updateAdMedia = async (id: number, data: any, userId: number) => {
    const media = await AdMediaModel.findByPk(id);
    if (!media) {
        throw new Error('Ad media not found');
    }

    await media.update({
        ...data,
        updated_by: userId
    });
    return media;
};

// ดึงรายการ media ทั้งหมด
export const getAllAdMedia = async () => {
    return await AdMediaModel.findAll();
};

export const deleteAdMedia = async (id: number, userId: number) => {
    const media = await AdMediaModel.findByPk(id);
    if (!media) throw new Error('Ad media not found.');
    return await media.update({
        is_active: false,
        updated_by: userId,
    });
};

export const getAllActiveAdMediaWithAdUrl = async () => {
    const results = await AdMediaModel.findAll({
        where: { is_active: true },
        attributes: ['id', 'ad_id', 'media_url'],
        include: [
            {
                model: AdsModel,
                as: 'ad',
                attributes: ['url']
            }
        ]
    })

    return results.map((item) => ({
        id: item.id,
        ad_id: item.ad_id,
        media_url: item.media_url,
        url: item.ad?.url ?? null
    }))
}

// ฟังก์ชันช่วยสุ่มแบบ weighted
function weightedRandomChoice<T>(items: { item: T; weight: number }[]): T {
    // console.log("[DEBUG] Items: ", items)
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    // console.log("[DEBUG] Total weight: ", totalWeight)
    let random = Math.random() * totalWeight;
    // console.log("[DEBUG] Random: ", random)
    for (const i of items) {
        if (random < i.weight) return i.item;
        random -= i.weight;
    }
    return items[items.length - 1].item; // fallback
}

export const getWeightedRandomAdMedia = async () => {
    // 1. ดึง ad_media ทั้งหมดที่ active พร้อม ads ที่ active
    const allActiveMedia = await AdMediaModel.findAll({
        where: { is_active: true },
        include: [
            {
                model: AdsModel,
                as: "ad",
                where: { status: "active" },
                attributes: ["id", "url"],
            },
        ],
        attributes: ["id", "ad_id", "media_url"],
    });
    // console.log("[DEBUG] All active media: ", allActiveMedia)

    if (!allActiveMedia.length) return null;

    // 2. ดึง impression count สำหรับแต่ละ ad_id
    const adImpressionCounts = await AdImpressionModel.findAll({
        attributes: [
            "ad_id",
            [Sequelize.fn("COUNT", Sequelize.col("id")), "impression_count"],
        ],
        group: ["ad_id"],
        raw: true,
    });

    const adImpressionMap = new Map<number, number>();
    adImpressionCounts.forEach((row: any) => {
        adImpressionMap.set(row.ad_id, Number(row.impression_count));
    });
    // console.log("[DEBUG] Ad impression count: ", adImpressionCounts)

    // 3. เลือก ad_id ที่ weight มากกว่า (น้อยคนเห็น)
    const adWeights = new Map<number, number>();
    for (const media of allActiveMedia) {
        const adId = media.ad_id;
        if (!adWeights.has(adId)) {
            const count = adImpressionMap.get(adId) ?? 0;
            adWeights.set(adId, 1 / (count + 1));
        }
    }
    // console.log("[DEBUG] Ad weight: ", adWeights)

    // 4. เลือก ad_id จาก weight
    const uniqueAds = Array.from(adWeights.entries()).map(([ad_id, weight]) => ({
        item: ad_id,
        weight,
    }));
    const selectedAdId = weightedRandomChoice(uniqueAds);
    // console.log("[DEBUG] Selected ad id: ", selectedAdId)

    // 5. filter media เฉพาะ ad_id ที่เลือก
    const mediaForAd = allActiveMedia.filter(
        (media) => media.ad_id === selectedAdId
    );
    // console.log("[DEBUG] Media for ad: ", mediaForAd)

    // 6. ดึง impression count สำหรับแต่ละ media_id ภายใต้ ad_id นี้
    const mediaIds = mediaForAd.map((m) => m.id);
    const mediaImpressionCounts = await AdImpressionModel.findAll({
        where: {
            ad_media_id: { [Op.in]: mediaIds },
        },
        attributes: [
            "ad_media_id",
            [Sequelize.fn("COUNT", Sequelize.col("id")), "impression_count"],
        ],
        group: ["ad_media_id"],
        raw: true,
    });

    const mediaImpressionMap = new Map<number, number>();
    mediaImpressionCounts.forEach((row: any) => {
        mediaImpressionMap.set(row.ad_media_id, Number(row.impression_count));
    });
    // console.log("[DEBUG] Media impression count: ", mediaImpressionCounts)

    // 7. สร้าง weight แล้วสุ่ม media
    const mediaWeights = mediaForAd.map((media) => ({
        item: media,
        weight: 1 / ((mediaImpressionMap.get(media.id) ?? 0) + 1),
    }));

    const selectedMedia = weightedRandomChoice(mediaWeights);
    // console.log("[DEBUG] Selected media: ", selectedMedia)

    return {
        id: selectedMedia.id,
        ad_id: selectedMedia.ad_id,
        media_url: selectedMedia.media_url,
        url: selectedMedia.ad?.url ?? null,
    };
};

export const getSortedActiveAdMediaByImpression = async () => {
    // 1. ดึง ad_media ที่ active และมี ads ที่ active
    const allActiveMedia = await AdMediaModel.findAll({
        where: { is_active: true },
        include: [
            {
                model: AdsModel,
                as: 'ad',
                where: { status: 'active' },
                attributes: ['id', 'url'],
            },
        ],
        attributes: ['id', 'ad_id', 'media_url'],
        raw: true,
        nest: true,
    });

    if (!allActiveMedia.length) return [];

    const mediaIds = allActiveMedia.map((media) => media.id);

    // 2. นับจำนวน impression ต่อ media
    const mediaImpressionCounts = await AdImpressionModel.findAll({
        where: {
            ad_media_id: { [Op.in]: mediaIds },
        },
        attributes: [
            'ad_media_id',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'impression_count'],
        ],
        group: ['ad_media_id'],
        raw: true,
    });

    // 3. สร้าง map ของจำนวนการเห็น
    const impressionMap = new Map<number, number>();
    mediaImpressionCounts.forEach((row: any) => {
        impressionMap.set(row.ad_media_id, Number(row.impression_count));
    });

    // 4. รวมข้อมูลพร้อมจำนวนการเห็น
    const mediaWithCount = allActiveMedia.map((media) => ({
        id: media.id,
        ad_id: media.ad_id,
        media_url: media.media_url,
        url: media.ad?.url ?? null,
        impressions: impressionMap.get(media.id) ?? 0,
    }));

    // 5. เรียงจากน้อยไปมาก
    return mediaWithCount.sort((a, b) => a.impressions - b.impressions);
};

export const getAdMediaFilterByTarget = async (userId: number) => {
    // console.log("User ID: ", userId)
    const user = await UserModel.findByPk(userId, {
        include: [
            { model: GenderModel, as: 'user_gender' },
            { model: UserRoleModel, as: 'user_role' }
        ]
    })

    if (!user) throw new Error('User not found')

    const activeTargets = await AdTargetModel.findAll({
        where: { is_active: true }
    })

    const adTargetMap = new Map<number, { type: string; value: string }[]>()

    for (const target of activeTargets) {
        if (!adTargetMap.has(target.ad_id)) {
            adTargetMap.set(target.ad_id, [])
        }
        adTargetMap.get(target.ad_id)?.push({
            type: target.target_type ?? '',
            value: (target.target_value ?? '').toLowerCase()
        })
    }
    // console.log('[DEBUG] Ad target Map: ', adTargetMap)

    type AdImpressionCountRow = {
        ad_id: number
        impressionCount: string
    }

    const adImpressions = await AdImpressionModel.findAll({
        attributes: [
            'ad_id',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'impressionCount']
        ],
        group: ['ad_id'],
        raw: true
    }) as unknown as AdImpressionCountRow[]

    const impressionMap = new Map<number, number>()

    for (const row of adImpressions) {
        impressionMap.set(row.ad_id, parseInt(row.impressionCount, 10))
    }

    const matchedAdScores: { adId: number; score: number; impressions: number }[] = []

    const THRESHOLD = 0.6

    for (const [adId, targets] of adTargetMap.entries()) {
        const grouped = targets.reduce((acc, cur) => {
            if (!acc[cur.type]) acc[cur.type] = []
            acc[cur.type].push(cur.value)
            return acc
        }, {} as Record<string, string[]>)

        let matchedCount = 0
        const totalTypes = Object.keys(grouped).length

        for (const type of Object.keys(grouped)) {
            switch (type) {
                case 'gender': {
                    const genderName = user.user_gender?.name.toLowerCase()
                    if (genderName && grouped.gender.includes(genderName)) {
                        matchedCount++
                    }
                    break
                }
                case 'age_range': {
                    if (user.date_of_birth) {
                        const userAge = getAgeFromDate(user.date_of_birth)
                        const isAgeMatched = grouped.age_range.some(ageRange => {
                            const [minAge, maxAge] = ageRange.split('-').map(Number)
                            return userAge >= minAge && userAge <= maxAge
                        })
                        if (isAgeMatched) matchedCount++
                    }
                    break
                }
                case 'location': {
                    const address = await AddressModel.findOne({
                        where: { reference_id: user.id, is_active: true },
                        order: [['id', 'DESC']],
                    })
                    const userProvince = address?.province?.toLowerCase()
                    const locationMatched = userProvince && grouped.location.includes(userProvince)
                    if (locationMatched) matchedCount++
                    break
                }
                case 'occupation': {
                    const userRole = Array.isArray(user.user_role) ? user.user_role.find(r => r.is_active) : null
                    const roleId = userRole?.role_id
                    const role = roleId ? await RoleModel.findByPk(roleId) : null
                    const roleName = role?.name.toLowerCase()
                    const occupationMatched = roleName && grouped.occupation.includes(roleName)
                    if (occupationMatched) matchedCount++
                    break
                }
            }
        }

        const matchScore = matchedCount / totalTypes
        if (matchScore >= THRESHOLD) {
            // console.log(`[DEBUG] Ad ID: ${adId} passed with matchScore = ${matchScore}`)
            matchedAdScores.push({
                adId,
                score: matchScore,
                impressions: impressionMap.get(adId) ?? 0
            })
        } else {
            // console.log(`[DEBUG] Ad ID: ${adId} skipped, matchScore = ${matchScore}`)
        }
    }

    const matchedAdIds = matchedAdScores
        // .sort((a, b) => b.score - a.score)
        // .map(a => a.adId)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score
            }
            return a.impressions - b.impressions
        })
        .map(a => a.adId)

    // console.log(`[DEBUG] Matched ad ID: `, matchedAdIds)

    const adRankMap = new Map<number, number>()
    matchedAdIds.forEach((adId, index) => {
        adRankMap.set(adId, index)
    })

    const ads = await AdMediaModel.findAll({
        where: { is_active: true, ad_id: matchedAdIds },
        include: [
            {
                model: AdsModel,
                as: 'ad',
                where: { status: 'active' },
                attributes: ['id', 'url'],
            },
        ],
        attributes: ['id', 'ad_id', 'media_url'],
        raw: true,
        nest: true,
    })

    // จับกลุ่มตาม ad_id
    const adMediaGrouped = new Map<number, any[]>()
    for (const ad of ads) {
        if (!adMediaGrouped.has(ad.ad_id)) {
            adMediaGrouped.set(ad.ad_id, [])
        }
        adMediaGrouped.get(ad.ad_id)?.push(ad)
    }

    // เลือก media สุ่ม 1 ตัวต่อ ad_id
    const randomOneFromEachAdId: any[] = []
    for (const adId of matchedAdIds) {
        const mediaList = adMediaGrouped.get(adId)
        if (mediaList && mediaList.length > 0) {
            const randomIndex = Math.floor(Math.random() * mediaList.length)
            randomOneFromEachAdId.push(mediaList[randomIndex])
        }
    }

    // คืนค่าตามลำดับของ matchedAdIds พร้อมสุ่ม ad_media แค่ตัวเดียวจากแต่ละ ad_id
    return randomOneFromEachAdId.map((media) => ({
        id: media.id,
        ad_id: media.ad_id,
        media_url: media.media_url,
        url: media.ad?.url ?? null,
        impressions: impressionMap.get(media.ad_id) ?? 0
    }))
}

function getAgeFromDate(dateOfBirth: Date): number {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m == 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}