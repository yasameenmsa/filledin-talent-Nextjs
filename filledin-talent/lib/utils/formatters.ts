export const formatDate = (date: Date, locale: string): string => {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export const formatNumber = (value: number, locale: string, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

export const formatCurrency = (value: number, locale: string, currency: string): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
};