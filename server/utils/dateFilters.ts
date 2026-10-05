/**
 * Date filtering utilities for consistent financial period calculations.
 * Avoids timezone discrepancy and UTC shifts by using consistent calendar dates.
 */

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayRange(referenceDate: Date = new Date()): DateRange {
  const dateStr = formatDate(referenceDate);
  return {
    startDate: dateStr,
    endDate: dateStr,
    label: 'Today'
  };
}

export function getYesterdayRange(referenceDate: Date = new Date()): DateRange {
  const d = new Date(referenceDate);
  d.setDate(d.getDate() - 1);
  const dateStr = formatDate(d);
  return {
    startDate: dateStr,
    endDate: dateStr,
    label: 'Yesterday'
  };
}

export function getCurrentWeekRange(referenceDate: Date = new Date()): DateRange {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 is Sunday
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
    label: 'This Week'
  };
}

export function getPreviousWeekRange(referenceDate: Date = new Date()): DateRange {
  const currentWeek = getCurrentWeekRange(referenceDate);
  const prevMon = new Date(currentWeek.startDate);
  prevMon.setDate(prevMon.getDate() - 7);
  const prevSun = new Date(prevMon);
  prevSun.setDate(prevMon.getDate() + 6);

  return {
    startDate: formatDate(prevMon),
    endDate: formatDate(prevSun),
    label: 'Last Week'
  };
}

export function getCurrentMonthRange(referenceDate: Date = new Date()): DateRange {
  const y = referenceDate.getFullYear();
  const m = referenceDate.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
    label: `${monthNames[m]} ${y}`
  };
}

export function getPreviousMonthRange(referenceDate: Date = new Date()): DateRange {
  const y = referenceDate.getFullYear();
  const m = referenceDate.getMonth();
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
    label: `${monthNames[firstDay.getMonth()]} ${firstDay.getFullYear()}`
  };
}

export function getCurrentYearRange(referenceDate: Date = new Date()): DateRange {
  const y = referenceDate.getFullYear();
  return {
    startDate: `${y}-01-01`,
    endDate: `${y}-12-31`,
    label: `${y}`
  };
}

export function getLast30DaysRange(referenceDate: Date = new Date()): DateRange {
  const end = new Date(referenceDate);
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 30);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
    label: 'Last 30 Days'
  };
}

/**
 * Resolves natural language date keywords into an exact date range.
 * Defaults to current month for general financial questions.
 */
export function resolveDateRange(queryText: string, referenceDate: Date = new Date()): DateRange {
  const q = queryText.toLowerCase();

  if (q.includes('today')) return getTodayRange(referenceDate);
  if (q.includes('yesterday')) return getYesterdayRange(referenceDate);
  if (q.includes('this week')) return getCurrentWeekRange(referenceDate);
  if (q.includes('last week') || q.includes('previous week')) return getPreviousWeekRange(referenceDate);
  if (q.includes('last month') || q.includes('previous month')) return getPreviousMonthRange(referenceDate);
  if (q.includes('last 30 days') || q.includes('past 30 days')) return getLast30DaysRange(referenceDate);
  if (q.includes('this year') || q.includes('annual')) return getCurrentYearRange(referenceDate);

  // Month names
  const months: { [name: string]: number } = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sept: 8, sep: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11
  };

  const currentYear = referenceDate.getFullYear();
  for (const [mName, mIndex] of Object.entries(months)) {
    // word boundary search
    const regex = new RegExp(`\\b${mName}\\b`, 'i');
    if (regex.test(q)) {
      const firstDay = new Date(currentYear, mIndex, 1);
      const lastDay = new Date(currentYear, mIndex + 1, 0);
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
        label: `${mName.charAt(0).toUpperCase() + mName.slice(1)} ${currentYear}`
      };
    }
  }

  // Default: Current Month
  return getCurrentMonthRange(referenceDate);
}

/**
 * Check if a date string (YYYY-MM-DD or ISO timestamp) falls within range inclusive
 */
export function isDateInRange(dateStr: string, range: { startDate: string; endDate: string }): boolean {
  if (!dateStr) return false;
  const target = dateStr.slice(0, 10);
  return target >= range.startDate && target <= range.endDate;
}
