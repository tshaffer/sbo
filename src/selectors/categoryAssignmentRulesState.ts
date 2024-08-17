import { createSelector } from 'reselect';
import { CategoryAssignmentRule, CategoryAssignmentRulesState, TrackerState } from '../types';

// Input selector: extracts the CategoryAssignmentRulesState slice from the state
const categoryAssignmentRulesState = (state: TrackerState): CategoryAssignmentRulesState => state.categoryAssignmentRulesState;

// Memoized selector: extracts the appInitialized property from appState
export const getCategoryAssignmentRules = createSelector(
  [categoryAssignmentRulesState],
  (categoryAssignmentRulesState: CategoryAssignmentRulesState): CategoryAssignmentRule[] => categoryAssignmentRulesState.categoryAssignmentRules,
);
