import axios from "axios";
import { serverUrl, apiUrlFragment, TrackerDispatch, TrackerState, TrackerVoidPromiseThunkAction } from "../types";

export const initializeServer = (): TrackerVoidPromiseThunkAction => {
  return async (dispatch: TrackerDispatch, getState: () => TrackerState) => {
    const path = serverUrl + apiUrlFragment + 'initializeDB';
    await axios.post(path);
  };
};