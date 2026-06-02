import AdsModel from "../models/AdsModel";
import AdPartnerModel from "../models/AdPartnerModel";
import CreditModel from "../models/CreditsModel";
import { Op, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import Decimal from "decimal.js";

// Service: Create or update credits (Purchase)
export const createCredits = async (
  data: {
    user_id: number;
    total_credits: number;
  },
  userId: number,
  transaction?: Transaction
) => {
  const { user_id, total_credits } = data;

  const options = {
    ...(transaction && { transaction })
  };

  const existingCredit = await CreditModel.findOne({
    where: { user_id },
    ...options
  });

  if (existingCredit) {
    existingCredit.total_credits += total_credits;
    existingCredit.updated_by = userId;

    await existingCredit.save(options);
    return existingCredit;
  }

  // Create new credit record
  const credit = await CreditModel.create({
    user_id,
    total_credits,
    used_credits: 0,
    created_by: userId,
    updated_by: userId,
  }, options);

  return credit;
};


// Get full credit information for a partner
export const getRemainingCredits = async (partnerId: number) => {
  const credit = await CreditModel.findOne({
    where: { user_id: partnerId },
  });

  if (!credit) {
    throw new Error("No credit record found for this partner");
  }

  return {
    credit_id: credit.id,
    user_id: credit.user_id,
    total_credits: credit.total_credits,
    used_credits: credit.used_credits,
    remaining_credits: credit.remaining_credits,
  };
};


// Deduct credits
export const deductCredits = async ({
  user_id,
  credits_to_deduct,
  updated_by,
}: {
  user_id: number;
  credits_to_deduct: number;
  updated_by: number;
}) => {
  const credit = await CreditModel.findOne({
    where: { user_id },
  });

  if (!credit) {
    throw new Error("No credit record found for this partner");
  }

  const remaining = credit.remaining_credits;

  if (remaining < credits_to_deduct) {
    throw new Error("Insufficient credits");
  }

  credit.used_credits += credits_to_deduct;
  credit.updated_by = updated_by;
  await credit.save();

  return credit;
};

export const getAllCredits = async () => {
  const credits = await CreditModel.findAll({
    include: [
      {
        model: AdPartnerModel,
        as: "partner",
        attributes: ["partner_name"],
      },
    ],
    order: [["created_at", "DESC"]]
  });

  return credits.map((credit) => ({
    id: credit.id,
    user_id: credit.user_id,
    partner: credit.partner?.partner_name || null,
    total_credits: credit.total_credits,
    used_credits: credit.used_credits,
    created_by: credit.created_by,
    created_at: credit.created_at,
    updated_by: credit.updated_by,
    updated_at: credit.updated_at,
  }));
};

export const getCreditById = async (id: number) => {
  const credit = await CreditModel.findOne({
    where: { id },
    include: [
      {
        model: AdPartnerModel,
        as: "partner",
        attributes: ["partner_name"],
      },
    ],
  });

  if (!credit) {
    throw new Error("Credit record not found");
  }

  return {
    id: credit.id,
    user_id: credit.user_id,
    partner: credit.partner?.partner_name || null,
    total_credits: credit.total_credits,
    used_credits: credit.used_credits,
    created_by: credit.created_by,
    created_at: credit.created_at,
    updated_by: credit.updated_by,
    updated_at: credit.updated_at,
  };
};

export const getRemainingCreditsByPartnerId = async (partner_id: number) => {
  // 1. ดึงข้อมูล credit ของ partner_id นี้
  const credit = await CreditModel.findOne({
    where: { user_id: partner_id },
    include: [
      {
        model: AdPartnerModel,
        as: "partner",
        attributes: ["partner_name"]
      }
    ]
  })

  if (!credit) {
    throw new Error("Credit record not found")
  }

  // 2. ดึง ad ทั้งหมดของ partner นี้
  const adSummary = await AdsModel.findOne({
    where: { partner_id },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('budget')), 'totalAllocated'],
      [sequelize.fn('SUM', sequelize.col('used_budgets')), 'totalConsumed']
    ],
    raw: true,
  }) as unknown as { totalAllocated?: number | string; totalConsumed?: number | string } | null;

  const totalAllocated = new Decimal(adSummary?.totalAllocated ?? 0);
  const totalConsumed = new Decimal(adSummary?.totalConsumed ?? 0);

  const totalCredits = new Decimal(credit.total_credits);

  const total_topup = totalCredits.toNumber();

  const total_allocated_to_ads = totalAllocated.toNumber();

  const available_for_new_ads_raw = totalCredits.minus(totalAllocated);
  const available_for_new_ads = available_for_new_ads_raw.lessThan(0)
    ? 0
    : available_for_new_ads_raw.toNumber();

  const total_consumed_from_ads = totalConsumed.toNumber();

  const remaining_in_ads_budget_raw = totalAllocated.minus(totalConsumed);
  const remaining_in_ads_budget = remaining_in_ads_budget_raw.lessThan(0)
    ? 0
    : remaining_in_ads_budget_raw.toNumber();

  return {
    partner_id,
    partner_name: credit.partner?.partner_name || null,
    total_topup,
    total_allocated_to_ads,
    available_for_new_ads,
    total_consumed_from_ads,
    remaining_in_ads_budget,
  };
};

