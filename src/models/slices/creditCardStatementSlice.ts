import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreditCardStatement, CreditCardStatementState } from '../../types';

const initialState: CreditCardStatementState = {
  creditCardStatements: [],
};

const creditCardStatementSlice = createSlice({
  name: 'creditCardStatement',
  initialState,
  reducers: {
    addCreditCardStatements: (
      state,
      action: PayloadAction<CreditCardStatement[]>
    ) => {
      state.creditCardStatements = action.payload;
    },
    addCreditCardStatement(
      state,
      action: PayloadAction<CreditCardStatement>) {
      state.creditCardStatements = state.creditCardStatements.concat(action.payload);
    },
  },
});

export const { addCreditCardStatements, addCreditCardStatement } = creditCardStatementSlice.actions;

export default creditCardStatementSlice.reducer;
