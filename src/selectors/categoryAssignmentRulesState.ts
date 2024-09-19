import { createSelector } from 'reselect';
import { Category, CategoryAssignmentRule, CategoryAssignmentRulesState, StringToCategoryLUT, TrackerState } from '../types';
import { getCategories, getCategoryById } from './categoryState';

// Input selector: extracts the CategoryAssignmentRulesState slice from the state
const categoryAssignmentRulesState = (state: TrackerState): CategoryAssignmentRulesState => state.categoryAssignmentRulesState;

export const old_getCategoryAssignmentRules = createSelector(
  [categoryAssignmentRulesState],
  (categoryAssignmentRulesState: CategoryAssignmentRulesState): CategoryAssignmentRule[] => categoryAssignmentRulesState.categoryAssignmentRules,
);

export const getCategoryAssignmentRules = createSelector<
  [typeof categoryAssignmentRulesState], // Input selector types
  CategoryAssignmentRule[] // Return type of the selector
>(
  [categoryAssignmentRulesState],
  (categoryAssignmentRulesState: CategoryAssignmentRulesState): CategoryAssignmentRule[] =>
    categoryAssignmentRulesState.categoryAssignmentRules,
);

export const getCategoryAssignmentRuleById = createSelector(
  [getCategoryAssignmentRules, (_: TrackerState, id: string) => id],
  (categoryAssignmentRules: CategoryAssignmentRule[], id: string): CategoryAssignmentRule | undefined => categoryAssignmentRules.find(category => category.id === id)
);

export const getCategoryAssignRuleByPattern = createSelector<
  [typeof getCategoryAssignmentRules, (state: TrackerState, pattern: string) => string], // Input selector types
  CategoryAssignmentRule | undefined // Return type of the selector
>(
  [getCategoryAssignmentRules, (_: TrackerState, pattern: string) => pattern],
  (categoryAssignmentRules: CategoryAssignmentRule[], pattern: string): CategoryAssignmentRule | undefined =>
    categoryAssignmentRules.find(rule => rule.pattern === pattern)
);

export const getCategoryByCategoryAssignmentRulePatterns = createSelector<
  [typeof getCategoryAssignmentRules, (state: TrackerState) => TrackerState], // Input selectors
  StringToCategoryLUT // Return type
>(
  [getCategoryAssignmentRules, (state: TrackerState) => state],
  (categoryAssignmentRules, state): StringToCategoryLUT => {
    const patternToCategoryLUT: StringToCategoryLUT = {};

    for (const categoryAssignmentRule of categoryAssignmentRules) {
      const categoryId = categoryAssignmentRule.categoryId;
      const category = getCategoryById(state, categoryId);

      if (category) {
        patternToCategoryLUT[categoryAssignmentRule.pattern] = category;
      }
    }

    return patternToCategoryLUT;
  }
);