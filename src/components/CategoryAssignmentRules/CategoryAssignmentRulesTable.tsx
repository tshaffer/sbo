import React, { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { isArray, isEmpty } from 'lodash';

import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';

import '../../styles/Tracker.css';
import '../../styles/CategoryAssignmentRulesTable.css';

import { CategoryAssignmentRule, SidebarMenuButton } from '../../types';
import { getCategoryAssignmentRuleByCategoryAssignmentRuleId, getCategoryAssignmentRules, getCategoryByCategoryIdLUT, getCategoryIdByCategoryAssignmentRuleId, getTransactionsByCategoryAssignmentRules } from '../../selectors';
import { deleteCategoryAssignmentRule, updatePatternInCategoryAssignmentRule, updateCategoryInCategoryAssignmentRule, addCategoryAssignmentRule } from '../../controllers';
import SelectCategory from '../SelectCategory';
import DownloadCategoryAssignmentRules from './DownloadCategoryAssignmentRules';
import UploadCategoryAssignmentRules from './UploadCategoryAssignmentRules';
import AddCategoryAssignmentRuleDialog from '../Dialogs/AddCategoryAssignmentRuleDialog';
import CategoryAssignmentRuleTransactionsListDialog from '../Dialogs/CategoryAssignmentRuleTransactionsListDialog';

import { useDispatch, useTypedSelector } from '../../types';

const CategoryAssignmentRulesTable: React.FC = () => {

  const dispatch = useDispatch();

  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));

  const categoryByCategoryIdLUT: any = useTypedSelector(state => getCategoryByCategoryIdLUT(state));

  const categoryIdByCategoryAssignmentRuleId: { [categoryAssignmentRuleId: string]: string } = useTypedSelector(state => getCategoryIdByCategoryAssignmentRuleId(state));

  const categoryAssignmentRuleById = useTypedSelector(state => getCategoryAssignmentRuleByCategoryAssignmentRuleId(state));

  const transactionsByCategoryAssignmentRules: any = useTypedSelector(state => getTransactionsByCategoryAssignmentRules(state))!;

  const [sortColumn, setSortColumn] = useState<string>('pattern');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [categoryAssignmentRuleId, setCategoryAssignmentRuleId] = React.useState('');
  const [showCategoryAssignmentRuleTransactionsListDialog, setShowCategoryAssignmentRuleTransactionsListDialog] = React.useState(false);

  const [editedPatterns, setEditedPatterns] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State to store validation errors

  const handleInputChange = (categoryAssignmentRuleId: string, newValue: string) => {
    setEditedPatterns({
      ...editedPatterns,
      [categoryAssignmentRuleId]: newValue,
    });
  };

  const validatePattern = (categoryAssignmentRuleId: string, newValue: string): string | null => {
    if (!newValue.trim()) {
      return 'Pattern cannot be empty.';
    }
    if (categoryAssignmentRules.some((t) => t.id !== categoryAssignmentRuleId && t.pattern === newValue)) {
      return 'Pattern must be unique.';
    }
    return null;
  };

  const handleBlur = (categoryAssignmentRuleId: string) => {
    const newValue = editedPatterns[categoryAssignmentRuleId];
    if (newValue !== undefined) {

      const originalDescription = categoryAssignmentRules.find((t) => t.id === categoryAssignmentRuleId)?.pattern;

      // Check if the value is unchanged
      if (newValue === originalDescription) {
        // If unchanged, do nothing
        return;
      }

      const error = validatePattern(categoryAssignmentRuleId, newValue);
      if (error) {
        // Set the error message in the state
        setErrors((prevErrors) => ({ ...prevErrors, [categoryAssignmentRuleId]: error }));
      } else {
        // Clear any previous error if the input is valid
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[categoryAssignmentRuleId];
          return newErrors;
        });
        dispatch(updatePatternInCategoryAssignmentRule(categoryAssignmentRuleId, newValue));
      }
    }
  };

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

  const handleDeleteCategoryAssignmentRule = (categoryAssignmentRuleId: string): void => {
    console.log('handleDeleteCategoryAssignmentRule');
    console.log(categoryAssignmentRuleId);
    dispatch(deleteCategoryAssignmentRule(categoryAssignmentRuleId));
  }

  const handleCategoryChange = (categoryAssignmentRuleId: string, categoryId: string) => {
    console.log('handleCategoryChange');
    console.log(categoryAssignmentRuleId);
    console.log(categoryId);
    dispatch(updateCategoryInCategoryAssignmentRule(categoryAssignmentRuleId, categoryId));
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
      aValue = aCategory.name.toLowerCase();
      bValue = bCategory.name.toLowerCase();
    } else if (sortColumn === 'pattern') {
      aValue = a[sortColumn].toLowerCase();
      bValue = b[sortColumn].toLowerCase();
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
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': {
                          padding: '4px', // Set your custom padding here
                        },
                      },
                    }}
                    onChange={(e) => handleInputChange(categoryAssignmentRule.id, e.target.value)}
                    style={{ minWidth: '400px' }}
                    onBlur={() => handleBlur(categoryAssignmentRule.id)}
                    error={!!errors[categoryAssignmentRule.id]} // Show error style if there is an error
                    helperText={errors[categoryAssignmentRule.id] || ''} // Show the error message below the input field
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

