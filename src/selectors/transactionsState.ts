import { isNil } from 'lodash';
import { createSelector } from 'reselect';

import { BankTransaction, BankTransactionType, CategorizedStatementData, CategorizedTransaction, Category, CategoryAssignmentRule, CheckingAccountTransaction, CheckingAccountTransactionRowInStatementTableProperties, CreditCardTransaction, CreditCardTransactionRowInStatementTableProperties, DisregardLevel, ReviewedTransactions, StringToTransactionsLUT, TrackerState, Transaction } from '../types';
import { getCategories, getCategoryById, getCategoryByName } from './categoryState';
// import { getEndDate, getStartDate } from './reportDataState';

import { roundTo } from '../utilities';
import { getCategoryAssignmentRules } from './categoryAssignmentRulesState';

export interface MatchingRuleAssignment {
  category: Category;
  pattern: string;
}

export interface MatchingRuleAssignment {
  category: Category;
  pattern: string;
}

console.log('transactionsState.ts');

// Basic selectors
const getTransactionIds = (state: TrackerState): string[] => state.transactionsState.allIds;

const getTransactionsById = (state: TrackerState): { [id: string]: Transaction } => state.transactionsState.byId;
const getStartDate = (state: TrackerState): string => state.reportDataState.startDate;
const getEndDate = (state: TrackerState): string => state.reportDataState.endDate;

console.log('getStartDate', getStartDate);
console.log('getEndDate', getEndDate);

// Memoized selectors
export const getTransactions = createSelector(
  [getTransactionIds, getTransactionsById],
  (transactionIds, transactionsById): Transaction[] => {
    return transactionIds
      .map(id => transactionsById[id])
      .filter(
        (transaction): transaction is Transaction =>
          transaction.bankTransactionType === BankTransactionType.CreditCard ||
          !(transaction as CheckingAccountTransaction).isSplit
      );
  }
);

export const getTransactionById = createSelector(
  [getTransactionsById, (_: TrackerState, id: string) => id],
  (transactionsById, id): Transaction | undefined => {
    const transaction = transactionsById[id];
    if (
      !isNil(transaction) &&
      (transaction.bankTransactionType === BankTransactionType.CreditCard ||
        !(transaction as CheckingAccountTransaction).isSplit)
    ) {
      return transaction;
    }
    return undefined;
  }
);

export const getTransactionsByStatementId = createSelector(
  [getTransactions, (_: TrackerState, statementId: string) => statementId],
  (transactions, statementId): Transaction[] => {
    return transactions.filter(transaction => transaction.statementId === statementId);
  }
);

