import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './slices/appStateSlice';
import categoryStateReducer from './slices/categoryStateSlice';
import categoryAssignmentRulesReducer from './slices/categoryAssignmentRulesSlice';
import reportDataStateReducer from './slices/reportDataStateSlice';
import transactionsReducer from './slices/transactionsSlice';
import checkingAccountStatementReducer from './slices/checkingAccountStatementSlice';
import creditCardStatementReducer from './slices/creditCardStatementSlice';

export const store = configureStore({
  reducer: {
    appState: appStateReducer,
    categoryState: categoryStateReducer,
    categoryAssignmentRulesState: categoryAssignmentRulesReducer,
    creditCardStatementState: creditCardStatementReducer,
    checkingAccountStatementState: checkingAccountStatementReducer,
    reportDataState: reportDataStateReducer,
    transactionsState: transactionsReducer,
  },
});

export default store;