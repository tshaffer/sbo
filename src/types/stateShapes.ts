import { StringToTransactionsLUT } from "./base";
import { BankTransaction, Category, CategoryAssignmentRule, CheckingAccountStatement, CreditCardStatement, MinMaxDates, Transaction } from "./entities";
import { DateRangeType } from "./enums";

export interface TrackerState {
  appState: AppState;
  categoryState: CategoryState;
  categoryAssignmentRulesState: CategoryAssignmentRulesState;
  reportDataState: ReportDataState;
  checkingAccountStatementState: CheckingAccountStatementState;
  creditCardStatementState: CreditCardStatementState;
  transactionsState: TransactionsState;
}

export interface AppState {
  appInitialized: boolean;
}

export interface CreditCardStatementState {
  creditCardStatements: CreditCardStatement[];
}

export interface CheckingAccountStatementState {
  checkingAccountStatements: CheckingAccountStatement[];
}

export interface ReportDataState {
  dateRangeType: DateRangeType;
  startDate: string;
  endDate: string;
  generatedReportStartDate: string;
  generatedReportEndDate: string;
  transactionsByCategory: StringToTransactionsLUT;
  unidentifiedBankTransactions: BankTransaction[];
  total: number;
  minMaxTransactionDates: MinMaxDates;
  reportStatementId: string;
  categoryIdsToExclude: string[];
}

export interface CategoryState {
  categories: Category[];
}

export interface CategoryAssignmentRulesState {
  categoryAssignmentRules: CategoryAssignmentRule[];
}

export interface TransactionsState {
  byId: { [id: string]: Transaction };
  allIds: string[];
}

