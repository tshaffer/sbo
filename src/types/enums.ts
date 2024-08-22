export enum BankTransactionType {
  Checking = 'checking',
  CreditCard = 'creditCard',
}

export enum CheckingAccountTransactionType {
  Check = 'check',
  TBD = 'tbd',
}

export enum DisregardLevel {
  None = 0,
  All = 1,
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
}

export enum ReportTypes {
  Spending = 'Spending',
  FixedExpenses = 'Fixed Expenses',
}