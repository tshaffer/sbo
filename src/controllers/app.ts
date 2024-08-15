import axios from "axios";
import { serverUrl, apiUrlFragment, TrackerDispatch, TrackerState, TrackerVoidPromiseThunkAction } from "../types";
import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

// export const initializeServer = (): TrackerAnyPromiseThunkAction => {
//   return (dispatch: TrackerDispatch, getState: any) => {
//     const path = serverUrl + apiUrlFragment + 'initializeDB';
//     return axios.post(path);
//   };
// };

// export const initializeServer = (): ThunkAction<Promise<void>, TrackerState, undefined, AnyAction> => {
  export const initializeServer = (): TrackerVoidPromiseThunkAction => {
    return async (dispatch: TrackerDispatch, getState: () => TrackerState) => {
    const path = serverUrl + apiUrlFragment + 'initializeDB';
    await axios.post(path);
    // Optionally, dispatch some action on success
  };
};