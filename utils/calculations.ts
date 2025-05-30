import { InventoryItem, UsageLogEntry, Category } from '../types';
import { getShortDate } from './formatters';

// Calculate total inventory value
export const calculateTotalInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Calculate today's inventory movements
export const calculateTodayMovements = (
  entries: UsageLogEntry[]
): { count: number; value: number } => {
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(
    (entry) => getShortDate(entry.createdAt) === today
  );
  const count = todayEntries.length;
  const value = todayEntries.reduce((total, entry) => total + entry.quantity, 0);
  
  return { count, value };
};

// Group usage logs by date
export const groupLogsByDate = (
  entries: UsageLogEntry[]
): { [date: string]: UsageLogEntry[] } => {
  return entries.reduce((groups, entry) => {
    const date = getShortDate(entry.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as { [date: string]: UsageLogEntry[] });
};

// Get top items by usage
export const getTopItems = (
  entries: UsageLogEntry[],
  items: InventoryItem[],
  limit: number = 5
): { id: string; name: string; usage: number }[] => {
  // Group by item ID and sum quantities
  const usageByItem = entries.reduce((acc, entry) => {
    if (!acc[entry.itemId]) {
      acc[entry.itemId] = 0;
    }
    acc[entry.itemId] += entry.quantity;
    return acc;
  }, {} as { [itemId: string]: number });

  // Convert to array, add names, and sort
  const itemUsages = Object.entries(usageByItem).map(([itemId, usage]) => {
    const item = items.find((i) => i.id === itemId);
    return {
      id: itemId,
      name: item ? item.name : 'Unknown Item',
      usage,
    };
  });

  // Sort by usage (descending) and take top N
  return itemUsages.sort((a, b) => b.usage - a.usage).slice(0, limit);
};

// Get usage by category
export const getUsageByCategory = (
  entries: UsageLogEntry[],
  items: InventoryItem[],
  categories: Category[]
): { id: string; name: string; usage: number }[] => {
  // Create map of item ID to category ID
  const itemCategoryMap = items.reduce((map, item) => {
    map[item.id] = item.categoryId;
    return map;
  }, {} as { [itemId: string]: string });

  // Group by category and sum quantities
  const usageByCategory = entries.reduce((acc, entry) => {
    const categoryId = itemCategoryMap[entry.itemId];
    if (categoryId) {
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += entry.quantity;
    }
    return acc;
  }, {} as { [categoryId: string]: number });

  // Convert to array, add names, and sort
  return Object.entries(usageByCategory)
    .map(([categoryId, usage]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        id: categoryId,
        name: category ? category.name : 'Unknown Category',
        usage,
      };
    })
    .sort((a, b) => b.usage - a.usage);
};

// Calculate daily usage for last N days
export const getDailyUsage = (
  entries: UsageLogEntry[],
  days: number = 7
): { date: string; usage: number }[] => {
  const result: { date: string; usage: number }[] = [];
  const now = new Date();
  
  // Initialize all days with zero usage
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    result.push({ date: dateString, usage: 0 });
  }
  
  // Fill in actual usage data
  entries.forEach(entry => {
    const date = getShortDate(entry.createdAt);
    const item = result.find(item => item.date === date);
    if (item) {
      item.usage += entry.quantity;
    }
  });
  
  return result;
};