// Non Memoized selectors
export const getCreditCardTransactionRowInStatementTableProperties = (state: TrackerState, statementId: string): CreditCardTransactionRowInStatementTableProperties[] => {
  const creditCardTransactions: CreditCardTransaction[] = getTransactionsByStatementId(state, statementId) as CreditCardTransaction[];
  return creditCardTransactions.map((creditCardTransaction: CreditCardTransaction) => {
    const matchingRule: MatchingRuleAssignment | null = findMatchingRule(state, creditCardTransaction);
    return {
      id: creditCardTransaction.id,
      transactionDate: creditCardTransaction.transactionDate,
      amount: creditCardTransaction.amount,
      description: creditCardTransaction.description,
      userDescription: creditCardTransaction.userDescription,
      category: creditCardTransaction.category,

      categoryNameFromCategoryAssignmentRule: matchingRule ? matchingRule.category.name : '',
      patternFromCategoryAssignmentRule: matchingRule ? matchingRule.pattern : '',
      categoryNameFromCategoryOverride: getOverrideCategory(state, creditCardTransaction.id)
        ? getCategoryById(state, getOverrideCategoryId(state, creditCardTransaction.id))!.name
        : '',
      categorizedTransactionName: categorizeTransaction(creditCardTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '',
    };
  });
}

export const getCheckingAccountTransactionRowInStatementTableProperties = (state: TrackerState, statementId: string): CheckingAccountTransactionRowInStatementTableProperties[] => {
  const checkingAccountTransactions: CheckingAccountTransaction[] = getTransactionsByStatementId(state, statementId) as CheckingAccountTransaction[];
  return checkingAccountTransactions.map((checkingAccountTransaction: CheckingAccountTransaction) => {
    const matchingRule: MatchingRuleAssignment | null = findMatchingRule(state, checkingAccountTransaction);
    return {
      id: checkingAccountTransaction.id,
      transactionDate: checkingAccountTransaction.transactionDate,
      amount: checkingAccountTransaction.amount,
      name: checkingAccountTransaction.name,
      userDescription: checkingAccountTransaction.userDescription,
      categoryNameFromCategoryAssignmentRule: matchingRule ? matchingRule.category.name : '',
      patternFromCategoryAssignmentRule: matchingRule ? matchingRule.pattern : '',
      categoryNameFromCategoryOverride: getOverrideCategory(state, checkingAccountTransaction.id)
        ? getCategoryById(state, getOverrideCategoryId(state, checkingAccountTransaction.id))!.name
        : '',
      categorizedTransactionName: categorizeTransaction(checkingAccountTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '',
      checkingAccountTransaction,
    };
  });
}

export const getTransactionsByCategory = (state: TrackerState): StringToTransactionsLUT => {

  const categorizedStatementData: CategorizedStatementData = getCategorizedStatementData(state);
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

export const getUnidentifiedBankTransactions = (state: TrackerState): BankTransaction[] => {
  const categorizedStatementData: CategorizedStatementData = getCategorizedStatementData(state);
  const { unidentifiedBankTransactions } = categorizedStatementData;
  return unidentifiedBankTransactions;
}

export const getFixedExpensesByCategory = (state: TrackerState): StringToTransactionsLUT => {

  const categorizedStatementData: CategorizedStatementData = getCategorizedStatementData(state);
  const { fixedExpenses } = categorizedStatementData;

  const fixedExpensesByCategoryId: StringToTransactionsLUT = {};
  fixedExpenses.forEach((fixedExpenseTransaction: CategorizedTransaction) => {
    const categoryId: string = fixedExpenseTransaction.categoryId;
    if (!fixedExpensesByCategoryId[categoryId]) {
      fixedExpensesByCategoryId[categoryId] = [];
    }
    fixedExpensesByCategoryId[categoryId].push(fixedExpenseTransaction);
  });

  return fixedExpensesByCategoryId;
}




export const getCategoryByTransactionId = (state: TrackerState, transactionId: string): Category | null | undefined => {

  const transactionsByCategory: StringToTransactionsLUT = getTransactionsByCategory(state);

  for (const categoryId in transactionsByCategory) {
    if (Object.prototype.hasOwnProperty.call(transactionsByCategory, categoryId)) {
      const categorizedTransaction = transactionsByCategory[categoryId].find(transaction => transaction.bankTransaction.id === transactionId);
      if (categorizedTransaction) {
        return getCategoryById(state, categoryId);
      }
    }
  }
  return null;
};

export const getOverrideCategory = (state: TrackerState, transactionId: string): boolean => {
  const transaction = getTransactionById(state, transactionId);
  return transaction?.overrideCategory ?? false;
}

export const getOverrideCategoryId = (state: TrackerState, transactionId: string): string => {
  const transaction = getTransactionById(state, transactionId);
  if (!isNil(transaction)) {
    if (transaction.overrideCategory) {
      return transaction.overrideCategoryId;
    }
  }
  return '';
}

export const getOverrideFixedExpense = (state: TrackerState, transactionId: string): boolean => {
  const transaction = getTransactionById(state, transactionId);
  return transaction?.overrideFixedExpense ?? false;
}

export const getOverriddenFixedExpense = (state: TrackerState, transactionId: string): boolean => {
  const transaction = getTransactionById(state, transactionId);
  return transaction?.overriddenFixedExpense ?? false;
}

export const findMatchingRule = (state: TrackerState, transaction: BankTransaction): MatchingRuleAssignment | null => {

  const categories: Category[] = getCategories(state);
  const categoryAssignmentRules: CategoryAssignmentRule[] = getCategoryAssignmentRules(state);

  const categoryAssignmentRule = categoryAssignmentRules.find(rule => transaction.userDescription.includes(rule.pattern));
  if (categoryAssignmentRule) {
    const category: Category | null = categories.find(category => category.id === categoryAssignmentRule.categoryId) || null;
    if (!isNil(category)) {
      return {
        category,
        pattern: categoryAssignmentRule.pattern,
      };
    }
  }
  return null;
}

// Step 1: Create Basic Selectors

// Basic Selectors
const getAllCategories = (state: TrackerState): Category[] => state.categoryState.categories;
const getIgnoreCategory = (state: TrackerState): Category | undefined => getAllCategories(state).find(category => category.name === 'Ignore');

// Step 2: Filter Categories by Disregard Level
const getActiveCategories = createSelector(
  [getAllCategories],
  (allCategories: Category[]) => allCategories.filter(category => category.disregardLevel === DisregardLevel.None)
);

// Step 3: Memoize categorizeTransaction
export const categorizeTransaction = (
  transaction: BankTransaction,
  categories: Category[],
  categoryAssignmentRules: CategoryAssignmentRule[]
): Category | null => {

  if (transaction.overrideCategory && transaction.overrideCategoryId !== '') {
    const category = categories.find(cat => cat.id === transaction.overrideCategoryId);
    if (category) return category;
  }

  for (const categoryAssignmentRule of categoryAssignmentRules) {
    if (transaction.userDescription.includes(categoryAssignmentRule.pattern)) {
      const category = categories.find(cat => cat.id === categoryAssignmentRule.categoryId);
      if (category) return category;
    }
  }

  if (transaction.bankTransactionType === BankTransactionType.CreditCard) {
    const creditCardTransaction = transaction as CreditCardTransaction;
    const category = categories.find(cat => cat.name === creditCardTransaction.category);
    if (category) return category;
  }

  return null;
};

// Step 4: Memoize categorizeTransactions
const categorizeTransactions = createSelector(
  [getTransactions, getActiveCategories, getIgnoreCategory, getCategoryAssignmentRules],
  (transactions, categories, ignoreCategory, categoryAssignmentRules): ReviewedTransactions => {
    const categorizedTransactions: CategorizedTransaction[] = [];
    const uncategorizedTransactions: BankTransaction[] = [];
    const ignoredTransactions: BankTransaction[] = [];
    const fixedExpenses: CategorizedTransaction[] = [];

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

          if (category.transactionsRequired) {
            fixedExpenses.push(categorizedTransaction);
          }
        }
      } else {
        uncategorizedTransactions.push(transaction);
      }
    });

    return {
      categorizedTransactions,
      uncategorizedTransactions,
      ignoredTransactions,
      fixedExpenses,
    };
  }
);

//Step 5: Create getCategorizedStatementData Selector
export const getCategorizedStatementData = createSelector(
  [categorizeTransactions, getStartDate, getEndDate],
  (reviewedTransactions, startDate, endDate): CategorizedStatementData => {
    const { categorizedTransactions, uncategorizedTransactions, fixedExpenses } = reviewedTransactions;

    const transactions = categorizedTransactions.map(transaction => ({
      bankTransaction: transaction.bankTransaction,
      categoryId: transaction.categoryId,
    }));

    const netDebits = roundTo(-transactions.reduce((sum, transaction) => sum + transaction.bankTransaction.amount, 0), 2);

    return {
      startDate,
      endDate,
      transactions,
      netDebits,
      unidentifiedBankTransactions: uncategorizedTransactions,
      fixedExpenses,
    };
  }
);
