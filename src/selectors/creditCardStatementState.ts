import { CreditCardStatement, TrackerState } from '../types';

export const getCreditCardStatements = (state: TrackerState): CreditCardStatement[] => {
  return state.creditCardStatementState.creditCardStatements;
};

export const getCreditCardStatementById = (state: TrackerState, creditCardStatementId: string): CreditCardStatement | null => {
  return state.creditCardStatementState.creditCardStatements.find((creditCardStatement: CreditCardStatement) => creditCardStatement.id === creditCardStatementId) || null;
}
