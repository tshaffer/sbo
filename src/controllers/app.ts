import axios from "axios";
import { serverUrl, apiUrlFragment, TrackerAnyPromiseThunkAction, TrackerDispatch } from "../types";

export const initializeServer = (): TrackerAnyPromiseThunkAction => {
  return (dispatch: TrackerDispatch, getState: any) => {
    const path = serverUrl + apiUrlFragment + 'initializeDB';
    return axios.post(path);
  };
};

