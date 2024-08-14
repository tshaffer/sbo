import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const appStateSlice = createSlice({
  name: 'appState',
  initialState: { appInitialized: false },
  reducers: {
    setAppInitialized: (state, action: PayloadAction<boolean>) => {
      state.appInitialized = true;
    },
  },
});

export const { setAppInitialized } = appStateSlice.actions;
export default appStateSlice.reducer;