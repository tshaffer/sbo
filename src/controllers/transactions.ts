import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import {
  apiUrlFragment,
  CheckingAccountTransaction,
  CheckTransaction,
  MinMaxDates,
  serverUrl,
  SplitTransaction,
  TrackerAnyPromiseThunkAction,
  TrackerDispatch,
  TrackerVoidPromiseThunkAction,
  Transaction,
  Transactions,
} from "../types";
import {
  addTransactions,
  clearTransactions,
  setMinMaxTransactionDates,
  splitTransactionRedux,
  updateCategoryInTransactionsRedux,
  updateTransactionRedux
} from "../models";
import { isNil } from "lodash";
import { getTransactionById } from "../selectors";

const getISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getMinDate = (date1: string, date2: string): string => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const minDate = d1 < d2 ? d1 : d2;
  return getISODateString(minDate);
};

const getMaxDate = (date1: string, date2: string): string => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const maxDate = d1 > d2 ? d1 : d2;
  return getISODateString(maxDate);
};

export const loadAccountMinMaxTransactionDates = (endpoint: string): Promise<MinMaxDates> => {

  const path = serverUrl + apiUrlFragment + endpoint;

  return axios.get(path)
    .then((response: any) => {
      const minMaxStartDates: MinMaxDates = response.data;
      return Promise.resolve(minMaxStartDates);
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return Promise.resolve({ minDate: '', maxDate: '' });
    });
};


export const loadMinMaxTransactionDates = (): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const p1 = loadAccountMinMaxTransactionDates('minMaxCreditCardTransactionDates');
    const p2 = loadAccountMinMaxTransactionDates('minMaxCheckingAccountTransactionDates');

    return Promise.all([p1, p2])
      .then((results) => {

        let minDate: string = '';
        let maxDate: string = '';

        const [result1, result2] = results;

        if (isNil(result1)) {
          if (result2 !== null) {
            ({ minDate, maxDate } = result2);
          }
        } else if (isNil(result2)) {
          ({ minDate, maxDate } = result1);
        } else {
          minDate = getMinDate(result1.minDate, result2.minDate);
          maxDate = getMaxDate(result1.maxDate, result2.maxDate);
        }

        const minMaxStartDates: MinMaxDates = {
          minDate,
          maxDate,
        };
        return dispatch(setMinMaxTransactionDates(minMaxStartDates));
      });
  };
};

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

export const updateCheckTransaction = (checkTransaction: CheckTransaction): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'updateTransaction';

    const updateCheckTransactionBody = { checkTransaction };

    return axios.post(
      path,
      updateCheckTransactionBody
    ).then((response) => {
      console.log('updateCheckTransaction');
      console.log(response);
      console.log(response.data);
      dispatch(updateTransactionRedux(checkTransaction));
      return Promise.resolve(response.data as CheckTransaction);
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
}

export const updateTransaction = (transaction: Transaction): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'updateTransaction';

    const updateTransactionBody = { transaction };

    console.log('updateTransaction: ', updateTransactionBody);
    return axios.post(
      path,
      updateTransactionBody
    ).then((response) => {
      console.log('updateTransaction');
      console.log(response);
      console.log(response.data);
      dispatch(updateTransactionRedux(transaction));
      return Promise.resolve(response.data as CheckTransaction);
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
}

export const updateCategoryInTransactions = (
  categoryId: string,
  transactionIds: string[],
): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'updateCategoryInTransactions';

    const updateCategoryInTransactionsBody = { categoryId, transactionIds };

    console.log('updateCategoryInTransactions: ', updateCategoryInTransactionsBody);
    return axios.post(
      path,
      updateCategoryInTransactionsBody
    ).then((response) => {
      console.log('updateCategoryInTransactions');
      console.log(response);
      console.log(response.data);
      dispatch(updateCategoryInTransactionsRedux( { categoryId, transactionIds }));
      return Promise.resolve(response.data as CheckTransaction);
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
}

export const splitTransaction = (
  parentTransactionId: string,
  splitTransactions: SplitTransaction[]
): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'splitTransaction';

    const parentTransaction: CheckingAccountTransaction = getTransactionById(getState(), parentTransactionId) as CheckingAccountTransaction;

    const newTransactions: CheckingAccountTransaction[] = splitTransactions.map((splitTransaction: SplitTransaction) => {
      const newTransaction: CheckingAccountTransaction = {
        ...parentTransaction,
        ...splitTransaction,
        isSplit: false,
        parentTransactionId,
        id: uuidv4(),
      };
      delete (newTransaction as any)._id;
      return newTransaction
    });

    const splitTransactionBody = {
      parentTransactionId,
      newTransactions,
    };

    console.log('splitTransaction: ', splitTransactionBody);
    return axios.post(
      path,
      splitTransactionBody
    ).then((response) => {
      console.log('splitTransaction');
      console.log(response);
      console.log(response.data);
      dispatch(splitTransactionRedux( { parentTransactionId, splitTransactions } ));
      return Promise.resolve();
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
};

export const getTransactionsByCategoryAssignmentRuleId = (categoryAssignmentRuleId: string): TrackerAnyPromiseThunkAction => {
  return async (dispatch: TrackerDispatch, getState: any) => {
    const path = serverUrl + apiUrlFragment + 'transactionsByCategoryAssignmentRuleId?categoryAssignmentRuleId=' + categoryAssignmentRuleId;
    return axios.get(path)
      .then((response: any) => {
        const transactions: Transaction[] = response.data;
        console.log('getTransactionsByCategoryAssignmentRuleId: ', transactions);
        return transactions;
      })
  }
};
