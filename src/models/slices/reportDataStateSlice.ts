import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DateRangeType,
  MinMaxDates,
  ReportDataState,
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
  importanceFilter: 'greater',
  consensusDiscretionary: true,
  loriDiscretionary: false,
  tedDiscretionary: false,
  consensusValue: 0,
  loriValue: 0,
  tedValue: 0,
  individualDiscretionaryPriority: 'ted',
};

const reportDataSlice = createSlice({
  name: 'reportData',
  initialState,
  reducers: {
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
    setConsensusDiscretionary: (state, action: PayloadAction<boolean>) => {
      state.consensusDiscretionary = action.payload;
    },
    setLoriDiscretionary: (state, action: PayloadAction<boolean>) => {
      state.loriDiscretionary = action.payload;
    },
    setTedDiscretionary: (state, action: PayloadAction<boolean>) => {
      state.tedDiscretionary = action.payload;
    },
    setConsensusValue: (state, action: PayloadAction<number>) => {
      state.consensusValue = action.payload;
    },
    setLoriValue: (state, action: PayloadAction<number>) => {
      state.loriValue = action.payload;
    },
    setTedValue: (state, action: PayloadAction<number>) => {
      state.tedValue = action.payload;
    },
    setIndividualDiscretionaryPriority: (state, action: PayloadAction<string>) => {
      state.individualDiscretionaryPriority = action.payload;
    },
    setImportanceFilter: (state, action: PayloadAction<'greater' | 'lower'>) => {
      state.importanceFilter = action.payload;
    },
  },
});

export const {
  setDateRangeType,
  setStartDate,
  setEndDate,
  setGeneratedReportStartDate,
  setGeneratedReportEndDate,
  setMinMaxTransactionDates,
  setReportStatementId,
  addCategoryIdToExclude,
  removeCategoryIdToExclude,
  setConsensusDiscretionary,
  setLoriDiscretionary,
  setTedDiscretionary,
  setConsensusValue,
  setLoriValue,
  setTedValue,
  setIndividualDiscretionaryPriority,
  setImportanceFilter,
} = reportDataSlice.actions;

export default reportDataSlice.reducer;
