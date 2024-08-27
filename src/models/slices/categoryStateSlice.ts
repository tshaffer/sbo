import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryState, Category } from '../../types';

const initialState: CategoryState = {
  categories: [],
};

const categoryStateSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategoryRedux: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    addCategoriesRedux: (state, action: PayloadAction<Category[]>) => {
      state.categories.push(...action.payload);
    },
    replaceCategoriesRedux: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    updateCategoryRedux: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(category => category.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
  },
});

export const { addCategoryRedux, addCategoriesRedux, replaceCategoriesRedux, updateCategoryRedux } = categoryStateSlice.actions;

export default categoryStateSlice.reducer;