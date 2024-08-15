import axios from "axios";
import { addCheckingAccountStatements, addCreditCardStatements } from "../models";
import { CheckingAccountStatement, CreditCardStatement, TrackerAnyPromiseThunkAction, TrackerDispatch, TrackerVoidPromiseThunkAction, apiUrlFragment, serverUrl } from "../types";

export const loadCreditCardStatements = (): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'creditCardStatements';

    return axios.get(path)
      .then((response: any) => {
        const statements: CreditCardStatement[] = response.data;
        dispatch(addCreditCardStatements(statements));
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