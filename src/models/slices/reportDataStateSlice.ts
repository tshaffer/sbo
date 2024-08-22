import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  BankTransaction,
  CheckTransaction,
  DateRangeType,
  MinMaxDates,
  ReportDataState,
  StringToTransactionsLUT,
} from '../../types';
import { getCurrentDate, getRetirementDate } from '../../utilities';

const initialState: ReportDataState = {
  dateRangeType: DateRangeType.SinceRetirement,
  startDate: getRetirementDate(),
  endDate: getCurrentDate(),
  generatedReportStartDate: new Date().toISOString().split('T')[0],
  generatedReportEndDate: new Date().toISOString().split('T')[0],
  transactionsByCategory: {},
  total: 0,
  minMaxTransactionDates: { minDate: '', maxDate: '' },
  reportStatementId: '',
  categoryIdsToExclude: [],
};

const reportDataSlice = createSlice({
  name: 'reportData',
  initialState,
  reducers: {
    setStatementData: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string; total: number }>
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.total = action.payload.total;
    },
    setTransactionsByCategory: (
      state,
      action: PayloadAction<StringToTransactionsLUT>
    ) => {
      state.transactionsByCategory = action.payload;
    },
    setDateRangeType: (state, action: PayloadAction<DateRangeType>) => {
      state.dateRangeType = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    setGeneratedReportStartDate: (state, action: PayloadAction<string>) => {
      state.generatedReportStartDate = action.payload;
    },
    setGeneratedReportEndDate: (state, action: PayloadAction<string>) => {
      state.generatedReportEndDate = action.payload;
    },
    setMinMaxTransactionDates: (
      state,
      action: PayloadAction<MinMaxDates>
    ) => {
      state.minMaxTransactionDates = action.payload;
    },
    setReportStatementId: (state, action: PayloadAction<string>) => {
      state.reportStatementId = action.payload;
    },
    addCategoryIdToExclude: (state, action: PayloadAction<string>) => {
      if (!state.categoryIdsToExclude.includes(action.payload)) {
        state.categoryIdsToExclude.push(action.payload);
      }
    },
    removeCategoryIdToExclude: (state, action: PayloadAction<string>) => {
      state.categoryIdsToExclude = state.categoryIdsToExclude.filter(item => item !== action.payload);
    },
  },
});

export const {
  setStatementData,
  setTransactionsByCategory,
  setDateRangeType,
  setStartDate,
  setEndDate,
  setGeneratedReportStartDate,
  setGeneratedReportEndDate,
  setMinMaxTransactionDates,
  setReportStatementId,
  addCategoryIdToExclude,
  removeCategoryIdToExclude,
} = reportDataSlice.actions;

export default reportDataSlice.reducer;
