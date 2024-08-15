import { isNil } from "lodash";
import { BankTransaction, DateRangeType, MinMaxDates, ReportDataState, StringToTransactionsLUT, Statement, TrackerState, CategorizedTransaction } from "../types";
import { getCheckingAccountStatementById } from "./checkingAccountStatementState";
import { getCreditCardStatementById } from "./creditCardStatementState";
import { getUnidentifiedBankTransactions } from "./transactionsState";

export const getReportDataState = (state: TrackerState): ReportDataState => {
  return state.reportDataState;
};

export const getStartDate = (state: TrackerState): string => {
  return state.reportDataState.startDate;
}

export const getEndDate = (state: TrackerState): string => {
  return state.reportDataState.endDate;
}

export const getGeneratedReportStartDate = (state: TrackerState): string => {
  return state.reportDataState.generatedReportStartDate;
}

export const getGeneratedReportEndDate = (state: TrackerState): string => {
  return state.reportDataState.generatedReportEndDate;
}

export const getTotal = (state: TrackerState): number => {
  return state.reportDataState.total;
}

export const getTransactionByIdFromReportDataState = (reportDataState: ReportDataState, transactionId: string): BankTransaction | null => {
  const transactionsByCategory: StringToTransactionsLUT = reportDataState.transactionsByCategory;
  const categorizedTransactions: CategorizedTransaction[] = Object.values(transactionsByCategory).flat();
  const matchingCategorizedTransaction: CategorizedTransaction | null = categorizedTransactions.find((categorizedTransaction: CategorizedTransaction) => categorizedTransaction.bankTransaction.id === transactionId) || null;
  if (!isNil(matchingCategorizedTransaction)) {
    return matchingCategorizedTransaction.bankTransaction;
  } else {
    return null;
  }
}

export const getUnidentifiedBankTransactionById = (state: TrackerState, unidentifiedBankTransactionId: string): BankTransaction | null => {
  const unidentifiedBankTransactions: BankTransaction[] = getUnidentifiedBankTransactions(state);
  return unidentifiedBankTransactions.find((unidentifiedBankTransaction: BankTransaction) => unidentifiedBankTransaction.id === unidentifiedBankTransactionId) || null;
};

export const getDateRangeType = (state: TrackerState): DateRangeType => {
  return state.reportDataState.dateRangeType;
}

export const getMinMaxTransactionDates = (state: TrackerState): MinMaxDates => {
  return state.reportDataState.minMaxTransactionDates;
}

export const getReportStatementId = (state: TrackerState): string => {
  return state.reportDataState.reportStatementId;
}

export const getReportStatement = (state: TrackerState, statementId: string): Statement | null => {
  const creditCardStatement = getCreditCardStatementById(state, statementId);
  if (!isNil(creditCardStatement)) {
    return creditCardStatement;
  }
  const checkingAccountStatement = getCheckingAccountStatementById(state, statementId);
  if (!isNil(checkingAccountStatement)) {
    return checkingAccountStatement;
  }
  return null;
}

export const getCategoryIdsToExclude = (state: TrackerState): Set<string> => {
  return state.reportDataState.categoryIdsToExclude;
}

export const isCategoryIdExcluded = (state: TrackerState, categoryId: string): boolean => {
  return getCategoryIdsToExclude(state).has(categoryId);
}
