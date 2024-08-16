import { createSelector } from 'reselect';
import { AppState, TrackerState } from '../types';

// Input selector: extracts the appState slice from the state
const selectAppState = (state: TrackerState): AppState => state.appState;

// Memoized selector: extracts the appInitialized property from appState
export const getAppInitialized = createSelector(
  [selectAppState],
  (appState: AppState): boolean => appState.appInitialized,
);
