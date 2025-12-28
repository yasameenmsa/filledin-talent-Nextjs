export const formatDate = (date: Date | string | number | undefined | null, locale: string): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};



export const formatCurrency = (value: number, locale: string, currency: string): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
};