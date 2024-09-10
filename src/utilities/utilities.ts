export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const daysBetween = (date1String: string, date2String: string) => {
  const d1: any = new Date(date1String);
  const d2: any = new Date(date2String);
  return Math.floor((d2 - d1) / (1000 * 3600 * 24));
}

export const expensesPerMonth = (totalAmount: number, startDate: string, endDate: string): string => {
  const days = daysBetween(startDate, endDate);
  return formatCurrency(totalAmount / (days / 30));
}

export const roundTo = (num: number, precision: number): number => {
  const factor = Math.pow(10, precision)
  return Math.round(num * factor) / factor
}

export const getRetirementDate = (): string => {
  const date = new Date(2024, 3, 5)
  return getISODateString(date);
}

export const getISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getCurrentDate = (): string => {
  const now = new Date();
  return getISODateString(now);
};

export const getFirstDayOfCurrentYear = (): string => {
  const now = new Date();
  const firstDayOfCurrentYear = new Date(now.getFullYear(), 0, 1);
  return getISODateString(firstDayOfCurrentYear);
};


