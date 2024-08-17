import { createSelector } from 'reselect';
import { CreditCardStatement, CreditCardStatementState, TrackerState } from '../types';

// Input selector: extracts the CreditCardStatementState slice from the state
const creditCardStatementState = (state: TrackerState): CreditCardStatementState => state.creditCardStatementState;

// Memoized selector: extracts the list of CreditCardStatements
export const getCreditCardStatements = createSelector(
  [creditCardStatementState],
  (creditCardStatementState: CreditCardStatementState): CreditCardStatement[] => creditCardStatementState.creditCardStatements
);

// Selector to get a specific CreditCardStatement by ID
export const getCreditCardStatementById = createSelector(
  [getCreditCardStatements, (_, creditCardStatementId: string) => creditCardStatementId],
  (creditCardStatements: CreditCardStatement[], creditCardStatementId: string): CreditCardStatement | null => {
    return creditCardStatements.find((creditCardStatement: CreditCardStatement) => creditCardStatement.id === creditCardStatementId) || null;
  }
);
