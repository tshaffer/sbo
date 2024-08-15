import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryAssignmentRule, CategoryAssignmentRulesState } from '../../types';

const initialState: CategoryAssignmentRulesState = {
  categoryAssignmentRules: [],
};

const categoryAssignmentRulesSlice = createSlice({
  name: 'categoryAssignmentRules',
  initialState,
  reducers: {
    addCategoryAssignmentRuleRedux(state, action: PayloadAction<CategoryAssignmentRule>) {
      state.categoryAssignmentRules.push(action.payload);
    },
    updateCategoryAssignmentRuleRedux(state, action: PayloadAction<CategoryAssignmentRule>) {
      const updatedCategoryAssignmentRule = action.payload;
      const index = state.categoryAssignmentRules.findIndex(
        ((rule: any) => rule.id === updatedCategoryAssignmentRule.id)
      );
      if (index !== -1) {
        state.categoryAssignmentRules[index] = updatedCategoryAssignmentRule;
      }
    },
    deleteCategoryAssignmentRuleRedux(state, action: PayloadAction<CategoryAssignmentRule>) {
      state.categoryAssignmentRules = state.categoryAssignmentRules.filter(
        ((rule: any) => rule.id !== action.payload.id)
      );
    },
    addCategoryAssignmentRules(state, action: PayloadAction<CategoryAssignmentRule[]>) {
      state.categoryAssignmentRules = state.categoryAssignmentRules.concat(action.payload);
    },
    replaceCategoryAssignmentRulesRedux(state, action: PayloadAction<CategoryAssignmentRule[]>) {
      state.categoryAssignmentRules = action.payload;
    },
  },
});

// Export the actions generated by createSlice
export const {
  addCategoryAssignmentRuleRedux,
  updateCategoryAssignmentRuleRedux,
  deleteCategoryAssignmentRuleRedux,
  addCategoryAssignmentRules,
  replaceCategoryAssignmentRulesRedux,
} = categoryAssignmentRulesSlice.actions;

// Export the reducer to be included in the store
export default categoryAssignmentRulesSlice.reducer;