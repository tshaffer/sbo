import React, { useState } from 'react';

import { cloneDeep, isEmpty } from 'lodash';

import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

import '../styles/Tracker.css';

import { Category, CategoryAssignmentRule, SidebarMenuButton } from '../types';
import { getCategories, getCategoryAssignmentRules } from '../selectors';
import { deleteCategoryAssignmentRule, updateCategoryAssignmentRule } from '../controllers';
import SelectCategory from './SelectCategory';
import DownloadCategoryAssignmentRules from './DownloadCategoryAssignmentRules';
import UploadCategoryAssignmentRules from './UploadCategoryAssignmentRules';

import { useDispatch, useTypedSelector } from '../types';

interface CategoryAssignmentRuleTableRow {
  pattern: string;
  categoryName: string;
  categoryId: string;
  ruleId: string;
}

const CategoryAssignmentRulesTable: React.FC = () => {

  const dispatch = useDispatch();

  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));

  const [categoryAssignmentRuleById, setCategoryAssignmentRuleById] = React.useState<{ [categoryAssignmentRuleId: string]: CategoryAssignmentRule }>({}); // key is categoryAssignmentRuleId, value is CategoryAssignmentRule
  const [selectCategoryAssignmentRuleById, setSelectCategoryAssignmentRuleById] = React.useState<{ [categoryAssignmentRuleId: string]: string }>({}); // key is categoryAssignmentRuleId, value is pattern
  const [categoryIdByCategoryAssignmentRuleId, setCategoryIdByCategoryAssignmentRuleId] = React.useState<{ [categoryAssignmentRuleId: string]: string }>({}); // key is categoryAssignmentRuleId, value is categoryId
  
  const [sortColumn, setSortColumn] = useState<string>('pattern');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryAssignmentRuleTableRows, setCategoryAssignmentRuleTableRows] = React.useState<CategoryAssignmentRuleTableRow[]>([]);

  const updateCategoryAssignmentRuleTableRows = (): void => {
    const localCategoryAssignmentRuleTableRows: CategoryAssignmentRuleTableRow[] = [];
    for (const categoryAssignmentRule of categoryAssignmentRules) {
      const category: Category = getCategory(categoryAssignmentRule.categoryId);
      localCategoryAssignmentRuleTableRows.push({
        pattern: categoryAssignmentRule.pattern,
        categoryName: category.name,
        categoryId: category.id,
        ruleId: categoryAssignmentRule.id,
      });
    }
    setCategoryAssignmentRuleTableRows(localCategoryAssignmentRuleTableRows);
  }

  const generateReactState = (): void => {
    const localCategoryAssignmentRuleById: { [categoryAssignmentRuleId: string]: CategoryAssignmentRule } = {};
    const localSelectedCategoryAssignmentRuleById: { [categoryAssignmentRuleId: string]: string } = {};
    const localCategoryIdByCategoryAssignmentRuleId: { [categoryAssignmentRuleId: string]: string } = {};
    for (const categoryAssignmentRule of categoryAssignmentRules) {
      localCategoryAssignmentRuleById[categoryAssignmentRule.id] = categoryAssignmentRule;
      localSelectedCategoryAssignmentRuleById[categoryAssignmentRule.id] = categoryAssignmentRule.pattern;
      localCategoryIdByCategoryAssignmentRuleId[categoryAssignmentRule.id] = categoryAssignmentRule.categoryId;
    }

    setCategoryAssignmentRuleById(localCategoryAssignmentRuleById);
    setSelectCategoryAssignmentRuleById(localSelectedCategoryAssignmentRuleById);
    setCategoryIdByCategoryAssignmentRuleId(localCategoryIdByCategoryAssignmentRuleId);
    updateCategoryAssignmentRuleTableRows();
  }

  React.useEffect(() => {
    console.log('useEffect');
    generateReactState();
  }, [categoryAssignmentRules]);

  const updateCategoryAssignmentRuleFromInReactState = (categoryAssignmentRule: CategoryAssignmentRule): void => {
    const localCategoryAssignmentRuleById: { [categoryAssignmentRuleId: string]: CategoryAssignmentRule } = cloneDeep(categoryAssignmentRuleById);
    const localSelectedCategoryAssignmentRuleById: { [categoryAssignmentRuleId: string]: string } = cloneDeep(selectCategoryAssignmentRuleById);
    const localCategoryIdByCategoryAssignmentRuleId: { [categoryAssignmentRuleId: string]: string } = cloneDeep(categoryIdByCategoryAssignmentRuleId);

    localCategoryAssignmentRuleById[categoryAssignmentRule.id] = categoryAssignmentRule;
    localSelectedCategoryAssignmentRuleById[categoryAssignmentRule.id] = categoryAssignmentRule.pattern;
    localCategoryIdByCategoryAssignmentRuleId[categoryAssignmentRule.id] = categoryAssignmentRule.categoryId;

    setCategoryAssignmentRuleById(localCategoryAssignmentRuleById);
    setSelectCategoryAssignmentRuleById(localSelectedCategoryAssignmentRuleById);
    setCategoryIdByCategoryAssignmentRuleId(localCategoryIdByCategoryAssignmentRuleId);
    updateCategoryAssignmentRuleTableRows();
  }

  const deleteCategoryAssignmentRuleInReactState = (categoryAssignmentRuleId: string): void => {
    const localCategoryAssignmentRuleById: { [categoryAssignmentRuleId: string]: CategoryAssignmentRule } = cloneDeep(categoryAssignmentRuleById);
    const localSelectedCategoryAssignmentRuleById: { [categoryAssignmentRuleId: string]: string } = cloneDeep(selectCategoryAssignmentRuleById);
    const localCategoryIdByCategoryAssignmentRuleId: { [categoryAssignmentRuleId: string]: string } = cloneDeep(categoryIdByCategoryAssignmentRuleId);

    delete localCategoryAssignmentRuleById[categoryAssignmentRuleId];
    delete localSelectedCategoryAssignmentRuleById[categoryAssignmentRuleId];
    delete localCategoryIdByCategoryAssignmentRuleId[categoryAssignmentRuleId];

    setCategoryAssignmentRuleById(localCategoryAssignmentRuleById);
    setSelectCategoryAssignmentRuleById(localSelectedCategoryAssignmentRuleById);
    setCategoryIdByCategoryAssignmentRuleId(localCategoryIdByCategoryAssignmentRuleId);
    updateCategoryAssignmentRuleTableRows();
  }

  const updatedCategoryAssignmentRuleCombinationExistsInProps = (pattern: string, categoryId: string): boolean => {
    return categoryAssignmentRules.some((categoryAssignmentRule: CategoryAssignmentRule) => categoryAssignmentRule.pattern === pattern && categoryAssignmentRule.categoryId === categoryId);
  }

  function handleSaveCategoryAssignmentRule(categoryAssignmentRuleId: string): void {
    console.log('handleSaveCategoryAssignmentRule');

    // original values
    const originalCategoryAssignmentRule: CategoryAssignmentRule = categoryAssignmentRules.find((categoryAssignmentRule: CategoryAssignmentRule) => categoryAssignmentRule.id === categoryAssignmentRuleId) as CategoryAssignmentRule;

    const originalPattern = originalCategoryAssignmentRule.pattern;
    const originalCategoryId = originalCategoryAssignmentRule.categoryId;
    const originalCategory = getCategory(originalCategoryId);

    console.log('original values');
    console.log('originalCategoryAssignmentRule', originalCategoryAssignmentRule);
    console.log('originalPattern', originalPattern);
    console.log('originalCategoryId', originalCategoryId);
    console.log('originalCategory', originalCategory);

    // check for updated values
    const updatedCategoryAssignmentRuleViaTextField: CategoryAssignmentRule = categoryAssignmentRuleById[categoryAssignmentRuleId];
    const updatedPatternViaSelect: string = selectCategoryAssignmentRuleById[categoryAssignmentRuleId];
    const updatedCategoryId: string = categoryIdByCategoryAssignmentRuleId[categoryAssignmentRuleId];

    console.log('updated values');
    console.log('updatedCategoryAssignmentRuleViaTextField', updatedCategoryAssignmentRuleViaTextField);
    console.log('updatedPatternViaSelect', updatedPatternViaSelect);
    console.log('updatedCategoryId', updatedCategoryId);

    console.log('SUMMARY');

    const categoryChanged: boolean = updatedCategoryId !== originalCategoryId;
    console.log('categoryChanged', categoryChanged);

    if (updatedCategoryAssignmentRuleViaTextField.pattern !== originalPattern) {
      console.log('pattern changed');
      const patternAlreadyExists: boolean = categoryAssignmentRules.some((categoryAssignmentRule: CategoryAssignmentRule) => categoryAssignmentRule.pattern === updatedCategoryAssignmentRuleViaTextField.pattern);

      if (patternAlreadyExists) {
        // pattern has changed, but the updated one already exists
        console.log('pattern already exists');

        const comboAlreadyExists: boolean = updatedCategoryAssignmentRuleCombinationExistsInProps(updatedCategoryAssignmentRuleViaTextField.pattern, updatedCategoryId);
        console.log('comboAlreadyExists', comboAlreadyExists);

        if (!comboAlreadyExists) {
          // pattern changed, new pattern already exists, combo of new pattern and category does not exist
          // NO - User cannot assign a pattern to a category if the pattern already exists and is assigned to a different category
          console.log('ERROR - pattern assigned to multiple categories');
          // HANDLE ERROR CASE - indicate an error to the user and restore old value
        } else {

          // pattern changed, new pattern already exists, combo of new pattern and category already exists. Delete this instance of categoryAssignmentRule
          deleteCategoryAssignmentRuleInReactState(categoryAssignmentRuleId);
          dispatch(deleteCategoryAssignmentRule(originalCategoryAssignmentRule));

        }
      } else {
        // pattern is new
        console.log('pattern is new');

        // pattern is new. Clone selected CategoryAssignmentRule (includes new pattern). Updated categoryId in case it changed.
        const updatedCategoryAssignmentRule: CategoryAssignmentRule = cloneDeep(updatedCategoryAssignmentRuleViaTextField);
        updatedCategoryAssignmentRule.categoryId = updatedCategoryId;
        updateCategoryAssignmentRuleFromInReactState(updatedCategoryAssignmentRule);
        dispatch(updateCategoryAssignmentRule(updatedCategoryAssignmentRule));

      }
    } else {
      console.log('pattern has not changed');

      if (!categoryChanged) {
        // neither pattern nor category has changed. Do nothing. (Save button should have been disabled).
        console.log('category unchanged, return');
        return;
      } {
        console.log('category has changed');
        const updatedCategoryAssignmentRule: CategoryAssignmentRule = cloneDeep(updatedCategoryAssignmentRuleViaTextField);
        updatedCategoryAssignmentRule.categoryId = updatedCategoryId;
        updateCategoryAssignmentRuleFromInReactState(updatedCategoryAssignmentRule);
        dispatch(updateCategoryAssignmentRule(updatedCategoryAssignmentRule));
      }
    }
  }

  const handleDeleteCategoryAssignmentRule = (categoryAssignmentRuleId: string): void => {
    const categoryAssignmentRule: CategoryAssignmentRule = categoryAssignmentRuleById[categoryAssignmentRuleId];
    deleteCategoryAssignmentRuleInReactState(categoryAssignmentRuleId);
    dispatch(deleteCategoryAssignmentRule(categoryAssignmentRule));
  }

  const getCategory = (categoryId: string): Category => {
    return categories.find((category: Category) => category.id === categoryId) as Category;
  };

  const handleCategoryAssignmentRuleChange = (categoryAssignmentRule: CategoryAssignmentRule, pattern: string) => {
    const currentCategoryAssignmentRuleById: { [pattern: string]: CategoryAssignmentRule } = cloneDeep(categoryAssignmentRuleById);
    const currentCategoryByPattern: CategoryAssignmentRule = currentCategoryAssignmentRuleById[categoryAssignmentRule.id];
    currentCategoryByPattern.pattern = pattern;
    setCategoryAssignmentRuleById(currentCategoryAssignmentRuleById);
    updateCategoryAssignmentRuleTableRows();
  };

  const handleCategoryChange = (categoryAssignmentRuleId: string, categoryId: string) => {
    const currentCategoryIdByCategoryAssignmentRuleId: { [categoryAssignmentRuleId: string]: string } = cloneDeep(categoryIdByCategoryAssignmentRuleId);
    currentCategoryIdByCategoryAssignmentRuleId[categoryAssignmentRuleId] = categoryId;
    setCategoryIdByCategoryAssignmentRuleId(currentCategoryIdByCategoryAssignmentRuleId);
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const sortedCategoryAssignmentRuleTableRows = [...(categoryAssignmentRuleTableRows)].sort((a: any, b: any) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };


  if (categoryAssignmentRules.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" style={{ marginBottom: '8px' }}>{SidebarMenuButton.CategoryAssignmentRules}</Typography>
        <DownloadCategoryAssignmentRules />
        <UploadCategoryAssignmentRules />
      </Box>
    );
  }

  if (isEmpty(categoryAssignmentRuleById)) {
    return <></>;
  }

  const sortedCategoryAssignmentRules: CategoryAssignmentRule[] = sortedCategoryAssignmentRuleTableRows.map((categoryAssignmentRuleTableRow: CategoryAssignmentRuleTableRow) => {
    return {
      id: categoryAssignmentRuleTableRow.ruleId,
      pattern: categoryAssignmentRuleTableRow.pattern,
      categoryId: categoryAssignmentRuleTableRow.categoryId,
    };
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" style={{ marginBottom: '8px' }}>{SidebarMenuButton.CategoryAssignmentRules}</Typography>
      <DownloadCategoryAssignmentRules />
      <UploadCategoryAssignmentRules />
      <div className="table-container">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell-category-assignment-rule" onClick={() => handleSort('pattern')}>Pattern{renderSortIndicator('pattern')}</div>
            <div className="table-cell-category-assignment-rule" onClick={() => handleSort('categoryName')}>Category{renderSortIndicator('categoryName')}</div>
            <div className="table-cell"></div>
          </div>
        </div>
        <div className="category-assignment-rules-table-body">
          {sortedCategoryAssignmentRules.map((categoryAssignmentRule: CategoryAssignmentRule) => (
            <div className="table-row" key={categoryAssignmentRule.id}>
              <div className="table-cell-category-assignment-rule">
                <TextField
                  value={categoryAssignmentRuleById[categoryAssignmentRule.id].pattern}
                  onChange={(event) => handleCategoryAssignmentRuleChange(categoryAssignmentRule, event.target.value)}
                  style={{ minWidth: '400px' }}
                  helperText="Edit the pattern"
                />
              </div>
              <SelectCategory
                selectedCategoryId={categoryIdByCategoryAssignmentRuleId[categoryAssignmentRule.id]}
                onSetCategoryId={(categoryId: string) => handleCategoryChange(categoryAssignmentRule.id, categoryId)}
              />
              <div className="table-cell-category-assignment-rule" style={{ marginLeft: '32px' }}>
                <Tooltip title="Save" arrow>
                  <IconButton onClick={() => handleSaveCategoryAssignmentRule(categoryAssignmentRule.id)}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete" arrow>
                  <IconButton onClick={() => handleDeleteCategoryAssignmentRule(categoryAssignmentRule.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
}

export default CategoryAssignmentRulesTable;
