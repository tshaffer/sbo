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
  },
});

export const { addCategoryRedux, addCategoriesRedux, replaceCategoriesRedux } = categoryStateSlice.actions;

export default categoryStateSlice.reducer;