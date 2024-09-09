import { createSelector } from 'reselect';
import { CheckingAccountStatement, CheckingAccountStatementState, CheckingAccountTransaction, TrackerState, Transaction } from '../types';
import { categorizeTransaction, getTransactionsByStatementId } from './transactionsState';
import { getCategories } from './categoryState';
import { getCategoryAssignmentRules } from './categoryAssignmentRulesState';

// Input selector: extracts the CheckingAccountStatementState slice from the state
const checkingAccountStatementState = (state: TrackerState): CheckingAccountStatementState => state.checkingAccountStatementState;

const calculateTransactionNet = (state: TrackerState, checkingAccountTransaction: CheckingAccountTransaction): number => {
  const categorizedTransactionName: string = categorizeTransaction(checkingAccountTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '';
  if (categorizedTransactionName.toLowerCase() !== 'ignore') {

    return checkingAccountTransaction.amount;
  }
  return 0;
}

// Memoized selector to calculate the net for a given statement
const calculateStatementNet = createSelector(
  [(state: TrackerState, statement: CheckingAccountStatement) => getTransactionsByStatementId(state, statement.id), (state: TrackerState) => state],
  (transactions: Transaction[], state: TrackerState): number => {
    return transactions.reduce((net, transaction) => {
      return net + calculateTransactionNet(state, transaction as CheckingAccountTransaction);
    }, 0);
  }
);

export const getCheckingAccountStatements = createSelector(
  [checkingAccountStatementState, (state: TrackerState) => state], // Pass the full state
  (checkingAccountStatementState: CheckingAccountStatementState, state: TrackerState): CheckingAccountStatement[] => {
    return checkingAccountStatementState.checkingAccountStatements.map(statement => {
      // Adjust properties of each credit card statement here
      const adjustedStatement = {
        ...statement,
        netDebits: calculateStatementNet(state, statement), // Calculate netDebits using the memoized selector
      };

      return adjustedStatement;
    });
  }
);

// Selector to get a specific CheckingAccountStatement by ID
export const getCheckingAccountStatementById = createSelector(
  [getCheckingAccountStatements, (_, checkingAccountStatementId: string) => checkingAccountStatementId],
  (checkingAccountStatements: CheckingAccountStatement[], checkingAccountStatementId: string): CheckingAccountStatement | null => {
    return checkingAccountStatements.find(
      (checkingAccountStatement: CheckingAccountStatement) => checkingAccountStatement.id === checkingAccountStatementId
    ) || null;
  }
);
