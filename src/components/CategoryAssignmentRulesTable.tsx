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
import { getCategories, getCategoryAssignmentRuleByCategoryAssignmentRuleId, getCategoryAssignmentRules, getCategoryByCategoryIdLUT, getCategoryIdByCategoryAssignmentRuleId, getTransactionsByCategoryAssignmentRules } from '../selectors';
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

  const dispatch = useDispatch();

  const categories: Category[] = useTypedSelector(state => getCategories(state));
  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));

  const categoryByCategoryIdLUT: any = useTypedSelector(state => getCategoryByCategoryIdLUT(state));

  const categoryIdByCategoryAssignmentRuleId: { [categoryAssignmentRuleId: string]: string } = useTypedSelector(state => getCategoryIdByCategoryAssignmentRuleId(state));

  const categoryAssignmentRuleById = useTypedSelector(state => getCategoryAssignmentRuleByCategoryAssignmentRuleId(state));

  const transactionsByCategoryAssignmentRules: any = useTypedSelector(state => getTransactionsByCategoryAssignmentRules(state))!;

  const [sortColumn, setSortColumn] = useState<string>('pattern');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryAssignmentRuleTableRows, setCategoryAssignmentRuleTableRows] = React.useState<CategoryAssignmentRuleTableRow[]>([]);

  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [categoryAssignmentRuleId, setCategoryAssignmentRuleId] = React.useState('');
  const [showCategoryAssignmentRuleTransactionsListDialog, setShowCategoryAssignmentRuleTransactionsListDialog] = React.useState(false);

  // from chatty
  const [editedPatterns, setEditedPatterns] = useState<{ [key: string]: string }>({});

  const handleInputChange = (categoryAssignmentRuleId: string, newValue: string) => {
    setEditedPatterns({
      ...editedPatterns,
      [categoryAssignmentRuleId]: newValue,
    });
  };

  const handleBlur = (categoryAssignmentRuleId: string) => {
    const newValue = editedPatterns[categoryAssignmentRuleId];
    if (newValue !== undefined) {
      console.log('dispatch updateCategoryAssignmentRule');
      console.log(categoryAssignmentRuleId);
      console.log(newValue);
      // Dispatch the updated value to Redux store
      // dispatch(updateTransactionDescription(categoryAssignmentRuleId, newValue));
    }
  };

  const handleSaveRule = (pattern: string, categoryId: string): void => {
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

  const updatedCategoryAssignmentRuleCombinationExistsInProps = (pattern: string, categoryId: string): boolean => {
    return categoryAssignmentRules.some((categoryAssignmentRule: CategoryAssignmentRule) => categoryAssignmentRule.pattern === pattern && categoryAssignmentRule.categoryId === categoryId);
  }

  function handleSaveCategoryAssignmentRule(categoryAssignmentRuleId: string): void {
    debugger;
  }

  const handleDeleteCategoryAssignmentRule = (categoryAssignmentRuleId: string): void => {
  }

  const handleCategoryChange = (categoryAssignmentRuleId: string, categoryId: string) => {
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const getTransactionCountForRule = (categoryAssignmentRuleId: string): number => {
    if (!isArray(transactionsByCategoryAssignmentRules[categoryAssignmentRuleId])) {
      return 0;
    }
    return transactionsByCategoryAssignmentRules[categoryAssignmentRuleId].length;
  }

  const sortedCategoryAssignmentRules = [...(categoryAssignmentRules)].sort((a: any, b: any) => {

    let aValue: any = 0;
    let bValue: any = 0;

    if (sortColumn === 'categoryName') {
      const aCategory = categoryByCategoryIdLUT[a.categoryId];
      const bCategory = categoryByCategoryIdLUT[b.categoryId];
      aValue = aCategory.name;
      bValue = bCategory.name;
    } else if (sortColumn === 'pattern') {
      aValue = a[sortColumn];
      bValue = b[sortColumn];
    } else if (sortColumn === 'transactionCount') {
      aValue = getTransactionCountForRule((a as CategoryAssignmentRule).id);
      bValue = getTransactionCountForRule((b as CategoryAssignmentRule).id);
    }
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
              <div className="car-t-b-t-cell car-t-c-transaction-count" onClick={() => handleSort('transactionCount')}>Transaction Count{renderSortIndicator('transactionCount')}</div>
              <div className="car-t-b-t-cell car-t-c-icons"></div>
            </div>
          </div>
          <div className="car-t-body">
            {sortedCategoryAssignmentRules.map((categoryAssignmentRule: CategoryAssignmentRule) => (
              <div className="car-t-base-row car-t-body-row" key={categoryAssignmentRule.id}>
                <div className="car-t-b-t-cell car-t-c-pattern">
                  <TextField
                    value={
                      editedPatterns[categoryAssignmentRule.id] !== undefined
                        ? editedPatterns[categoryAssignmentRule.id] // Use local value if the user has typed something
                        : categoryAssignmentRule.pattern // Fallback to Redux store value
                    }
                    onChange={(e) => handleInputChange(categoryAssignmentRule.id, e.target.value)}
                    style={{ minWidth: '400px' }}
                    onBlur={() => handleBlur(categoryAssignmentRule.id)}
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

