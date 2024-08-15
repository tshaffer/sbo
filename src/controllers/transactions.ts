import axios from "axios";
import { TrackerVoidPromiseThunkAction, TrackerDispatch, Transactions, Transaction, serverUrl, apiUrlFragment } from "../types";
import { clearTransactions, addTransactions } from "../models/slices/transactionsSlice";

export const loadTransactions = (startDate: string, endDate: string, includeCreditCardTransactions: boolean, includeCheckingAccountTransactions: boolean): TrackerVoidPromiseThunkAction => {
  return async (dispatch: TrackerDispatch, getState: any) => {
    const transactionsFromDb: Transactions = await getTransactions(startDate, endDate, includeCreditCardTransactions, includeCheckingAccountTransactions);
    dispatch(clearTransactions());
    const { creditCardTransactions, checkingAccountTransactions } = transactionsFromDb;
    dispatch(addTransactions(creditCardTransactions as Transaction[]));
    dispatch(addTransactions(checkingAccountTransactions as Transaction[]));
    return Promise.resolve();
  };
}

const getTransactions = async (startDate: string, endDate: string, includeCreditCardTransactions: boolean, includeCheckingAccountTransactions: boolean): Promise<Transactions> => {

  let path = serverUrl
    + apiUrlFragment
    + 'transactions';

  path += '?startDate=' + startDate;
  path += '&endDate=' + endDate;
  path += '&includeCreditCardTransactions=' + includeCreditCardTransactions;
  path += '&includeCheckingAccountTransactions=' + includeCheckingAccountTransactions;

  return axios.get(path)
    .then((transactionsResponse: any) => {
      const transactions: Transactions = transactionsResponse.data;
      return Promise.resolve(transactions);
    });

}


