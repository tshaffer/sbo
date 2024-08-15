import { CheckingAccountStatement, TrackerState } from '../types';

export const getCheckingAccountStatements = (state: TrackerState): CheckingAccountStatement[] => {
  return state.checkingAccountStatementState.checkingAccountStatements;
};

export const getCheckingAccountStatementById = (state: TrackerState, checkingAccountStatementId: string): CheckingAccountStatement | null => {
  return state.checkingAccountStatementState.checkingAccountStatements.find((checkingAccountStatement: CheckingAccountStatement) => checkingAccountStatement.id === checkingAccountStatementId) || null;
}
