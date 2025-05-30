import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

const STORAGE_KEYS = {
  INVENTORY: 'coffee_inventory',
  CATEGORIES: 'coffee_categories',
  USAGE_LOGS: 'coffee_usage_logs',
  DAILY_NOTES: 'coffee_daily_notes',
  LAST_BACKUP: 'coffee_last_backup',
};

export const saveData = async (key: string, data: any): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

export const loadData = async (key: string): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

export const saveInventory = async (data: any): Promise<boolean> => {
  return saveData(STORAGE_KEYS.INVENTORY, data);
};

export const loadInventory = async (): Promise<any> => {
  return loadData(STORAGE_KEYS.INVENTORY);
};

export const saveCategories = async (data: any): Promise<boolean> => {
  return saveData(STORAGE_KEYS.CATEGORIES, data);
};

export const loadCategories = async (): Promise<any> => {
  return loadData(STORAGE_KEYS.CATEGORIES);
};

export const saveUsageLogs = async (data: any): Promise<boolean> => {
  return saveData(STORAGE_KEYS.USAGE_LOGS, data);
};

export const loadUsageLogs = async (): Promise<any> => {
  return loadData(STORAGE_KEYS.USAGE_LOGS);
};

export const saveDailyNotes = async (data: any): Promise<boolean> => {
  return saveData(STORAGE_KEYS.DAILY_NOTES, data);
};

export const loadDailyNotes = async (): Promise<any> => {
  return loadData(STORAGE_KEYS.DAILY_NOTES);
};

export const createBackup = async (): Promise<boolean> => {
  try {
    // Get all data
    const inventory = await loadInventory();
    const categories = await loadCategories();
    const usageLogs = await loadUsageLogs();
    const dailyNotes = await loadDailyNotes();

    // Create backup key with date
    const today = format(new Date(), 'yyyy-MM-dd');
    const backupKey = `backup_${today}`;

    // Save backup
    await saveData(backupKey, {
      inventory,
      categories,
      usageLogs,
      dailyNotes,
      timestamp: new Date().toISOString(),
    });

    // Update last backup timestamp
    await saveData(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Backup failed:', error);
    return false;
  }
};

export const getLastBackupTime = async (): Promise<string | null> => {
  return loadData(STORAGE_KEYS.LAST_BACKUP);
};

export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};