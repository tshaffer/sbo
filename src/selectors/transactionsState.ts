import { isNil } from 'lodash';
import { createSelector } from 'reselect';

import { BankTransaction, BankTransactionType, CategorizedStatementData, CategorizedTransaction, Category, CategoryAssignmentRule, CheckingAccountTransaction, CheckingAccountTransactionRowInStatementTableProperties, CreditCardTransaction, CreditCardTransactionRowInStatementTableProperties, DisregardLevel, ReviewedTransactions, StringToTransactionsLUT, TrackerState, Transaction } from '../types';
import { getCategories, getCategoryById } from './categoryState';

import { roundTo } from '../utilities';
import { getCategoryAssignmentRules } from './categoryAssignmentRulesState';

export interface MatchingRuleAssignment {
  category: Category;
  pattern: string;
}

// Basic selectors
const getTransactionIds = (state: TrackerState): string[] => state.transactionsState.allIds;
const getAllCategories = (state: TrackerState): Category[] => state.categoryState.categories;
const getIgnoreCategory = (state: TrackerState): Category | undefined => getAllCategories(state).find(category => category.name === 'Ignore');
const getTransactionsById = (state: TrackerState): { [id: string]: Transaction } => state.transactionsState.byId;

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

const getActiveCategories = createSelector(
  [getAllCategories],
  (allCategories: Category[]) => allCategories.filter(category => category.disregardLevel === DisregardLevel.None)
);

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

const categorizeTransactions = createSelector(
  [getTransactions, getActiveCategories, getIgnoreCategory, getCategoryAssignmentRules],
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

const getCategorizedStatementData = createSelector(
  [categorizeTransactions],
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

export const getOverrideCategory = createSelector(
  [getTransactionById],
  (transaction) => transaction?.overrideCategory ?? false
);

export const getOverrideCategoryId = createSelector(
  [getTransactionById],
  (transaction) => {
    if (transaction?.overrideCategory) {
      return transaction.overrideCategoryId;
    }
    return '';
  }
);

export const getTransactionsByCategory = createSelector(
  [getCategorizedStatementData],
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

export const getCategoryByTransactionId = createSelector(
  [getTransactionsByCategory, (_: TrackerState, transactionId: string) => transactionId, (_: TrackerState) => _],
  (transactionsByCategory, transactionId, state) => {
    for (const categoryId in transactionsByCategory) {
      if (Object.prototype.hasOwnProperty.call(transactionsByCategory, categoryId)) {
        const categorizedTransaction = transactionsByCategory[categoryId].find(transaction => transaction.bankTransaction.id === transactionId);
        if (categorizedTransaction) {
          return getCategoryById(state, categoryId);  // Correctly pass the state here
        }
      }
    }
    return null;
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

