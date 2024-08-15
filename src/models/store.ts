import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './slices/appStateSlice';
import categoryStateReducer from './slices/categoriesSlice';
import categoryAssignmentRulesReducer from './slices/categoryAssignmentRulesSlice';
import reportDataStateReducer from './slices/reportDataStateSlice';
import transactionsReducer from './slices/transactionsSlice';

export const store = configureStore({
  reducer: {
    appState: appStateReducer,
    categoryState: categoryStateReducer,
    categoryAssignmentRulesState: categoryAssignmentRulesReducer,
    reportDataState: reportDataStateReducer,
    transactionsState: transactionsReducer,
  },
});

export default store;