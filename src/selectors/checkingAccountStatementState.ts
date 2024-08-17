import { createSelector } from 'reselect';
import { CheckingAccountStatement, CheckingAccountStatementState, TrackerState } from '../types';

// Input selector: extracts the CheckingAccountStatementState slice from the state
const checkingAccountStatementState = (state: TrackerState): CheckingAccountStatementState => state.checkingAccountStatementState;

// Memoized selector: extracts the list of CheckingAccountStatements
export const getCheckingAccountStatements = createSelector(
  [checkingAccountStatementState],
  (checkingAccountStatementState: CheckingAccountStatementState): CheckingAccountStatement[] =>
    checkingAccountStatementState.checkingAccountStatements
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
