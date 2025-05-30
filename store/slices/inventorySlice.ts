import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InventoryItem } from '../../types';

interface InventoryState {
  items: InventoryItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InventoryState = {
  items: [
    {
      id: 'item1',
      name: 'Whole Milk',
      categoryId: 'cat1',
      quantity: 15,
      unit: 'l',
      price: 2.500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item2',
      name: 'Tie Original',
      categoryId: 'cat4',
      quantity: 50,
      unit: 'pcs',
      price: 1.200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item3',
      name: 'Chicha Mint',
      categoryId: 'cat7',
      quantity: 20,
      unit: 'box',
      price: 12.500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  status: 'idle',
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<InventoryItem>) => {
      const { id } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          quantity,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    setItems: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload;
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

export const {
  addItem,
  updateItem,
  removeItem,
  updateItemQuantity,
  setItems,
  setStatus,
  setError,
} = inventorySlice.actions;

export default inventorySlice.reducer;