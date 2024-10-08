export enum BankTransactionType {
  Checking = 'checking',
  CreditCard = 'creditCard',
}

export enum CheckingAccountTransactionType {
  Check = 'check',
  TBD = 'tbd',
}

export enum DateRangeType {
  All = 'all',
  YearToDate = 'ytd',
  LastYear = 'lastYear',
  DateRange = 'dateRange',
  Statement = 'statement',
  SinceRetirement = 'sinceRetirement',
}

export enum StatementType {
  Checking = 'checking',
  CreditCard = 'creditCard',
}

export enum SidebarMenuButton {
  Reports = 'Reports',
  CategoryAssignmentRules = 'Category Assignment Rules',
  Statements = 'Statements',
  Categories = 'Categories',
  TransactionsByCategory = 'Transactions By Category',
}

export enum ReportTypes {
  Spending = 'Spending',
}

export enum SourceOfTheDisplayedCategoryForATransactionType {
  Statement = <any>'Statement',
  CategoryAssignmentRule = <any>'Rule',
  Override = <any>'Override',
  None = <any>'None',
}
