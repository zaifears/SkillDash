/**
 * Date Formatting Utilities for Bangladesh Date Format (DD-MM-YYYY)
 */

/**
 * Format a date string or Date object to DD-MM-YYYY format
 * @param date - Date object or YYYY-MM-DD string
 * @returns Formatted date string in DD-MM-YYYY format
 */
export function formatDateToDDMMYYYY(date: Date | string): string {
  let day: number, month: number, year: number;

  if (typeof date === 'string') {
    // Parse YYYY-MM-DD format - use UTC to avoid timezone shifts
    const dateObj = new Date(date + 'T00:00:00Z');
    if (dateObj.toString() === 'Invalid Date') return '';
    day = dateObj.getUTCDate();
    month = dateObj.getUTCMonth() + 1;
    year = dateObj.getUTCFullYear();
  } else {
    // For Date objects, use local time (already in correct timezone)
    if (date.toString() === 'Invalid Date') return '';
    day = date.getDate();
    month = date.getMonth() + 1;
    year = date.getFullYear();
  }

  return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

/**
 * Get today's date in DD-MM-YYYY format in Bangladesh timezone
 * @returns Formatted date string in DD-MM-YYYY format
 */
export function getTodayFormatted(): string {
  const now = new Date();
  const bdTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  return formatDateToDDMMYYYY(bdTime);
}

/**
 * Format date with custom separator and locale
 * @param date - Date object or YYYY-MM-DD string
 * @param separator - Separator to use (default: '-')
 * @returns Formatted date string
 */
export function formatDateCustom(date: Date | string, separator: string = '-'): string {
  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date + 'T00:00:00Z');
  } else {
    dateObj = date;
  }

  if (dateObj.toString() === 'Invalid Date') {
    return '';
  }

  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();

  return `${day}${separator}${month}${separator}${year}`;
}

/**
 * Convert DD-MM-YYYY back to YYYY-MM-DD for API/database operations
 * @param dateStr - Date string in DD-MM-YYYY format
 * @returns Date string in YYYY-MM-DD format
 */
export function parseFromDDMMYYYY(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