export const updateAdBudget = async ({
  partner_id,
  ad_id,
  budget,
  updated_by,
}: {
  partner_id: number
  ad_id: number
  budget: number
  updated_by: number
}) => {

  return await sequelize.transaction(async (transaction) => {

    const credit = await CreditModel.findOne({
      where: { user_id: partner_id },
      transaction,
      lock: Transaction.LOCK.UPDATE
    })

    if (!credit) {
      throw new Error("Credit record not found")
    }

    const totalCredits = new Decimal(credit.total_credits);

    const currentAd = await AdsModel.findOne({
      where: { id: ad_id, partner_id },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!currentAd) {
      throw new Error("Ad not found")
    }

    const currentBudget = new Decimal(currentAd.budget ?? 0)
    const usedBudgets = new Decimal(currentAd.used_budgets);
    const amountToAdd = new Decimal(budget);

    const newTotalBudgetForThisAd = currentBudget.plus(amountToAdd);

    if (amountToAdd.isNegative() && newTotalBudgetForThisAd.lessThan(usedBudgets)) {
      throw new Error(
        `Cannot reduce budget. New budget (${newTotalBudgetForThisAd}) would be less than already used (${usedBudgets})`
      );
    }

    const result = await AdsModel.findOne({
      where: {
        partner_id,
        id: { [Op.ne]: ad_id }, // [Op.ne] = Not Equal
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('budget')), 'totalOtherBudgets']
      ],
      raw: true,
      transaction,
    }) as unknown as { totalOtherBudgets?: number | string } | null;

    const totalOtherBudgets = new Decimal(result?.totalOtherBudgets ?? 0);

    const newTotalAllocatedBudget = totalOtherBudgets.plus(newTotalBudgetForThisAd);

    if (newTotalAllocatedBudget.greaterThan(totalCredits)) {
      throw new Error(
        `Budget exceeds total credit. Total Credits: ${totalCredits}, New Total Allocated Budget: ${newTotalAllocatedBudget}`
      );
    }

    currentAd.budget = newTotalBudgetForThisAd.toNumber();
    currentAd.updated_by = updated_by;

    if (amountToAdd.isPositive() &&
      newTotalBudgetForThisAd.greaterThan(usedBudgets) &&
      currentAd.status === 'inactive') {
      currentAd.status = 'active';
    }

    await currentAd.save({ transaction });

    credit.used_credits = newTotalAllocatedBudget.toNumber();
    credit.updated_by = updated_by;
    await credit.save({ transaction });

    const remainingCredits = totalCredits.minus(newTotalAllocatedBudget);

    return {
      success: true,
      ad_id,
      added_budget: amountToAdd.toNumber(),
      new_total_budget: newTotalBudgetForThisAd.toNumber(),
      total_allocated_budget: newTotalAllocatedBudget.toNumber(),
      remaining_credit_after: remainingCredits.toNumber(),
    }
  })
}