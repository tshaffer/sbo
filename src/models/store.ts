import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './slices/appStateSlice';
import categoryStateReducer from './slices/categoriesSlice';
import categoryAssignmentRulesReducer from './slices/categoryAssignmentRulesSlice';

export const store = configureStore({
  reducer: {
    appState: appStateReducer,
    categoryState: categoryStateReducer,
    categoryAssignmentRulesState: categoryAssignmentRulesReducer,
  },
});

export default store;