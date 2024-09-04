import axios from "axios";
import { CheckingAccountStatement, CreditCardStatement, StatementType, TrackerAnyPromiseThunkAction, TrackerDispatch, TrackerVoidPromiseThunkAction, Transaction, apiUrlFragment, serverUrl } from "../types";
import { addCreditCardStatements, addCheckingAccountStatements, addCreditCardStatement, addTransactions } from "../models";
import { getTransactionsByStatementId } from "../selectors";
import { cloneDeep } from "lodash";

export const loadCreditCardStatements = (): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'creditCardStatements';

    return axios.get(path)
      .then((response: any) => {
        const statements: CreditCardStatement[] = response.data;
        dispatch(addCreditCardStatements(statements));
        // dispatch(addAllTransactionsStatement(statements));
        return Promise.resolve();
      }).catch((error) => {
        console.log('error');
        console.log(error);
        return '';
      });
  };
};


export const loadCheckingAccountStatements = (): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'checkingAccountStatements';

    return axios.get(path)
      .then((response: any) => {
        const statements: CheckingAccountStatement[] = response.data;
        dispatch(addCheckingAccountStatements(statements));
        return Promise.resolve();
      }).catch((error) => {
        console.log('error');
        console.log(error);
        return '';
      });
  };
};


export const uploadFile = (formData: FormData): TrackerVoidPromiseThunkAction => {
  return (dispatch: TrackerDispatch, getState: any) => {
    const path = serverUrl + apiUrlFragment + 'statement';
    return axios.post(path, formData);
  };
};

function findMinMaxDates(statements: CreditCardStatement[]): { minDate: string, maxDate: string } {

  if (statements.length === 0) {
    throw new Error("The input array is empty.");
  }

  let minDate = statements[0].startDate;
  let maxDate = statements[0].endDate;

  statements.forEach(item => {
    if (item.startDate < minDate) {
      minDate = item.startDate;
    }
    if (item.endDate > maxDate) {
      maxDate = item.endDate;
    }
  });

  return { minDate, maxDate };
}


export const addAllTransactionsStatement = (statements: CreditCardStatement[]): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const state = getState();

    const allTransactionsStatement: CreditCardStatement = {
      id: 'allTransactions',
      fileName: 'All Transactions',
      type: StatementType.CreditCard,
      startDate: '',
      endDate: '',
      transactionCount: 0,
      netDebits: 0,
    };

    const minMaxDates = findMinMaxDates(statements);
    allTransactionsStatement.startDate = minMaxDates.minDate;
    allTransactionsStatement.endDate = minMaxDates.maxDate;

    const allClonedTransactions: Transaction[] = [];

    statements.forEach((statement: CreditCardStatement) => {
      const allTransactionsInStatement: Transaction[] = getTransactionsByStatementId(state, statement.id);
      allTransactionsInStatement.forEach((transaction: Transaction) => {
        const clonedTransaction = cloneDeep(transaction);
        clonedTransaction.statementId = allTransactionsStatement.id;
        allClonedTransactions.push(clonedTransaction);
      });
    });

    allTransactionsStatement.transactionCount = statements.reduce((acc, statement) => acc + statement.transactionCount, 0);
    allTransactionsStatement.netDebits = statements.reduce((acc, statement) => acc + statement.netDebits, 0);

    console.log('addAllTransactionsStatement');
    dispatch(addTransactions(allClonedTransactions));
    dispatch(addCreditCardStatement(allTransactionsStatement));

    return Promise.resolve();
  };
}

