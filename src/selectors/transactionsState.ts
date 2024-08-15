import { isNil } from 'lodash';
import { BankTransaction, BankTransactionType, CategorizedStatementData, CategorizedTransaction, Category, CategoryAssignmentRule, CheckingAccountTransaction, CheckingAccountTransactionRowInStatementTableProperties, CreditCardTransaction, CreditCardTransactionRowInStatementTableProperties, DisregardLevel, ReviewedTransactions, StringToTransactionsLUT, TrackerState, Transaction } from '../types';
import { getCategories, getCategoryById, getCategoryByName } from './categoryState';
import { getEndDate, getStartDate } from './reportDataState';
import { roundTo } from '../utilities';
import { getCategoryAssignmentRules } from './categoryAssignmentRulesState';

export interface MatchingRuleAssignment {
  category: Category;
  pattern: string;
}
export const getTransactionIds = (state: TrackerState): string[] => {
  return state.transactionsState.allIds;
};

export const getTransactions = (state: TrackerState): Transaction[] => {
  const transactions: Transaction[] = getTransactionIds(state).map((id) => state.transactionsState.byId[id]);
  return transactions.filter((transaction) => (transaction.bankTransactionType === BankTransactionType.CreditCard || !(transaction as CheckingAccountTransaction).isSplit))
}

export const getTransactionById = (state: TrackerState, id: string): Transaction | undefined => {
  const transactionById: Transaction | undefined = state.transactionsState.byId[id];
  if (!isNil(transactionById) && (transactionById.bankTransactionType === BankTransactionType.CreditCard || !(transactionById as CheckingAccountTransaction).isSplit)) {
    return transactionById;
  }
  return undefined;
};

export const getTransactionsByStatementId = (state: TrackerState, statementId: string): Transaction[] => {
  const transactions: Transaction[] = getTransactionIds(state).map((id) => state.transactionsState.byId[id]);
  return transactions.filter((transaction) => (transaction.bankTransactionType === BankTransactionType.CreditCard || !(transaction as CheckingAccountTransaction).isSplit))
}

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

  const categorizedStatementData: CategorizedStatementData = doGetTransactionsByCategory(state);
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
  const categorizedStatementData: CategorizedStatementData = doGetTransactionsByCategory(state);
  const { unidentifiedBankTransactions } = categorizedStatementData;
  return unidentifiedBankTransactions;
}

export const getFixedExpensesByCategory = (state: TrackerState): StringToTransactionsLUT => {

  const categorizedStatementData: CategorizedStatementData = doGetTransactionsByCategory(state);
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

export const doGetTransactionsByCategory = (state: TrackerState): CategorizedStatementData => {

  const allCategories: Category[] = getCategories(state);
  const categories: Category[] = [];
  for (const category of allCategories) {
    if (category.disregardLevel === DisregardLevel.None) {
      categories.push(category);
    }
  }

  const ignoreCategory: Category = getCategoryByName(state, 'Ignore') as Category;
  const categoryAssignmentRules = getCategoryAssignmentRules(state);

  const allTransactions: BankTransaction[] = getTransactions(state) as BankTransaction[];

  const reviewedTransactionEntities: ReviewedTransactions = categorizeTransactions(allTransactions, categories, ignoreCategory, categoryAssignmentRules);

  const categorizedTransactions: CategorizedTransaction[] = reviewedTransactionEntities.categorizedTransactions;
  const unidentifiedBankTransactions: BankTransaction[] = reviewedTransactionEntities.uncategorizedTransactions;
  const fixedExpenses: CategorizedTransaction[] = reviewedTransactionEntities.fixedExpenses

  const transactions: CategorizedTransaction[] = [];
  let sum = 0;

  for (const categorizedTransaction of categorizedTransactions) {
    const transaction: CategorizedTransaction = {
      bankTransaction: categorizedTransaction.bankTransaction,
      categoryId: categorizedTransaction.categoryId,
    };
    transactions.push(transaction);
    sum += transaction.bankTransaction.amount;
  }

  sum = roundTo(-sum, 2)

  const categorizedStatementData: CategorizedStatementData = {
    startDate: getStartDate(state),
    endDate: getEndDate(state),
    transactions,
    netDebits: sum,
    unidentifiedBankTransactions,
    fixedExpenses,
  };

  return categorizedStatementData;
}

const categorizeTransactions = (
  transactions: BankTransaction[],
  categories: Category[],
  ignoreCategory: Category,
  categoryAssignmentRules: CategoryAssignmentRule[]
): ReviewedTransactions => {

  const categorizedTransactions: CategorizedTransaction[] = [];
  const uncategorizedTransactions: BankTransaction[] = [];
  const ignoredTransactions: BankTransaction[] = [];
  const fixedExpenses: CategorizedTransaction[] = [];

  let sum: number = 0;

  for (const transaction of transactions) {

    if ((transaction as CheckingAccountTransaction).excludeFromReportCalculations) {
      console.log('Excluding from report calculations');
      console.log(transaction)
      continue;
    }
    const category: Category | null = categorizeTransaction(transaction, categories, categoryAssignmentRules);
    if (!isNil(category)) {
      if (category.id === ignoreCategory.id) {
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

        sum += transaction.amount;
      }
    } else {
      uncategorizedTransactions.push(transaction);
    }
  }

  return {
    categorizedTransactions,
    uncategorizedTransactions,
    ignoredTransactions,
    fixedExpenses,
  };
};

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

export const categorizeTransaction = (
  transaction: BankTransaction,
  categories: Category[],
  categoryAssignmentRules: CategoryAssignmentRule[]): Category | null => {

  if (transaction.overrideCategory && transaction.overrideCategoryId !== '') {
    for (const category of categories) {
      if (category.id === transaction.overrideCategoryId) {
        return category;
      }
    }
  }

  for (const categoryAssignmentRule of categoryAssignmentRules) {
    if (transaction.userDescription.includes(categoryAssignmentRule.pattern)) {
      const categoryId = categoryAssignmentRule.categoryId;
      for (const category of categories) {
        if (category.id === categoryId) {
          return category;
        }
      }
    }
  }

  if (transaction.bankTransactionType === BankTransactionType.CreditCard) {
    if (!isNil((transaction as unknown as CreditCardTransaction).category)) {
      for (const category of categories) {
        if ((transaction as unknown as CreditCardTransaction).category === category.name) {
          return category;
        }
      }
    }
  }

  return null;
};

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

