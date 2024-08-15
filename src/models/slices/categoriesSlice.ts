import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryState, Category } from '../../types';

const initialState: CategoryState = {
  categories: [],
};

const categoryStateSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    addCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories.push(...action.payload);
    },
    replaceCategoriesRedux: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
  },
});

export const { addCategory, addCategories, replaceCategoriesRedux } = categoryStateSlice.actions;

export default categoryStateSlice.reducer;