import { createSelector } from 'reselect';
import { CreditCardStatement, CreditCardStatementState, CreditCardTransaction, TrackerState, Transaction } from '../types';
import { getTransactionsByStatementId } from './transactionsState';

// Input selector: extracts the CreditCardStatementState slice from the state
const creditCardStatementState = (state: TrackerState): CreditCardStatementState => state.creditCardStatementState;

const calculateTransactionNet = (creditCardTransaction: CreditCardTransaction): number => {
  if (creditCardTransaction.category.toLowerCase() !== 'false') {
    return creditCardTransaction.amount;
  }
  return 0;
}

const calculateStatementNet = (state: TrackerState, statement: CreditCardStatement): number => {
  const statementTransactions: CreditCardTransaction[] = getTransactionsByStatementId(state, statement.id) as CreditCardTransaction[];
  const net: number = statementTransactions.reduce((net: number, transaction: CreditCardTransaction) => {
    return net + calculateTransactionNet(transaction);
  }, 0);
  return net;
}

export const getCreditCardStatements = createSelector(
  [creditCardStatementState, (state: TrackerState) => state], // Pass the full state
  (creditCardStatementState: CreditCardStatementState, state: TrackerState): CreditCardStatement[] => {
    return creditCardStatementState.creditCardStatements.map(statement => {
      // Adjust properties of each credit card statement here
      const adjustedStatement = {
        ...statement,
        netDebits: calculateStatementNet(state, statement), // Calculate netDebits using the full state
      };

      return adjustedStatement;
    });
  }
);

// Selector to get a specific CreditCardStatement by ID
export const getCreditCardStatementById = createSelector(
  [getCreditCardStatements, (_, creditCardStatementId: string) => creditCardStatementId],
  (creditCardStatements: CreditCardStatement[], creditCardStatementId: string): CreditCardStatement | null => {
    return creditCardStatements.find((creditCardStatement: CreditCardStatement) => creditCardStatement.id === creditCardStatementId) || null;
  }
);
