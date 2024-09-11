import { createSelector } from 'reselect';
import { CreditCardStatement, CreditCardStatementState, CreditCardTransaction, TrackerState, Transaction } from '../types';
import { getTransactionsByStatementId } from './transactionsState';

interface RevisedStatementProperties {
  net: number;
  transactionCount: number;
}

// Input selector: extracts the CreditCardStatementState slice from the state
const creditCardStatementState = (state: TrackerState): CreditCardStatementState => state.creditCardStatementState;

const calculateTransactionNet = (creditCardTransaction: CreditCardTransaction): number => {
  if (creditCardTransaction.category.toLowerCase() !== 'false') {
    return creditCardTransaction.amount;
  }
  return 0;
}

// Memoized selector to calculate the net for a given statement
const calculateStatementProperties = createSelector(
  [(state: TrackerState, statement: CreditCardStatement) => getTransactionsByStatementId(state, statement.id)],
  (transactions: Transaction[]): RevisedStatementProperties => {
    let net = 0;
    let transactionCount = 0;
    transactions.forEach((transaction) => {
      const amountForTransaction = calculateTransactionNet(transaction as CreditCardTransaction);
      if (amountForTransaction !== 0) {
        transactionCount++;
        net += amountForTransaction;
      }
    }
    );
    return { net, transactionCount };
  }
);

export const getCreditCardStatements = createSelector(
  [creditCardStatementState, (state: TrackerState) => state], // Pass the full state
  (creditCardStatementState: CreditCardStatementState, state: TrackerState): CreditCardStatement[] => {
    const creditCardStatements: CreditCardStatement[] = [];
    creditCardStatementState.creditCardStatements.forEach(statement => {
      const revisedStatementProperties: RevisedStatementProperties = calculateStatementProperties(state, statement);
      const adjustedStatement = {
        ...statement,
        netDebits: revisedStatementProperties.net, // Calculate netDebits using the memoized selector,
        transactionCount: revisedStatementProperties.transactionCount,
      };
      creditCardStatements.push(adjustedStatement);
    });
    return creditCardStatements;
  }
);

// Selector to get a specific CreditCardStatement by ID
export const getCreditCardStatementById = createSelector(
  [getCreditCardStatements, (_, creditCardStatementId: string) => creditCardStatementId],
  (creditCardStatements: CreditCardStatement[], creditCardStatementId: string): CreditCardStatement | null => {
    return creditCardStatements.find((creditCardStatement: CreditCardStatement) => creditCardStatement.id === creditCardStatementId) || null;
  }
);
