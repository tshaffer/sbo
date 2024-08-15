import { TrackerState } from "../types";

export const getAppInitialized = (state: TrackerState): boolean => {
  return state.appState.appInitialized;
};
