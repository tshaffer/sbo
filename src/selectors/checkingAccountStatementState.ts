import { createSelector } from 'reselect';
import { CheckingAccountStatement, CheckingAccountStatementState, CheckingAccountTransaction, TrackerState, Transaction } from '../types';
import { categorizeTransaction, getTransactionsByStatementId } from './transactionsState';
import { getCategories } from './categoryState';
import { getCategoryAssignmentRules } from './categoryAssignmentRulesState';

interface RevisedStatementProperties {
  net: number;
  transactionCount: number;
}

// Input selector: extracts the CheckingAccountStatementState slice from the state
const checkingAccountStatementState = (state: TrackerState): CheckingAccountStatementState => state.checkingAccountStatementState;

const calculateTransactionNet = (state: TrackerState, checkingAccountTransaction: CheckingAccountTransaction): number => {
  const categorizedTransactionName: string = categorizeTransaction(checkingAccountTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '';
  if (categorizedTransactionName.toLowerCase() !== 'ignore') {
    return checkingAccountTransaction.amount;
  }
  return 0;
}

const calculateStatementProperties = createSelector(
  [(state: TrackerState, statement: CheckingAccountStatement) => getTransactionsByStatementId(state, statement.id), (state: TrackerState) => state],
  (transactions: Transaction[], state: TrackerState): RevisedStatementProperties => {
    let net = 0;
    let transactionCount = 0;
    transactions.forEach((transaction) => {
      const amountForTransaction = calculateTransactionNet(state, transaction as CheckingAccountTransaction);
      if (amountForTransaction !== 0) {
        transactionCount++;
        net += amountForTransaction;
      }
    });
    return { net, transactionCount };
  }
);

export const getCheckingAccountStatements = createSelector(
  [checkingAccountStatementState, (state: TrackerState) => state], // Pass the full state
  (checkingAccountStatementState: CheckingAccountStatementState, state: TrackerState): CheckingAccountStatement[] => {
    const checkingAccountStatements: CheckingAccountStatement[] = [];
    checkingAccountStatementState.checkingAccountStatements.forEach(statement => {
      const revisedStatementProperties: RevisedStatementProperties = calculateStatementProperties(state, statement);
      const adjustedStatement = {
        ...statement,
        netDebits: revisedStatementProperties.net, // Calculate netDebits using the memoized selector,
        transactionCount: revisedStatementProperties.transactionCount,
      };
      checkingAccountStatements.push(adjustedStatement);
    });
    return checkingAccountStatements;
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
