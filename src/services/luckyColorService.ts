import AuspiciousColorModel from "../models/LuckyColorModel";

interface DailyColorData {
  date: string;
  colors: {
    lucky: Array<{
      color_name: string | null;
      colors: string;
    }>;
    unlucky: Array<{
      color_name: string | null;
      colors: string;
    }>;
  };
}

/**
 * Calculate the number of days between two dates
 */
const calculateDayDifference = (
  targetDate: string,
  anchorDate: string
): number => {
  const target = new Date(targetDate);
  const anchor = new Date(anchorDate);
  const timeDiff = target.getTime() - anchor.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Get the number of days in a specific month and year
 */
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get colors for a specific group_id
 */
export const getColorsByGroupId = async (
  groupId: number
): Promise<{ lucky: any[]; unlucky: any[] }> => {
  const colors = await AuspiciousColorModel.findAll({
    where: { group_id: groupId },
    attributes: ["color_name", "colors", "type"],
  });

  const lucky = colors
    .filter((color) => color.type === "lucky")
    .map((color) => ({
      color_name: color.color_name,
      colors: color.colors,
    }));

  const unlucky = colors
    .filter((color) => color.type === "unlucky")
    .map((color) => ({
      color_name: color.color_name,
      colors: color.colors,
    }));

  return { lucky, unlucky };
};

/**
 * Get ALL colors grouped by group_id (for batch processing)
 * This loads all colors once and caches them
 */
const getAllColorsGrouped = async (): Promise<Map<number, { lucky: any[]; unlucky: any[] }>> => {
  // Load all colors at once
  const allColors = await AuspiciousColorModel.findAll({
    attributes: ["group_id", "color_name", "colors", "type"],
    order: [["group_id", "ASC"]],
  });

  // Group by group_id
  const groupedMap = new Map<number, { lucky: any[]; unlucky: any[] }>();

  for (const color of allColors) {
    const groupId = color.group_id;
    
    if (!groupedMap.has(groupId)) {
      groupedMap.set(groupId, { lucky: [], unlucky: [] });
    }

    const group = groupedMap.get(groupId)!;
    const colorData = {
      color_name: color.color_name,
      colors: color.colors,
    };

    if (color.type === "lucky") {
      group.lucky.push(colorData);
    } else if (color.type === "unlucky") {
      group.unlucky.push(colorData);
    }
  }

  return groupedMap;
};

/**
 * Get monthly lucky colors for a specific year and month (OPTIMIZED)
 */
export const getMonthlyLuckyColors = async (
  year: number,
  month: number
): Promise<DailyColorData[]> => {
  // Universal anchor point
  const anchorDate = "2025-09-28";
  const anchorIndex = 0;

  // Batch load all colors once
  const allColorsMap = await getAllColorsGrouped();

  // Get total days in the target month
  const daysInMonth = getDaysInMonth(year, month);
  const monthlyData: DailyColorData[] = [];

  // Loop through each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    // Create target date string (YYYY-MM-DD format)
    const targetDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    // Calculate day difference from anchor point
    const dayOffset = calculateDayDifference(targetDate, anchorDate);

    // Calculate current index using the robust formula
    const currentIndex = (((anchorIndex + dayOffset) % 10) + 10) % 10;

    // Get colors from pre-loaded map (no database query!)
    const colorsData = allColorsMap.get(currentIndex) || { lucky: [], unlucky: [] };

    // Add to monthly data
    monthlyData.push({
      date: targetDate,
      colors: colorsData,
    });
  }

  return monthlyData;
};

/**
 * Get today's lucky colors (optimized for single day)
 */
export const getTodayLuckyColors = async (
  year?: number,
  month?: number,
  day?: number
): Promise<DailyColorData> => {
  // Universal anchor point
  const anchorDate = "2025-09-28";
  const anchorIndex = 0;

  const currentDate = new Date();
  const targetYear = year ?? currentDate.getFullYear();
  const targetMonth = month ?? currentDate.getMonth() + 1;
  const targetDay = day ?? currentDate.getDate();

  // Create target date string (YYYY-MM-DD format)
  const targetDate = `${targetYear}-${targetMonth.toString().padStart(2, "0")}-${targetDay
    .toString()
    .padStart(2, "0")}`;

  // Calculate day difference from anchor point
  const dayOffset = calculateDayDifference(targetDate, anchorDate);

  // Calculate current index using the robust formula
  const currentIndex = (((anchorIndex + dayOffset) % 10) + 10) % 10;

  // Get colors for this group index
  const colorsData = await getColorsByGroupId(currentIndex);

  return {
    date: targetDate,
    colors: colorsData,
  };
};

/**
 * Get yearly lucky colors for a specific year (all 12 months) - OPTIMIZED
 */
export const getYearlyLuckyColors = async (
  year?: number
): Promise<{
  year: number;
  months: Array<{
    month: number;
    days: DailyColorData[];
  }>;
}> => {
  const currentDate = new Date();
  const targetYear = year ?? currentDate.getFullYear();

  // Universal anchor point
  const anchorDate = "2025-09-28";
  const anchorIndex = 0;

  // Batch load all colors ONCE for entire year
  const allColorsMap = await getAllColorsGrouped();

  const yearlyData: Array<{
    month: number;
    days: DailyColorData[];
  }> = [];

  // Loop through all 12 months
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = getDaysInMonth(targetYear, month);
    const monthlyData: DailyColorData[] = [];

    // Loop through each day
    for (let day = 1; day <= daysInMonth; day++) {
      const targetDate = `${targetYear}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;

      const dayOffset = calculateDayDifference(targetDate, anchorDate);
      const currentIndex = (((anchorIndex + dayOffset) % 10) + 10) % 10;

      // Get colors from pre-loaded map (no database query!)
      const colorsData = allColorsMap.get(currentIndex) || { lucky: [], unlucky: [] };

      monthlyData.push({
        date: targetDate,
        colors: colorsData,
      });
    }

    yearlyData.push({
      month,
      days: monthlyData,
    });
  }

  return {
    year: targetYear,
    months: yearlyData,
  };
};
