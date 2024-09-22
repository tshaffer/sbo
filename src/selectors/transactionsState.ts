import { isNil } from 'lodash';
import { createSelector } from 'reselect';

import { BankTransaction, BankTransactionType, CategorizedStatementData, CategorizedTransaction, CategorizedTransactionProperties, Category, CategoryAssignmentRule, CheckingAccountTransaction, CheckingAccountTransactionRowInStatementTableProperties, CreditCardTransaction, CreditCardTransactionRowInStatementTableProperties, ReviewedTransactions, SourceOfTheDisplayedCategoryForATransactionType, StringToTransactionsLUT, TrackerState, Transaction } from '../types';
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

export const getCategorizedTransactionProperties = createSelector(
  [getTransactionsById, (_: TrackerState, id: string) => id, getCategories, getCategoryAssignmentRules],
  (transactionsById, id, categories, categoryAssignmentRules): CategorizedTransactionProperties => {

    console.log('getCategorizedTransactionProperties');

    const transaction = transactionsById[id];

    if (transaction.overrideCategory && transaction.overrideCategoryId !== '') {
      const category = categories.find(cat => cat.id === transaction.overrideCategoryId);
      if (category) return {
        categoryName: category.name,
        source: SourceOfTheDisplayedCategoryForATransactionType.Override
      }
    }

    const userDescription = transaction.userDescription.toLowerCase();
    for (const categoryAssignmentRule of categoryAssignmentRules) {
      if (userDescription.includes(categoryAssignmentRule.pattern.toLowerCase())) {
        const category = categories.find(cat => cat.id === categoryAssignmentRule.categoryId);
        if (category) return {
          categoryName: category.name,
          source: SourceOfTheDisplayedCategoryForATransactionType.CategoryAssignmentRule
        }
      }
    }

    if (transaction.bankTransactionType === BankTransactionType.CreditCard) {
      const creditCardTransaction = transaction as CreditCardTransaction;
      const category = categories.find(cat => cat.name === creditCardTransaction.category);
      if (category) return {
        categoryName: category.name,
        source: SourceOfTheDisplayedCategoryForATransactionType.Statement
      }
    }

    return {
      categoryName: '',
      source: SourceOfTheDisplayedCategoryForATransactionType.None,
    }
  }
);

export const categorizeTransaction = (
  transaction: BankTransaction,
  categories: Category[],
  categoryAssignmentRules: CategoryAssignmentRule[]
): Category | null => {

  console.log('categorizeTransaction');

  if (transaction.overrideCategory && transaction.overrideCategoryId !== '') {
    const category = categories.find(cat => cat.id === transaction.overrideCategoryId);
    if (category) return category;
  }

  const userDescription = transaction.userDescription.toLowerCase();
  for (const categoryAssignmentRule of categoryAssignmentRules) {
    if (userDescription.includes(categoryAssignmentRule.pattern.toLowerCase())) {
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

// export const getAllCategorizedTranactionsById = createSelector(
//   [getTransactions],
//   (transactions): any => {

//   }
// );

const categorizeTransactions = createSelector(
  [getTransactions, getAllCategories, getIgnoreCategory, getCategoryAssignmentRules],
  (transactions, categories, ignoreCategory, categoryAssignmentRules): ReviewedTransactions => {

    console.log('categorizeTransactions');

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

    console.log('getCategorizedStatementData');

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

    console.log('getTransactionsByCategory');

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
    console.log('getCategoryByTransactionId');
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
  const rows: CreditCardTransactionRowInStatementTableProperties[] = [];
  creditCardTransactions.forEach((creditCardTransaction: CreditCardTransaction) => {
    if (creditCardTransaction.category.toLowerCase() !== 'false') {
      const matchingRule: MatchingRuleAssignment | null = findMatchingRule(state, creditCardTransaction);
      rows.push({
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
      });
    }
  });
  return rows;
}

export const getCheckingAccountTransactionRowInStatementTableProperties = (state: TrackerState, statementId: string): CheckingAccountTransactionRowInStatementTableProperties[] => {
  const checkingAccountTransactions: CheckingAccountTransaction[] = getTransactionsByStatementId(state, statementId) as CheckingAccountTransaction[];
  const rows: CheckingAccountTransactionRowInStatementTableProperties[] = [];
  checkingAccountTransactions.forEach((checkingAccountTransaction: CheckingAccountTransaction) => {
    const categorizedTransactionName: string = categorizeTransaction(checkingAccountTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '';
    if (categorizedTransactionName.toLowerCase() !== 'ignore') {
      const matchingRule: MatchingRuleAssignment | null = findMatchingRule(state, checkingAccountTransaction);
      rows.push({
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
        categorizedTransactionName,
        checkingAccountTransaction,
      });
    }
  });
  return rows;
}

export const findMatchingRule = (state: TrackerState, transaction: BankTransaction): MatchingRuleAssignment | null => {

  const categories: Category[] = getCategories(state);
  const categoryAssignmentRules: CategoryAssignmentRule[] = getCategoryAssignmentRules(state);

  const userDescription = transaction.userDescription.toLowerCase();
  const categoryAssignmentRule = categoryAssignmentRules.find(rule => userDescription.includes(rule.pattern.toLowerCase()));
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

export const getTransactionsByCategoryAssignmentRules = createSelector<
  [typeof getTransactions, typeof getCategoryAssignmentRules], // Input selectors types
  { [key: string]: Transaction[] } // Return type
>(
  [getTransactions, getCategoryAssignmentRules],
  (transactions: Transaction[], categoryAssignmentRules: CategoryAssignmentRule[]): { [key: string]: Transaction[] } => {
    const transactionsByCategoryAssignmentRules: { [key: string]: Transaction[] } = {};
    categoryAssignmentRules.forEach(categoryAssignmentRule => {
      transactionsByCategoryAssignmentRules[categoryAssignmentRule.id] = transactions.filter(transaction => {
        const userDescription = transaction.userDescription.toLowerCase();
        return userDescription.includes(categoryAssignmentRule.pattern.toLowerCase());
      });
    });

    return transactionsByCategoryAssignmentRules;
  }
);
