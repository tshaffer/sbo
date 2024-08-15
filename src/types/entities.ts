import { BankTransactionType, CheckingAccountTransactionType, DisregardLevel, StatementType } from "./enums";

export interface CategorizedStatementData {
  startDate: string;
  endDate: string;
  transactions: CategorizedTransaction[];
  unidentifiedBankTransactions: BankTransaction[];
  fixedExpenses: CategorizedTransaction[];
  netDebits: number;
}

export interface Transactions {
  creditCardTransactions: CreditCardTransaction[];
  checkingAccountTransactions: CheckingAccountTransaction[];
}

export interface Transaction {
  id: string;
  statementId: string;
  transactionDate: string;
  amount: number;
  bankTransactionType: BankTransactionType;
  userDescription: string;
  overrideCategory: boolean;
  overrideCategoryId: string;
  overrideFixedExpense: boolean;
  overriddenFixedExpense: boolean;
  excludeFromReportCalculations: boolean;
}

export interface SplitTransaction {
  id: string;
  parentTransactionId: string;
  amount: number;
  userDescription: string;
}

export interface CreditCardTransaction extends Transaction {
  postDate: string;
  category: string;
  description: string;
  type: string;
}

export interface CreditCardTransactionRowInStatementTableProperties {
  id: string;
  transactionDate: string;
  amount: number;
  description: string;
  userDescription: string;
  category: string;

  categoryNameFromCategoryAssignmentRule: string;
  patternFromCategoryAssignmentRule: string;
  categoryNameFromCategoryOverride: string;
  categorizedTransactionName: string;
}

export interface CheckingAccountTransactionRowInStatementTableProperties {
  id: string;
  transactionDate: string;
  amount: number;
  name: string;
  userDescription: string;
  categoryNameFromCategoryAssignmentRule: string;
  patternFromCategoryAssignmentRule: string;
  categoryNameFromCategoryOverride: string;
  categorizedTransactionName: string;
  checkingAccountTransaction: CheckingAccountTransaction;
}

export interface CheckingAccountTransaction extends Transaction {
  transactionType: string;
  name: string;
  memo: string;
  checkingAccountTransactionType: CheckingAccountTransactionType;
  isSplit: boolean;
  parentTransactionId: string;
}

export interface CheckTransaction extends CheckingAccountTransaction {
  checkNumber: string;
  payee: string;
}

export type BankTransaction = CreditCardTransaction | CheckingAccountTransaction;

export interface CategorizedTransaction {
  bankTransaction: BankTransaction;
  categoryId: string;
}

export interface Statement {
  id: string;
  fileName: string;
  type: StatementType;
  startDate: string;
  endDate: string;
  transactionCount: number;
  netDebits: number;
}

export type CreditCardStatement = Statement

export interface CheckingAccountStatement extends Statement {
  checkCount: number;
  atmWithdrawalCount: number;
}

export interface CategoryAssignmentRule {
  id: string;
  pattern: string;
  categoryId: string;
}

export interface UploadedCategoryAssignmentRule {
  categoryName: string;
  pattern: string;
}

export interface ReviewedTransactions {
  categorizedTransactions: CategorizedTransaction[];
  ignoredTransactions: BankTransaction[];
  uncategorizedTransactions: BankTransaction[];
  fixedExpenses: CategorizedTransaction[];
}

export interface MinMaxDates {
  minDate: string;
  maxDate: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string;
  transactionsRequired: boolean;
  disregardLevel: DisregardLevel;
}

export interface CategoryAssignmentRule {
  id: string;
  pattern: string;
  categoryId: string;
}

export type CategoryExpensesData = {
  id: string;
  categoryName: string;
  transactions: CategorizedTransaction[];
  transactionCount: number,
  totalExpenses: number,
  percentageOfTotal: number,
  children: any,
}

export interface CategoryMenuItem extends Category {
  children: CategoryMenuItem[];
  level: number;
}

export type StringToCategoryMenuItemLUT = {
  [key: string]: CategoryMenuItem;
}

export type StringToCategoryLUT = {
  [key: string]: Category;
}