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

  const dispatch = useDispatch();

  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));

  const [categoryAssignmentRuleById, setCategoryAssignmentRuleById] = React.useState<{ [categoryAssignmentRuleId: string]: CategoryAssignmentRule }>({}); // key is categoryAssignmentRuleId, value is CategoryAssignmentRule
  const [categoryIdByCategoryAssignmentRuleId, setCategoryIdByCategoryAssignmentRuleId] = React.useState<{ [categoryAssignmentRuleId: string]: string }>({}); // key is categoryAssignmentRuleId, value is categoryId

  const transactionsByCategoryAssignmentRules: any = useTypedSelector(state => getTransactionsByCategoryAssignmentRules(state))!;

  const [sortColumn, setSortColumn] = useState<string>('pattern');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryAssignmentRuleTableRows, setCategoryAssignmentRuleTableRows] = React.useState<CategoryAssignmentRuleTableRow[]>([]);

  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [categoryAssignmentRuleId, setCategoryAssignmentRuleId] = React.useState('');
  const [showCategoryAssignmentRuleTransactionsListDialog, setShowCategoryAssignmentRuleTransactionsListDialog] = React.useState(false);

  const generateReactState = (): void => {
    const localCategoryAssignmentRuleById: { [categoryAssignmentRuleId: string]: CategoryAssignmentRule } = {};
    const localCategoryIdByCategoryAssignmentRuleId: { [categoryAssignmentRuleId: string]: string } = {};

    for (const categoryAssignmentRule of categoryAssignmentRules) {
      localCategoryAssignmentRuleById[categoryAssignmentRule.id] = categoryAssignmentRule;
      localCategoryIdByCategoryAssignmentRuleId[categoryAssignmentRule.id] = categoryAssignmentRule.categoryId;
    }
    setCategoryAssignmentRuleById(localCategoryAssignmentRuleById);
    setCategoryIdByCategoryAssignmentRuleId(localCategoryIdByCategoryAssignmentRuleId);
    updateCategoryAssignmentRuleTableRows();
  }

  React.useEffect(() => {
    console.log('useEffect');
    generateReactState();
  }, [categoryAssignmentRules]);

  const handleSaveRule = (pattern: string, categoryId: string): void => {
  }

  const handleCloseAddRuleDialog = () => {
  }

  const handleShowCategoryAssignmentRuleTransactionsListDialog = (id: string) => {
  }

  const handleCloseCategoryAssignmentRuleTransactionsListDialog = () => {
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
    setCategoryAssignmentRuleTableRows(localCategoryAssignmentRuleTableRows);
  }

  const updateCategoryAssignmentRuleFromInReactState = (categoryAssignmentRule: CategoryAssignmentRule): void => {
  }

  const deleteCategoryAssignmentRuleInReactState = (categoryAssignmentRuleId: string): void => {
  }

  const updatedCategoryAssignmentRuleCombinationExistsInProps = (pattern: string, categoryId: string): boolean => {
    return categoryAssignmentRules.some((categoryAssignmentRule: CategoryAssignmentRule) => categoryAssignmentRule.pattern === pattern && categoryAssignmentRule.categoryId === categoryId);
  }

  function handleSaveCategoryAssignmentRule(categoryAssignmentRuleId: string): void {
  }

  const handleDeleteCategoryAssignmentRule = (categoryAssignmentRuleId: string): void => {
  }

  const getCategory = (categoryId: string): Category => {
    return categories.find((category: Category) => category.id === categoryId) as Category;
  };

  const handleCategoryAssignmentRuleChange = (categoryAssignmentRule: CategoryAssignmentRule, pattern: string) => {
  };

  const handleCategoryChange = (categoryAssignmentRuleId: string, categoryId: string) => {
  }

  const handleSort = (column: string) => {
  };

  const sortedCategoryAssignmentRuleTableRows = [...(categoryAssignmentRuleTableRows)].sort((a: any, b: any) => {
    // const aValue = a[sortColumn];
    // const bValue = b[sortColumn];

    // if (aValue < bValue) {
    //   return sortOrder === 'asc' ? -1 : 1;
    // }
    // if (aValue > bValue) {
    //   return sortOrder === 'asc' ? 1 : -1;
    // }
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

