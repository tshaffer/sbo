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
  },
});

export const { addCreditCardStatements } = creditCardStatementSlice.actions;

export default creditCardStatementSlice.reducer;
