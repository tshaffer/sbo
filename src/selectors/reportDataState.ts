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
  CategorizedTransaction,
  BankTransactionType,
  CheckingAccountTransaction,
  Transaction,
  ReviewedTransactions,
  CategorizedStatementData
} from "../types";
import { getCheckingAccountStatementById } from "./checkingAccountStatementState";
import { getCreditCardStatementById } from "./creditCardStatementState";
import { categorizeTransaction, getAllCategories, getIgnoreCategory, getTransactionIds, getTransactionsById } from './transactionsState';
import { getCategoryAssignmentRules } from './categoryAssignmentRulesState';
import { roundTo } from '../utilities';

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

export const getTransactionsInDateRange = createSelector(
  [getStartDate, getEndDate, getTransactionIds, getTransactionsById, ],
  (startDate, endDate, transactionIds, transactionsById): Transaction[] => {
    console.log('getTransactions selector called');
    return transactionIds
      .map(id => transactionsById[id])
      .filter(
        (transaction): transaction is Transaction =>
          (transaction.bankTransactionType === BankTransactionType.CreditCard ||
          !(transaction as CheckingAccountTransaction).isSplit) &&
          transaction.transactionDate >= startDate &&
          transaction.transactionDate <= endDate
      );
  }
);

const categorizeTransactionsInDateRange = createSelector(
  [getTransactionsInDateRange, getAllCategories, getIgnoreCategory, getCategoryAssignmentRules],
  (transactions, categories, ignoreCategory, categoryAssignmentRules): ReviewedTransactions => {
    const categorizedTransactions: CategorizedTransaction[] = [];
    const uncategorizedTransactions: BankTransaction[] = [];
    const ignoredTransactions: BankTransaction[] = [];

    const bankTransactions: BankTransaction[] = transactions as BankTransaction[];
    bankTransactions.forEach(transaction => {
      if ((transaction as CheckingAccountTransaction).excludeFromReportCalculations) {
        return;
      }

      const category = categorizeTransaction(transaction, categories, categoryAssignmentRules);
      if (!isNil(category)) {
        if (category.id === ignoreCategory?.id) {
          ignoredTransactions.push(transaction);
        } else {
          const categorizedTransaction: CategorizedTransaction = {
            bankTransaction: transaction,
            categoryId: category.id,
          };
          categorizedTransactions.push(categorizedTransaction);

        }
      } else {
        uncategorizedTransactions.push(transaction);
      }
    });

    return {
      categorizedTransactions,
      uncategorizedTransactions,
      ignoredTransactions,
    };
  }
);

const getCategorizedStatementDataForDateRange = createSelector(
  [categorizeTransactionsInDateRange],
  (reviewedTransactions): CategorizedStatementData => {
    const { categorizedTransactions } = reviewedTransactions;

    const transactions = categorizedTransactions.map(transaction => ({
      bankTransaction: transaction.bankTransaction,
      categoryId: transaction.categoryId,
    }));

    const netDebits = roundTo(-transactions.reduce((sum, transaction) => sum + transaction.bankTransaction.amount, 0), 2);

    return {
      transactions,
      netDebits,
    };
  }
);

export const getTransactionsInDateRangeByCategory = createSelector(
  [getCategorizedStatementDataForDateRange],
  (categorizedStatementData) => {
    const { transactions } = categorizedStatementData;

    const transactionsByCategoryId: StringToTransactionsLUT = {};
    transactions.forEach((transaction: CategorizedTransaction) => {
      const categoryId: string = transaction.categoryId;
      if (!transactionsByCategoryId[categoryId]) {
        transactionsByCategoryId[categoryId] = [];
      }
      transactionsByCategoryId[categoryId].push(transaction);
    });

    return transactionsByCategoryId;
  }
);



