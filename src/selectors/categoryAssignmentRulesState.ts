import { CategoryAssignmentRule, TrackerState } from '../types';

export const getCategoryAssignmentRules = (state: TrackerState): CategoryAssignmentRule[] => {
  return state.categoryAssignmentRulesState.categoryAssignmentRules;
};

