import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DailyNote } from '../../types';

interface DailyNoteState {
  notes: DailyNote[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DailyNoteState = {
  notes: [
    {
      id: 'note1',
      date: new Date().toISOString().split('T')[0],
      content: 'Restocked milk and Chicha supplies',
      createdAt: new Date().toISOString(),
    },
  ],
  status: 'idle',
  error: null,
};

const dailyNoteSlice = createSlice({
  name: 'dailyNotes',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<DailyNote>) => {
      state.notes.push(action.payload);
    },
    updateNote: (state, action: PayloadAction<DailyNote>) => {
      const { id } = action.payload;
      const index = state.notes.findIndex((note) => note.id === id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
    },
    removeNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
    },
    setNotes: (state, action: PayloadAction<DailyNote[]>) => {
      state.notes = action.payload;
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
  addNote,
  updateNote,
  removeNote,
  setNotes,
  setStatus,
  setError,
} = dailyNoteSlice.actions;

export default dailyNoteSlice.reducer;