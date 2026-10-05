import { MarketStatus } from '../../src/types/market.ts';

/**
 * Standard Indian Market Trading Holidays (NSE / BSE Calendar)
 * Format: YYYY-MM-DD
 */
export const INDIAN_MARKET_HOLIDAYS_2026: Set<string> = new Set([
  '2026-01-26', // Republic Day
  '2026-03-04', // Holi
  '2026-03-20', // Id-Ul-Fitr
  '2026-04-03', // Good Friday
  '2026-04-14', // Dr. Ambedkar Jayanti
  '2026-05-01', // Maharashtra Day
  '2026-05-27', // Bakri Id
  '2026-08-15', // Independence Day
  '2026-09-04', // Janmashtami
  '2026-10-02', // Mahatma Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-11-08', // Diwali Balipratipada
  '2026-11-24', // Guru Nanak Jayanti
  '2026-12-25', // Christmas
]);

export interface MarketTimeDetails {
  status: MarketStatus;
  statusMessage: string;
  hoursNotice: string;
  istTime: string;
  isTradingDay: boolean;
  nextSessionText: string;
}

/**
 * Accurately determines Indian market status based on Asia/Kolkata timezone.
 * Regular trading session: Monday - Friday, 09:15 AM to 03:30 PM IST.
 * Pre-open session: Monday - Friday, 09:00 AM to 09:15 AM IST.
 */
export function getIndianMarketStatus(referenceDate: Date = new Date()): MarketTimeDetails {
  // Convert referenceDate to Asia/Kolkata representation
  const kolkataTimeString = referenceDate.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Example format: "10/05/2026, 13:45:00"
  const [datePart, timePart] = kolkataTimeString.split(', ');
  const [monthStr, dayStr, yearStr] = datePart.split('/');
  const [hourStr, minuteStr, secondStr] = timePart.split(':');

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const istDate = new Date(Date.UTC(year, month, day, hour, minute));
  const dayOfWeek = istDate.getUTCDay(); // 0 is Sunday, 6 is Saturday
  const dateKey = `${yearStr}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;

  const formattedIstTime = `${hourStr.padStart(2, '0')}:${minuteStr.padStart(2, '0')}:${secondStr.padStart(2, '0')} IST`;

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHoliday = INDIAN_MARKET_HOLIDAYS_2026.has(dateKey);

  if (isWeekend || isHoliday) {
    const reason = isHoliday ? 'Exchange Trading Holiday' : 'Weekend';
    return {
      status: 'CLOSED',
      statusMessage: `Market Closed (${reason})`,
      hoursNotice: 'Trading resumes on next business day at 09:15 AM IST',
      istTime: formattedIstTime,
      isTradingDay: false,
      nextSessionText: 'Next regular session: 09:15 AM IST'
    };
  }

  // Current time in minutes since midnight IST
  const currentMinutes = hour * 60 + minute;
  const preOpenStart = 9 * 60; // 09:00 AM = 540 min
  const marketOpen = 9 * 60 + 15; // 09:15 AM = 555 min
  const marketClose = 15 * 60 + 30; // 03:30 PM = 930 min

  if (currentMinutes >= marketOpen && currentMinutes < marketClose) {
    return {
      status: 'OPEN',
      statusMessage: 'Market Open (NSE / BSE)',
      hoursNotice: 'Regular Session 09:15 AM – 03:30 PM IST',
      istTime: formattedIstTime,
      isTradingDay: true,
      nextSessionText: 'Closes today at 03:30 PM IST'
    };
  }

  if (currentMinutes >= preOpenStart && currentMinutes < marketOpen) {
    return {
      status: 'PRE_OPEN',
      statusMessage: 'Pre-Open Session',
      hoursNotice: 'Pre-Open Order Collection (09:00 AM – 09:15 AM IST)',
      istTime: formattedIstTime,
      isTradingDay: true,
      nextSessionText: 'Regular trading starts in few minutes at 09:15 AM IST'
    };
  }

  if (currentMinutes < preOpenStart) {
    return {
      status: 'CLOSED',
      statusMessage: 'Market Closed (Pre-Market)',
      hoursNotice: 'Regular Session begins at 09:15 AM IST',
      istTime: formattedIstTime,
      isTradingDay: true,
      nextSessionText: 'Opens today at 09:15 AM IST (Pre-open 09:00 AM)'
    };
  }

  return {
    status: 'CLOSED',
    statusMessage: 'Market Closed (Post-Market)',
    hoursNotice: 'Regular Session ended at 03:30 PM IST',
    istTime: formattedIstTime,
    isTradingDay: true,
    nextSessionText: 'Next session tomorrow at 09:15 AM IST'
  };
}
