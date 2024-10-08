import { createSelector } from 'reselect';
import { isNil } from "lodash";
import {
  BankTransaction,
  DateRangeType,
  MinMaxDates,
  ReportDataState,
  StringToTransactionsLUT,
  Statement,
  TrackerState,
  CategorizedTransaction} from "../types";
import { getCheckingAccountStatementById } from "./checkingAccountStatementState";
import { getCreditCardStatementById } from "./creditCardStatementState";
import { getTransactionsByCategory } from './transactionsState';

// Input selectors
export const selectReportDataState = (state: TrackerState): ReportDataState => state.reportDataState;

// Memoized selectors
export const getStartDate = createSelector(
  [selectReportDataState],
  (reportDataState: ReportDataState): string => reportDataState.startDate
);

export const getEndDate = createSelector(
  [selectReportDataState],
  (reportDataState: ReportDataState): string => reportDataState.endDate
);

export const getTotal = createSelector(
  [selectReportDataState],
  (reportDataState: ReportDataState): number => reportDataState.total
);

export const getTransactionByIdFromReportDataState = createSelector(
  [selectReportDataState, (_: TrackerState, transactionId: string) => transactionId],
  (reportDataState: ReportDataState, transactionId: string): BankTransaction | null => {
    const transactionsByCategory: StringToTransactionsLUT = reportDataState.transactionsByCategory;
    const categorizedTransactions: CategorizedTransaction[] = Object.values(transactionsByCategory).flat();
    const matchingCategorizedTransaction: CategorizedTransaction | null = categorizedTransactions.find(
      (categorizedTransaction: CategorizedTransaction) => categorizedTransaction.bankTransaction.id === transactionId
    ) || null;
    return matchingCategorizedTransaction ? matchingCategorizedTransaction.bankTransaction : null;
  }
);

export const getDateRangeType = createSelector(
  [selectReportDataState],
  (reportDataState: ReportDataState): DateRangeType => reportDataState.dateRangeType
);

export const getMinMaxTransactionDates = createSelector(
  [selectReportDataState],
  (reportDataState: ReportDataState): MinMaxDates => reportDataState.minMaxTransactionDates
);

export const getReportStatementId = createSelector(
  [selectReportDataState],
  (reportDataState: ReportDataState): string => reportDataState.reportStatementId
);

export const getReportStatement = createSelector(
  [getCreditCardStatementById, getCheckingAccountStatementById],
  (creditCardStatement, checkingAccountStatement): Statement | null => {
    if (!isNil(creditCardStatement)) {
      return creditCardStatement;
    }
    if (!isNil(checkingAccountStatement)) {
      return checkingAccountStatement;
    }
    return null;
  }
);

export const getCategoryIdsToExclude = createSelector(
  [selectReportDataState],
  (reportDataState: ReportDataState): string[] => reportDataState.categoryIdsToExclude
);

export const isCategoryIdExcluded = createSelector(
  [getCategoryIdsToExclude, (_: TrackerState, categoryId: string) => categoryId],
  (categoryIdsToExclude: string[], categoryId: string): boolean => categoryIdsToExclude.includes(categoryId)
);

export const getTransactionsByCategoryIdInDateRange = createSelector(
  [getStartDate, getEndDate, getTransactionsByCategory],
  (startDate, endDate, transactionsByCategoryId): StringToTransactionsLUT => {

    console.log('getTransactionsByCategoryIdInDateRange');

    const transactionsByCategoryIdInDateRange: StringToTransactionsLUT = {};
    
    // Iterate over each category in the transactionsByCategoryId
    Object.keys(transactionsByCategoryId).forEach(categoryId => {
      // Filter transactions by the date range
      const filteredTransactions = transactionsByCategoryId[categoryId].filter(transaction => {
        const transactionDate = new Date(transaction.bankTransaction.transactionDate);
        return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
      });
  
      // Only add the category to the result if there are transactions within the date range
      if (filteredTransactions.length > 0) {
        transactionsByCategoryIdInDateRange[categoryId] = filteredTransactions;
      }
    });
  
    return transactionsByCategoryIdInDateRange;
  }
);

