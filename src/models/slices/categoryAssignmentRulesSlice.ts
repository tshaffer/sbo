import { createSlice } from '@reduxjs/toolkit';
import { CategoryAssignmentRule } from '../../types';

const categoryAssignmentRulesSlice = createSlice({
  name: 'categoryAssignmentRules',
  initialState: [] as CategoryAssignmentRule[],
  reducers: {
  },
});

export default categoryAssignmentRulesSlice.reducer;