import { format, parseISO } from 'date-fns';

// Format currency in Tunisian Dinar (TND)
export const formatCurrency = (amount: number): string => {
  return amount.toFixed(3) + ' TND';
};

// Format date to readable format
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return dateString;
  }
};

// Format time to readable format
export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  } catch (error) {
    return '';
  }
};

// Format date and time
export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy - h:mm a');
  } catch (error) {
    return dateString;
  }
};

// Get short date (for grouping)
export const getShortDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    return dateString;
  }
};

// Format quantity with unit
export const formatQuantity = (quantity: number, unit: string): string => {
  return `${quantity} ${unit}`;
};