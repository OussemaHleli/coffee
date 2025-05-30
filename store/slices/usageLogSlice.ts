import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UsageLogEntry } from '../../types';

interface UsageLogState {
  entries: UsageLogEntry[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsageLogState = {
  entries: [
    {
      id: 'log1',
      itemId: 'item1',
      quantity: 2,
      previousQuantity: 17,
      note: 'Used for cappuccinos',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    },
    {
      id: 'log2',
      itemId: 'item2',
      quantity: 5,
      previousQuantity: 55,
      note: 'Morning rush',
      createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    },
    {
      id: 'log3',
      itemId: 'item3',
      quantity: 1,
      previousQuantity: 21,
      note: 'Customer request',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
  ],
  status: 'idle',
  error: null,
};

const usageLogSlice = createSlice({
  name: 'usageLogs',
  initialState,
  reducers: {
    addEntry: (state, action: PayloadAction<UsageLogEntry>) => {
      state.entries.push(action.payload);
    },
    removeEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(
        (entry) => entry.id !== action.payload
      );
    },
    setEntries: (state, action: PayloadAction<UsageLogEntry[]>) => {
      state.entries = action.payload;
    },
    setStatus: (
      state,
      action: PayloadAction<'idle' | 'loading' | 'succeeded' | 'failed'>
    ) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addEntry, removeEntry, setEntries, setStatus, setError } =
  usageLogSlice.actions;

export default usageLogSlice.reducer;