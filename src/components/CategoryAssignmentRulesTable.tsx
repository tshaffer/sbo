import React, { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { cloneDeep, isArray, isEmpty, isNil } from 'lodash';

import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';

import '../styles/Tracker.css';
import '../styles/CategoryAssignmentRulesTable.css';

import { Category, CategoryAssignmentRule, SidebarMenuButton } from '../types';
import { getCategories, getCategoryAssignmentRules, getTransactionsByCategoryAssignmentRules } from '../selectors';
import { addCategoryAssignmentRule, deleteCategoryAssignmentRule, updateCategoryAssignmentRule } from '../controllers';
import SelectCategory from './SelectCategory';
import DownloadCategoryAssignmentRules from './DownloadCategoryAssignmentRules';
import UploadCategoryAssignmentRules from './UploadCategoryAssignmentRules';
import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import CategoryAssignmentRuleTransactionsListDialog from './CategoryAssignmentRuleTransactionsListDialog';

import { useDispatch, useTypedSelector } from '../types';

interface CategoryAssignmentRuleTableRow {
  pattern: string;
  categoryName: string;
  categoryId: string;
  ruleId: string;
}

const CategoryAssignmentRulesTable: React.FC = () => {

  const updatingReactState = React.useRef(false);

  const dispatch = useDispatch();

  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));

  const transactionsByCategoryAssignmentRules: any = useTypedSelector(state => getTransactionsByCategoryAssignmentRules(state))!;

  const [categoryAssignmentRuleById, setCategoryAssignmentRuleById] = React.useState<{ [categoryAssignmentRuleId: string]: CategoryAssignmentRule }>({}); // key is categoryAssignmentRuleId, value is CategoryAssignmentRule
  const [selectCategoryAssignmentRuleById, setSelectCategoryAssignmentRuleById] = React.useState<{ [categoryAssignmentRuleId: string]: string }>({}); // key is categoryAssignmentRuleId, value is pattern
  const [categoryIdByCategoryAssignmentRuleId, setCategoryIdByCategoryAssignmentRuleId] = React.useState<{ [categoryAssignmentRuleId: string]: string }>({}); // key is categoryAssignmentRuleId, value is categoryId

  const [sortColumn, setSortColumn] = useState<string>('pattern');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryAssignmentRuleTableRows, setCategoryAssignmentRuleTableRows] = React.useState<CategoryAssignmentRuleTableRow[]>([]);

  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [categoryAssignmentRuleId, setCategoryAssignmentRuleId] = React.useState('');
  const [showCategoryAssignmentRuleTransactionsListDialog, setShowCategoryAssignmentRuleTransactionsListDialog] = React.useState(false);

  const handleSaveRule = (pattern: string, categoryId: string): void => {
    const id: string = uuidv4();
    const categoryAssignmentRule: CategoryAssignmentRule = {
      id,
      pattern,
      categoryId
    };
    console.log('handleSaveRule: ', categoryAssignmentRule, categoryAssignmentRule);
    dispatch(addCategoryAssignmentRule(categoryAssignmentRule));
  }

  const handleCloseAddRuleDialog = () => {
    setShowAddCategoryAssignmentRuleDialog(false);
  }

  const handleShowCategoryAssignmentRuleTransactionsListDialog = (id: string) => {
    setCategoryAssignmentRuleId(id);
    setShowCategoryAssignmentRuleTransactionsListDialog(true);
  }

  const handleCloseCategoryAssignmentRuleTransactionsListDialog = () => {
    setShowCategoryAssignmentRuleTransactionsListDialog(false);
  }

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
    console.log('updateCategoryAssignmentRuleTableRows invoked, length', localCategoryAssignmentRuleTableRows.length);
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
    console.log('return from deleteCategoryAssignmentRuleInReactState');
    updatingReactState.current = true;
    console.log('set updatingReactState.current to', updatingReactState.current);
    setTimeout(() => {
      updatingReactState.current = false;
      console.log('set updatingReactState.current to', updatingReactState.current);
      dispatch(deleteCategoryAssignmentRule(categoryAssignmentRule));
      console.log('timeout expired, return from deleteCategoryAssignmentRule');
      console.log('categoryAssignmentRuleTableRows, length', categoryAssignmentRuleTableRows.length);
    }, 0);
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
    // console.log('sortedCategoryAssignmentRules invoked');
    // console.log('sortedCategoryAssignmentRuleTableRows length', sortedCategoryAssignmentRuleTableRows.length);
    return {
      id: categoryAssignmentRuleTableRow.ruleId,
      pattern: categoryAssignmentRuleTableRow.pattern,
      categoryId: categoryAssignmentRuleTableRow.categoryId,
    };
  });

  const getShowCategoryAssignmentRuleTransactionsListDialog = (): JSX.Element | null => {
    if (showCategoryAssignmentRuleTransactionsListDialog) {
      return (
        <CategoryAssignmentRuleTransactionsListDialog
          open={showCategoryAssignmentRuleTransactionsListDialog}
          categoryAssignmentRuleId={categoryAssignmentRuleId}
          onClose={handleCloseCategoryAssignmentRuleTransactionsListDialog}
        />
      );
    }
    return null;
  };

  const getTransactionCountForRule = (categoryAssignmentRuleId: string): number => {
    if (!isArray(transactionsByCategoryAssignmentRules[categoryAssignmentRuleId])) {
      return 0;
    }
    return transactionsByCategoryAssignmentRules[categoryAssignmentRuleId].length;
  }

  console.log('render CategoryAssignmentRulesTable');
  console.log(updatingReactState.current);

  console.log('categoryAssignmentRuleById keys count', Object.keys(categoryAssignmentRuleById).length);
  console.log('sortedCategoryAssignmentRules count', sortedCategoryAssignmentRules.length);
  
  if (updatingReactState.current) {
    return <></>;
  }

  return (
    <React.Fragment>
      <AddCategoryAssignmentRuleDialog
        open={showAddCategoryAssignmentRuleDialog}
        transactionId={''}
        onClose={handleCloseAddRuleDialog}
        onSaveRule={handleSaveRule}
      />
      {getShowCategoryAssignmentRuleTransactionsListDialog()}
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" style={{ marginBottom: '8px' }}>{SidebarMenuButton.CategoryAssignmentRules}</Typography>
        <DownloadCategoryAssignmentRules />
        <UploadCategoryAssignmentRules />
        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowAddCategoryAssignmentRuleDialog(true)}
          >
            Add Rule
          </Button>
        </Box>
        <div className="car-t-container">
          <div className="car-t-header">
            <div className="car-t-base-row">
              <div className="car-t-b-t-cell car-t-c-pattern" onClick={() => handleSort('pattern')}>Pattern{renderSortIndicator('pattern')}</div>
              <div className="car-t-b-t-cell car-t-c-category" onClick={() => handleSort('categoryName')}>Category{renderSortIndicator('categoryName')}</div>
              <div className="car-t-b-t-cell car-t-c-transaction-count">Transaction Count</div>
              <div className="car-t-b-t-cell car-t-c-icons"></div>
            </div>
          </div>
          <div className="car-t-body">
            {sortedCategoryAssignmentRules.map((categoryAssignmentRule: CategoryAssignmentRule) => (
              <div className="car-t-base-row car-t-body-row" key={categoryAssignmentRule.id}>
                <div className="car-t-b-t-cell car-t-c-pattern">
                  <TextField
                    value={categoryAssignmentRuleById[categoryAssignmentRule.id].pattern}
                    onChange={(event) => handleCategoryAssignmentRuleChange(categoryAssignmentRule, event.target.value)}
                    style={{ minWidth: '400px' }}
                  // helperText="Edit the pattern"
                  />
                </div>
                <div
                  className="car-t-b-t-cell car-t-c-category"
                >
                  <SelectCategory
                    selectedCategoryId={categoryIdByCategoryAssignmentRuleId[categoryAssignmentRule.id]}
                    onSetCategoryId={(categoryId: string) => handleCategoryChange(categoryAssignmentRule.id, categoryId)}
                  />
                </div>
                <div className="car-t-b-t-cell car-t-c-transaction-count">
                  {getTransactionCountForRule(categoryAssignmentRule.id)}
                </div>
                <div className="car-t-b-t-cell car-t-c-icons">
                  <Tooltip title="Transactions" arrow>
                    <IconButton onClick={() => handleShowCategoryAssignmentRuleTransactionsListDialog(categoryAssignmentRule.id)}>
                      <ViewListIcon />
                    </IconButton>
                  </Tooltip>
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
    </React.Fragment>
  );
}

export default CategoryAssignmentRulesTable;

