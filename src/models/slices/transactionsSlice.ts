import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionsState, Transaction, SplitTransaction, CheckingAccountTransaction } from '../../types';
const initialState: TransactionsState = {
  byId: {},
  allIds: [],
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      return initialState;
    },
    addTransactions: (state, action: PayloadAction<Transaction[]>) => {
      action.payload.forEach((transaction) => {
        state.byId[transaction.id] = transaction;
        if (!state.allIds.includes(transaction.id)) {
          state.allIds.push(transaction.id);
        }
      });
    },
    updateTransactionRedux: (state, action: PayloadAction<Transaction>) => {
      const transaction = action.payload;
      if (state.byId[transaction.id]) {
        state.byId[transaction.id] = transaction;
      }
    },
    updateCategoryInTransactionsRedux: (
      state,
      action: PayloadAction<{ categoryId: string; transactionIds: string[] }>
    ) => {
      const { categoryId, transactionIds } = action.payload;
      transactionIds.forEach((transactionId) => {
        if (state.byId[transactionId]) {
          state.byId[transactionId].overrideCategory = true;
          state.byId[transactionId].overrideCategoryId = categoryId;
        }
      });
    },
    setOverrideCategory: (
      state,
      action: PayloadAction<{ transactionId: string; overrideCategory: boolean }>
    ) => {
      const { transactionId, overrideCategory } = action.payload;
      if (state.byId[transactionId]) {
        state.byId[transactionId].overrideCategory = overrideCategory;
      }
    },
    setOverrideCategoryId: (
      state,
      action: PayloadAction<{ transactionId: string; overrideCategoryId: string }>
    ) => {
      const { transactionId, overrideCategoryId } = action.payload;
      if (state.byId[transactionId]) {
        state.byId[transactionId].overrideCategoryId = overrideCategoryId;
      }
    },
    setOverrideFixedExpense: (
      state,
      action: PayloadAction<{ transactionId: string; overrideFixedExpense: boolean }>
    ) => {
      const { transactionId, overrideFixedExpense } = action.payload;
      if (state.byId[transactionId]) {
        state.byId[transactionId].overrideFixedExpense = overrideFixedExpense;
      }
    },
    setOverriddenFixedExpense: (
      state,
      action: PayloadAction<{ transactionId: string; overriddenFixedExpense: boolean }>
    ) => {
      const { transactionId, overriddenFixedExpense } = action.payload;
      if (state.byId[transactionId]) {
        state.byId[transactionId].overriddenFixedExpense = overriddenFixedExpense;
      }
    },
    splitTransactionRedux: (
      state,
      action: PayloadAction<{ parentTransactionId: string; splitTransactions: SplitTransaction[] }>
    ) => {
      const { parentTransactionId, splitTransactions } = action.payload;
      const parentTransaction: CheckingAccountTransaction = state.byId[
        parentTransactionId
      ] as CheckingAccountTransaction;
      if (parentTransaction) {
        parentTransaction.isSplit = true;
        splitTransactions.forEach((splitTransaction) => {
          const newTransaction: CheckingAccountTransaction = {
            ...parentTransaction,
            ...splitTransaction,
            parentTransactionId,
          };
          state.byId[splitTransaction.id] = newTransaction;
        });
      }
    },
  },
});

export const {
  clearTransactions,
  addTransactions,
  updateTransactionRedux,
  updateCategoryInTransactionsRedux,
  setOverrideCategory,
  setOverrideCategoryId,
  setOverrideFixedExpense,
  setOverriddenFixedExpense,
  splitTransactionRedux,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;