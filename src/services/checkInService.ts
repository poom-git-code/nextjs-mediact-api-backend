import UserPoints from "../models/userPointsModel";
import UserDailyCheckins from "../models/userDailyCheckinsModel";
import BonusDays from "../models/bonusDaysModel";
import CheckInLogs from "../models/checkInLogsModel";
import { Op } from "sequelize";

export const checkBonusToday = async (date: Date) => {
  const bonusDay = await BonusDays.findOne({
    where: {
      bonus_date: date,
    },
  });
  return bonusDay;
};

export const handleCheckIn = async (userId: number) => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  
  // ✅ คำนวณ weekday จาก date string เพื่อหลีกเลี่ยง locale issues
  const dateObj = new Date(dateStr + 'T00:00:00Z'); // ใช้ UTC เพื่อหลีกเลี่ยง timezone offset
  const weekdayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const weekday = weekdayMap[dateObj.getUTCDay()];

  // Check for fixed bonus days - ใช้ SQL DATE function เพื่อเปรียบเทียบเฉพาะวันที่
  const fixedBonus = await BonusDays.findOne({
    where: { 
      bonus_date: dateStr,
      is_recurring: false 
    },
  });

  // Check for recurring bonus days
  const recurringBonus = await BonusDays.findOne({
    where: { weekday: weekday, is_recurring: true },
  });

  const bonus = fixedBonus || recurringBonus;
  const isBonusDay = !!bonus;
  const bonusPoints = isBonusDay ? bonus.bonus_points : 0;

  const checkIn = await UserDailyCheckins.create({
    user_id: userId,
    check_in_date: today,
    points_earned: 10,
    is_bonus_day: isBonusDay,
    bonus_points: bonusPoints,
  });

  const userPoints = await UserPoints.findOne({ where: { user_id: userId } });
  if (userPoints) {
    userPoints.total_points += 10 + bonusPoints;
    userPoints.total_bonus_points += bonusPoints;
    userPoints.last_check_in = today;
    await userPoints.save();
  }

  await CheckInLogs.create({
    user_id: userId,
    action: "check-in",
    description: isBonusDay
      ? `เช็คอินวันพิเศษ ได้ 10 + ${bonusPoints} แต้ม`
      : "เช็คอินปกติ ได้ 10 แต้ม",
    metadata: { bonusPoints, isBonusDay },
  });

  return checkIn;
};

export const getCheckInStats = async (userId: number) => {
  const userPoints = await UserPoints.findOne({ where: { user_id: userId } });
  const totalCheckIns = await UserDailyCheckins.count({
    where: { user_id: userId },
  });

  return {
    totalPoints: userPoints?.total_points || 0,
    totalBonusPoints: userPoints?.total_bonus_points || 0,
    currentStreak: userPoints?.current_streak || 0,
    maxStreak: userPoints?.max_streak || 0,
    totalCheckIns,
  };
};

export const getCheckInCalendar = async (userId: number, year?: number) => {
  const currentDate = new Date();
  const targetYear = year || currentDate.getFullYear();

  // Build range covering previous year, target year, and next year
  const years = [targetYear - 1, targetYear, targetYear + 1];
  const startDate = new Date(`${years[0]}-01-01`);
  const endDate = new Date(`${years[years.length - 1] + 1}-01-01`);

  // ดึงข้อมูล check-ins ทั้งปี
  const checkIns = await UserDailyCheckins.findAll({
    where: {
      user_id: userId,
      check_in_date: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    },
    order: [["check_in_date", "ASC"]],
  });

  // ดึงข้อมูล bonus days ทั้งปี
  const bonusDays = await BonusDays.findAll({
    where: {
      [Op.or]: [
        {
          bonus_date: {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
          },
        }, // Fixed Bonus Days within 3-year range
        { is_recurring: true }, // Recurring Bonus Days
      ],
    },
  });

  // สร้าง bonus days list สำหรับช่วง 3 ปี (previous, target, next)
  const bonusDaysList = bonusDays
    .map((bonusDay) => {
      if (bonusDay.bonus_date) {
        // Fixed bonus day: normalize date string and include if within our years
        let bonusDateString: string;
        const rawDate = bonusDay.bonus_date as any;

        if (typeof rawDate === "string") {
          bonusDateString = rawDate.split("T")[0];
        } else if (rawDate instanceof Date) {
          bonusDateString = rawDate.toISOString().split("T")[0];
        } else {
          bonusDateString = new Date(rawDate).toISOString().split("T")[0];
        }

        const yearFromDate = parseInt(bonusDateString.split("-")[0]);
        if (years.includes(yearFromDate)) {
          return {
            date: bonusDateString,
            bonusPoints: bonusDay.bonus_points,
            description: bonusDay.description,
          };
        }
        return null;
      } else {
        // Recurring bonus day: generate dates for each year in range
        const weekdayIndex = [
          "sun",
          "mon",
          "tue",
          "wed",
          "thu",
          "fri",
          "sat",
        ].indexOf(bonusDay.weekday);

        const recurringDates: any[] = [];
        for (const y of years) {
          for (let month = 0; month < 12; month++) {
            const daysInMonth = new Date(y, month + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
              const dateObj = new Date(y, month, day);
              if (dateObj.getDay() === weekdayIndex) {
                const dateString = `${y}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                recurringDates.push({
                  date: dateString,
                  bonusPoints: bonusDay.bonus_points,
                  description: bonusDay.description,
                });
              }
            }
          }
        }
        return recurringDates;
      }
    })
    .flat()
    .filter(Boolean);

  // สร้าง monthly buckets สำหรับแต่ละปีในช่วง (previous, target, next)
  const monthlyBuckets: Record<string, any> = {};
  for (const y of years) {
    for (let month = 0; month < 12; month++) {
      const monthKey = `${y}-${String(month + 1).padStart(2, "0")}`;
      monthlyBuckets[monthKey] = {
        month: monthKey,
        checkInCount: 0,
        checkIns: [],
      };
    }
  }

  // แยก check-ins ตามเดือน ในช่วง 3 ปี
  checkIns.forEach((checkIn) => {
    let checkInDateString: string;
    const rawDate = checkIn.check_in_date as any;

    if (typeof rawDate === "string") {
      checkInDateString = rawDate.split("T")[0];
    } else if (rawDate instanceof Date) {
      checkInDateString = rawDate.toISOString().split("T")[0];
    } else {
      checkInDateString = new Date(rawDate).toISOString().split("T")[0];
    }

    const [y, m] = checkInDateString.split("-");
    const monthKey = `${y}-${m}`;

    if (monthlyBuckets[monthKey]) {
      monthlyBuckets[monthKey].checkInCount++;
      monthlyBuckets[monthKey].checkIns.push({
        date: checkInDateString,
        pointsEarned: checkIn.points_earned,
        isBonusDay: checkIn.is_bonus_day,
        bonusPoints: checkIn.bonus_points,
      });
    }
  });

  // แปลงเป็น array และจัดกลุ่มเป็นปีๆ
  const calendarPerYear = years.map((y) => {
    const months = Object.keys(monthlyBuckets)
      .filter((k) => k.startsWith(String(y)))
      .sort()
      .map((k) => monthlyBuckets[k]);
    return { year: y, months };
  });

  // คืนค่าในรูปแบบเดียวกับเดิม (key `calendar`) แต่เป็นข้อมูล 3 ปี
  return { calendar: calendarPerYear, bonusDays: bonusDaysList };
};
