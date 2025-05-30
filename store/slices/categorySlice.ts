import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../../types';

interface CategoryState {
  categories: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoryState = {
  categories: [
    { id: 'cat1', name: 'Milk', parentId: null },
    { id: 'cat2', name: 'Tie', parentId: null },
    { id: 'cat3', name: 'Chicha', parentId: null },
    { id: 'cat4', name: 'Tie Variant 1', parentId: 'cat2' },
    { id: 'cat5', name: 'Tie Variant 2', parentId: 'cat2' },
    { id: 'cat6', name: 'Tie Variant 3', parentId: 'cat2' },
    { id: 'cat7', name: 'Chicha Type 1', parentId: 'cat3' },
    { id: 'cat8', name: 'Chicha Type 2', parentId: 'cat3' },
    { id: 'cat9', name: 'Chicha Type 3', parentId: 'cat3' },
  ],
  status: 'idle',
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const { id } = action.payload;
      const index = state.categories.findIndex((category) => category.id === id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (category) => category.id !== action.payload
      );
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
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
  addCategory,
  updateCategory,
  removeCategory,
  setCategories,
  setStatus,
  setError,
} = categorySlice.actions;

export default categorySlice.reducer;