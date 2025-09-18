// Utility functions for consistent date handling across the app

// Safely parse Date | string | number | Firestore Timestamp-like
export const parseToDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object') {
    try {
      if ('toDate' in value && typeof (value as any).toDate === 'function') {
        const d = (value as any).toDate();
        return d instanceof Date && !isNaN(d.getTime()) ? d : null;
      }
      const seconds = (value as any).seconds ?? (value as any)._seconds;
      const nanoseconds = (value as any).nanoseconds ?? (value as any)._nanoseconds ?? 0;
      if (typeof seconds === 'number') {
        return new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6));
      }
    } catch {}
  }
  return null;
};

export const formatDateTime = (value: any, locale?: string): string => {
  const d = parseToDate(value);
  return d ? d.toLocaleString(locale) : 'Not available';
};

export const formatDate = (value: any, locale?: string): string => {
  const d = parseToDate(value);
  return d ? d.toLocaleDateString(locale) : 'Not available';
};