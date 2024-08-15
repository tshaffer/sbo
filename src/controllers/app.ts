import axios from "axios";
import { serverUrl, apiUrlFragment, TrackerDispatch, TrackerState, TrackerVoidPromiseThunkAction } from "../types";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

// export const initializeServer = (): TrackerAnyPromiseThunkAction => {
//   return (dispatch: TrackerDispatch, getState: any) => {
//     const path = serverUrl + apiUrlFragment + 'initializeDB';
//     return axios.post(path);
//   };
// };

// export const initializeServer = (): ThunkAction<Promise<void>, TrackerState, undefined, AnyAction> => {
//   export const initializeServer = (): TrackerVoidPromiseThunkAction => {
//     return async (dispatch: TrackerDispatch, getState: () => TrackerState) => {
//     const path = serverUrl + apiUrlFragment + 'initializeDB';
//     await axios.post(path);
//     // Optionally, dispatch some action on success
//   };
// };

export const initializeServer = (): ThunkAction<Promise<void>, TrackerState, undefined, AnyAction> => {
  return async (dispatch: TrackerDispatch, getState: () => TrackerState) => {
    const path = serverUrl + apiUrlFragment + 'initializeDB';
    await axios.post(path);
    // Optionally, dispatch some action on success
  };
};