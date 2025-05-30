import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import categoryReducer from './slices/categorySlice';
import usageLogReducer from './slices/usageLogSlice';
import dailyNoteReducer from './slices/dailyNoteSlice';

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    categories: categoryReducer,
    usageLogs: usageLogReducer,
    dailyNotes: dailyNoteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;