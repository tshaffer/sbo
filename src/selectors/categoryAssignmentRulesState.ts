import { createSelector } from 'reselect';
import { Category, CategoryAssignmentRule, CategoryAssignmentRulesState, StringToCategoryLUT, TrackerState } from '../types';
import { getCategories, getCategoryById } from './categoryState';

// Input selector: extracts the CategoryAssignmentRulesState slice from the state
const categoryAssignmentRulesState = (state: TrackerState): CategoryAssignmentRulesState => state.categoryAssignmentRulesState;

export const getCategoryAssignmentRules = createSelector<
  [typeof categoryAssignmentRulesState], // Input selector types
  CategoryAssignmentRule[] // Return type of the selector
>(
  [categoryAssignmentRulesState],
  (categoryAssignmentRulesState: CategoryAssignmentRulesState): CategoryAssignmentRule[] =>
    categoryAssignmentRulesState.categoryAssignmentRules,
);

// export const xgetCategoryAssignmentRuleByCategoryAssignmentRule = createSelector(
//   [getCategoryAssignmentRules, (_: TrackerState, id: string) => id],
//   (categoryAssignmentRules: CategoryAssignmentRule[], id: string): CategoryAssignmentRule | undefined => categoryAssignmentRules.find(categoryAssignmentRule => categoryAssignmentRule.id === id)
// );

export const getCategoryAssignmentRuleById = createSelector(
  [getCategoryAssignmentRules, (_: TrackerState, id: string) => id],
  (categoryAssignmentRules: CategoryAssignmentRule[], id: string): CategoryAssignmentRule | undefined => categoryAssignmentRules.find(category => category.id === id)
);

export const getCategoryAssignmentRuleByCategoryAssignmentRuleId = createSelector<
  [typeof getCategoryAssignmentRules], // Input selector type
  { [categoryAssignmentRuleId: string]: CategoryAssignmentRule } // Return type
>(
  [getCategoryAssignmentRules],
  (categoryAssignmentRules: CategoryAssignmentRule[]): { [categoryAssignmentRuleId: string]: CategoryAssignmentRule } => {
    const categoryAssignmentRuleByCategoryAssignmentRuleId: { [categoryAssignmentRuleId: string]: CategoryAssignmentRule } = {};
    for (const categoryAssignmentRule of categoryAssignmentRules) {
      categoryAssignmentRuleByCategoryAssignmentRuleId[categoryAssignmentRule.id] = categoryAssignmentRule;

    }

    return categoryAssignmentRuleByCategoryAssignmentRuleId;
  }
);

export const getCategoryIdByCategoryAssignmentRuleId = createSelector<
  [typeof getCategoryAssignmentRules], // Input selector type
  { [categoryAssignmentRuleId: string]: string } // Return type
>(
  [getCategoryAssignmentRules],
  (categoryAssignmentRules: CategoryAssignmentRule[]): { [categoryAssignmentRuleId: string]: string } => {
    return categoryAssignmentRules.reduce((acc, categoryAssignmentRule) => {
      acc[categoryAssignmentRule.id] = categoryAssignmentRule.categoryId;
      return acc;
    }, {} as { [categoryAssignmentRuleId: string]: string });
  }
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