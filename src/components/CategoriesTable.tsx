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

/*
import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

type SortCriteria = 'name' | 'consensus' | 'ted' | 'lori';
type SortOrder = 'asc' | 'desc';

const CategoriesTable = ({ categories, openRows, handleToggle, handleEditCategory, handleDeleteCategory }) => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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
      setSortOrder('desc'); // Set to descending when switching criteria
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
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

  return (
    <table style={{ tableLayout: 'fixed', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ width: '50px', textAlign: 'left' }}>Toggle</th>
          <th style={{ width: '50px', textAlign: 'left' }}>Edit</th>
          <th onClick={handleSortToggle('name')} style={{ cursor: 'pointer', width: '150px', textAlign: 'left' }}>
            Name {sortCriteria === 'name' && getSortIcon()}
          </th>
          <th style={{ width: '50px', textAlign: 'left' }}>Rules</th>
          <th onClick={handleSortToggle('consensus')} style={{ cursor: 'pointer', width: '200px', textAlign: 'left' }}>
            {getImportanceLabel()} {sortCriteria !== 'name' && getSortIcon()}
          </th>
          <th style={{ width: '50px', textAlign: 'left' }}>Delete</th>
        </tr>
      </thead>
      <tbody>
        {sortedCategories.map((categoryMenuItem) => (
          <tr className="chatgpt-category-table-row" key={categoryMenuItem.id}>
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
        ))}
      </tbody>
    </table>
  );
};

export default CategoriesTable;
*/
type SortCriteria = 'name' | 'consensus' | 'ted' | 'lori';
type SortOrder = 'asc' | 'desc';

const CategoriesTable: React.FC = () => {

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));
  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));
  const ignoreCategory: Category | undefined = useTypedSelector(state => getCategoryByName(state, 'Ignore'));
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = React.useState(false);

  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('name');
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
      <tr>
        <td>
          <IconButton onClick={() => handleToggle(categoryMenuItem.id)}>
            {openRows[categoryMenuItem.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </td>
        <td>
          <Tooltip title="Edit category">
            <IconButton onClick={() => handleEditCategory(categoryMenuItem)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </td>
        <td>{categoryMenuItem.name}</td>
        <td>{getNumberOfRulesByCategory(categoryMenuItem.id)}</td>
        <td>
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
        <td>
          <Tooltip title="Delete" arrow>
            <IconButton onClick={() => handleDeleteCategory(categoryMenuItem)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
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
        <table style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
            <tr>
              <th style={{ width: '50px', textAlign: 'left' }}></th>
              <th style={{ width: '50px', textAlign: 'left' }}></th>
              <th onClick={handleSortToggle('name')} style={{ cursor: 'pointer', width: '150px', textAlign: 'left' }}>
                Name {sortCriteria === 'name' && getSortIcon()}
              </th>
              <th style={{ width: '50px', textAlign: 'left' }}>Rules</th>
              <th onClick={handleSortToggle('consensus')} style={{ cursor: 'pointer', width: '200px', textAlign: 'left' }}>
                {getImportanceLabel()} {sortCriteria !== 'name' && getSortIcon()}
              </th>
              <th style={{ width: '50px', textAlign: 'left' }}></th>
            </tr>
          </thead>
          <tbody>
            {categoryTree.map((node: CategoryMenuItem) => renderTree(node))}
          </tbody>
        </table>
      </Box>
    </React.Fragment>
  );
};

export default CategoriesTable;
