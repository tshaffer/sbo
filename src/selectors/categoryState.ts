import { TrackerState, Category } from "../types";

export const getCategories = (state: TrackerState): Category[] => {
  return state.categoryState.categories;
};

export const getCategoryById = (state: TrackerState, id: string): Category | undefined => {
  return state.categoryState.categories.find(category => category.id === id);
}

export const getCategoryByName = (state: TrackerState, name: string): Category | undefined => {
  return state.categoryState.categories.find(category => category.name === name);
}

