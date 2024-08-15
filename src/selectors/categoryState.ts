import { isNil } from 'lodash';
import { Category, StringToCategoryLUT, TrackerState, UploadedCategoryAssignmentRule } from '../types';

export const getCategories = (state: TrackerState): Category[] => {
  return state.categoryState.categories;
};

export const getCategoryById = (state: TrackerState, id: string): Category | undefined => {
  return state.categoryState.categories.find(category => category.id === id);
}

export const getCategoryByName = (state: TrackerState, name: string): Category | undefined => {
  return state.categoryState.categories.find(category => category.name === name);
}

export const getCategoryByCategoryNameLUT = (state: TrackerState): StringToCategoryLUT => {
  const categoryLUT: StringToCategoryLUT = {};
  for (const category of state.categoryState.categories) {
    categoryLUT[category.name] = category;
  }
  return categoryLUT;
}

export const getCategoryDisregardLevel = (state: TrackerState, id: string): number => {
  const category = getCategoryById(state, id);
  return category ? category.disregardLevel : 0;
}

export const getMissingCategories = (state: TrackerState, uploadedCategoryAssignmentRules: UploadedCategoryAssignmentRule[]): string[] => {
  const missingCategoryNames: string[] = uploadedCategoryAssignmentRules.reduce(
    (accumulator: string[], uploadedCategoryAssignmentRule: UploadedCategoryAssignmentRule) => {
      const category: Category | undefined = getCategoryByName(state, uploadedCategoryAssignmentRule.categoryName);
      if (isNil(category) && accumulator.indexOf(uploadedCategoryAssignmentRule.categoryName) === -1) {
        accumulator.push(uploadedCategoryAssignmentRule.categoryName);
      }
      return accumulator;
    },
    [],
  );
  return missingCategoryNames;
}

