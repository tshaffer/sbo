import { createSelector } from 'reselect';
import { isNil } from 'lodash';
import {
  Category,
  StringToCategoryLUT,
  TrackerState,
  UploadedCategoryAssignmentRule
} from '../types';

// Input selector: extracts the categoryState slice from the state
const getCategoryState = (state: TrackerState) => state.categoryState;

// Memoized selector: extracts the categories from categoryState
export const getCategories = createSelector(
  [getCategoryState],
  (categoryState) => categoryState.categories
);

// Selector to get a category by its ID
export const getCategoryById = createSelector(
  [getCategories, (_: TrackerState, id: string) => id],
  (categories: Category[], id: string): Category | undefined => categories.find(category => category.id === id)
);

// Selector to get a category by its name
export const getCategoryByName = createSelector(
  [getCategories, (_: TrackerState, name: string) => name],
  (categories: Category[], name: string): Category | undefined => categories.find(category => category.name === name)
);

// Selector to create a lookup table by category name
export const getCategoryByCategoryNameLUT = createSelector(
  [getCategories],
  (categories: Category[]): StringToCategoryLUT => {
    const categoryLUT: StringToCategoryLUT = {};
    for (const category of categories) {
      categoryLUT[category.name] = category;
    }
    return categoryLUT;
  }
);

export const getCategoryByCategoryIdLUT = createSelector(
  [getCategories],
  (categories: Category[]): StringToCategoryLUT => {
    const categoryLUT: StringToCategoryLUT = {};
    for (const category of categories) {
      categoryLUT[category.id] = category;
    }
    return categoryLUT;
  }
);

// Selector to find missing categories based on uploaded category assignment rules
export const getMissingCategories = createSelector(
  [getCategories, (_: TrackerState, uploadedCategoryAssignmentRules: UploadedCategoryAssignmentRule[]) => uploadedCategoryAssignmentRules],
  (categories: Category[], uploadedCategoryAssignmentRules: UploadedCategoryAssignmentRule[]): string[] => {
    const missingCategoryNames: string[] = uploadedCategoryAssignmentRules.reduce(
      (accumulator: string[], uploadedCategoryAssignmentRule: UploadedCategoryAssignmentRule) => {
        const category = categories.find(cat => cat.name === uploadedCategoryAssignmentRule.categoryName);
        if (isNil(category) && !accumulator.includes(uploadedCategoryAssignmentRule.categoryName)) {
          accumulator.push(uploadedCategoryAssignmentRule.categoryName);
        }
        return accumulator;
      },
      []
    );
    return missingCategoryNames;
  }
);
