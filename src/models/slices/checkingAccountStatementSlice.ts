import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CheckingAccountStatement, CheckingAccountStatementState } from '../../types';

const initialState: CheckingAccountStatementState = {
  checkingAccountStatements: [],
};

const checkingAccountStatementSlice = createSlice({
  name: 'checkingAccountStatements',
  initialState,
  reducers: {
    addCheckingAccountStatements: (
      state,
      action: PayloadAction<CheckingAccountStatement[]>
    ) => {
      state.checkingAccountStatements = action.payload;
    },
  },
});

export const { addCheckingAccountStatements } = checkingAccountStatementSlice.actions;

export default checkingAccountStatementSlice.reducer;
