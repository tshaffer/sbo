import React, { useState } from 'react';
import { Box, Collapse, IconButton, Tooltip } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAppInitialized, getCategories, getCategoryAssignmentRules, getCategoryByName } from '../selectors';
import { Category, CategoryAssignmentRule, CategoryMenuItem, StringToCategoryMenuItemLUT, useDispatch } from '../types';
import '../styles/Tracker.css';
import { cloneDeep, isNil } from 'lodash';
import { useTypedSelector } from '../types';
import EditCategoryDialog from './EditCategoryDialog';
import { deleteCategory, updateCategory } from '../controllers';

type SortCriteria = 'name' | 'consensus' | 'ted' | 'lori';
type SortOrder = 'asc' | 'desc';

const CategoriesTable: React.FC = () => {

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));
  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));
  const ignoreCategory: Category | undefined = useTypedSelector(state => getCategoryByName(state, 'Ignore'));
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = React.useState(false);

  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('consensus');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [openRows, setOpenRows] = React.useState<{ [key: string]: boolean }>({});

  const dispatch = useDispatch();

  if (!appInitialized) {
    return null;
  }

  const handleSortToggle = (criteria: SortCriteria) => () => {
    if (criteria === 'name') {
      if (sortCriteria === 'name') {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortCriteria('name');
        setSortOrder('asc');
      }
    } else {
      if (sortCriteria === 'consensus') {
        setSortCriteria('ted');
      } else if (sortCriteria === 'ted') {
        setSortCriteria('lori');
      } else if (sortCriteria === 'lori') {
        setSortCriteria('consensus');
      } else {
        setSortCriteria('consensus');
      }
      setSortOrder('desc'); // Reset to descending when switching criteria
    }
  };

  const getRulesByCategory = (categoryId: string): CategoryAssignmentRule[] => {
    return categoryAssignmentRules.filter((rule: CategoryAssignmentRule) => rule.categoryId === categoryId);
  };

  const getNumberOfRulesByCategory = (categoryId: string): number => {
    return getRulesByCategory(categoryId).length;
  };

  const handleToggle = (id: string) => {
    setOpenRows((prevOpenRows) => ({
      ...prevOpenRows,
      [id]: !prevOpenRows[id],
    }));
  };

  function handleEditCategory(category: Category): void {
    setSelectedCategory(category);
    setShowEditCategoryDialog(true);
  }

  function handleDeleteCategory(category: Category): void {
    console.log('Deleting category', category);
    dispatch(deleteCategory(category));
  }

  const handleSaveCategory = (category: Category) => {
    console.log('Saving category', category);
    dispatch(updateCategory(category));
  };

  const handleCloseEditCategoryDialog = () => {
    setShowEditCategoryDialog(false);
  }

  let trimmedCategories = cloneDeep(categories);
  if (!isNil(ignoreCategory)) {
    trimmedCategories = categories.filter(category => category.id !== ignoreCategory!.id)
  }

  const sortedTrimmedCategories = [...trimmedCategories].sort((a, b) => {
    let aValue: number | string | undefined;
    let bValue: number | string | undefined;

    switch (sortCriteria) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'consensus':
        aValue = a.consensusImportance;
        bValue = b.consensusImportance;
        break;
      case 'ted':
        aValue = a.tedImportance;
        bValue = b.tedImportance;
        break;
      case 'lori':
        aValue = a.loriImportance;
        bValue = b.loriImportance;
        break;
    }

    if (aValue === undefined) aValue = -1; // Undefined values go last
    if (bValue === undefined) bValue = -1;

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getImportanceLabel = () => {
    switch (sortCriteria) {
      case 'consensus':
        return 'Importance Consensus';
      case 'ted':
        return 'Importance Ted';
      case 'lori':
        return 'Importance Lori';
      default:
        return 'Importance';
    }
  };

  const getSortIcon = () => {
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const renderPatternTable = (categoryMenuItem: CategoryMenuItem): JSX.Element | null => {
    const categoryAssignmentRules: CategoryAssignmentRule[] = getRulesByCategory(categoryMenuItem.id);
    if (categoryAssignmentRules.length === 0) {
      return null;
    }
    return (
      <div className="chatgpt-category-table-container">
        <div className="chatgpt-category-table-header">
          <div className="chatgpt-category-table-row">
            <div className="chatgpt-category-table-cell">Pattern</div>
          </div>
        </div>
        <div className="chatgpt-category-table-body">
          {categoryAssignmentRules.map((rule: CategoryAssignmentRule, index: number) => (
            <div className="chatgpt-category-table-row" key={index}>
              <div className="chatgpt-category-table-cell">{rule.pattern}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTree = (categoryMenuItem: CategoryMenuItem) => (
    <React.Fragment key={categoryMenuItem.id}>
      <tr className="chatgpt-category-table-row">
        <td className="chatgpt-category-table-cell">
          <IconButton onClick={() => handleToggle(categoryMenuItem.id)}>
            {openRows[categoryMenuItem.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </td>
        <td className="chatgpt-category-table-cell">
          <Tooltip title="Edit category">
            <IconButton onClick={() => handleEditCategory(categoryMenuItem)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </td>
        <td className="chatgpt-category-table-cell">{categoryMenuItem.name}</td>
        <td className="chatgpt-category-table-cell">{getNumberOfRulesByCategory(categoryMenuItem.id)}</td>
        <td className="chatgpt-category-table-cell">
          <Tooltip
            title={
              categoryMenuItem.consensusImportance !== undefined
                ? `Consensus Importance: ${categoryMenuItem.consensusImportance}`
                : `Lori Importance: ${categoryMenuItem.loriImportance}, Ted Importance: ${categoryMenuItem.tedImportance}`
            }
            arrow
          >
            <span>
              {categoryMenuItem.consensusImportance !== undefined ? (
                `Consensus: ${categoryMenuItem.consensusImportance}`
              ) : (
                `Lori: ${categoryMenuItem.loriImportance}, Ted: ${categoryMenuItem.tedImportance}`
              )}
            </span>
          </Tooltip>
        </td>
        <td className="chatgpt-category-table-cell">
          <Tooltip title="Delete" arrow>
            <IconButton onClick={() => handleDeleteCategory(categoryMenuItem)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </td>
      </tr>
      <tr className="chatgpt-category-table-row">
        <td className="chatgpt-category-table-cell" colSpan={3}>
          <Collapse in={openRows[categoryMenuItem.id]} timeout="auto" unmountOnExit>
            <Box margin={1}>
              {renderPatternTable(categoryMenuItem)}
              {Array.isArray(categoryMenuItem.children) && categoryMenuItem.children.length > 0 && (
                <div className="chatgpt-category-table-body">
                  {categoryMenuItem.children.map((child) => renderTree(child))}
                </div>
              )}
            </Box>
          </Collapse>
        </td>
      </tr>
    </React.Fragment>
  );

  const buildCategoryTree = () => {
    const map: StringToCategoryMenuItemLUT = {};
    const roots: CategoryMenuItem[] = [];
    sortedTrimmedCategories.forEach(category => {
      map[category.id] = { ...category, children: [], level: 0 };
    });
    sortedTrimmedCategories.forEach(category => {
      if (category.parentId === '') {
        roots.push(map[category.id]);
      } else {
        map[category.parentId].children.push(map[category.id]);
      }
    });
    return roots;
  };

  const getEditCategoryDialog = (): JSX.Element | null => {
    if (!showEditCategoryDialog || isNil(selectedCategory)) {
      return null;
    } else {
      return (
        <EditCategoryDialog
          open={showEditCategoryDialog}
          categoryId={selectedCategory!.id}
          onClose={handleCloseEditCategoryDialog}
          onSave={handleSaveCategory}
        />
      );
    }
  }

  const categoryTree = buildCategoryTree();

  return (
    <React.Fragment>
      {getEditCategoryDialog()}
      <Box sx={{ width: '100%' }}>
        <table className="chatgpt-category-table-container">
          <thead className="chatgpt-category-table-header">
            <tr className="chatgpt-category-table-row">
              <th className="chatgpt-category-table-cell"></th>
              <th className="chatgpt-category-table-cell"></th>
              <th onClick={handleSortToggle('name')} style={{ cursor: 'pointer' }}>
                Name {sortCriteria === 'name' && getSortIcon()}
              </th>
              <th className="chatgpt-category-table-cell">Rules</th>
              {/* <th className="chatgpt-category-table-cell">Importance</th> */}
              <th onClick={handleSortToggle('consensus')} style={{ cursor: 'pointer' }}>
                {getImportanceLabel()} {sortCriteria !== 'name' && getSortIcon()}
              </th>
              <th className="chatgpt-category-table-cell"></th>
            </tr>
          </thead>
          <tbody className="chatgpt-category-table-body">
            {categoryTree.map((node: CategoryMenuItem) => renderTree(node))}
          </tbody>
        </table>
      </Box>
    </React.Fragment>
  );
};

export default CategoriesTable;
