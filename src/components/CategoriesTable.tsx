import React from 'react';
import { Box, Collapse, IconButton, Tooltip } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { getAppInitialized, getCategories, getCategoryAssignmentRules, getCategoryByName } from '../selectors';
import { Category, CategoryAssignmentRule, CategoryMenuItem, StringToCategoryMenuItemLUT, useDispatch } from '../types';
import '../styles/Tracker.css';
import { cloneDeep, isNil } from 'lodash';
import { useTypedSelector } from '../types';
import EditCategoryDialog from './EditCategoryDialog';

const CategoriesTable: React.FC = () => {

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));
  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));
  const ignoreCategory: Category | undefined = useTypedSelector(state => getCategoryByName(state, 'Ignore'));
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = React.useState(false);

  const [openRows, setOpenRows] = React.useState<{ [key: string]: boolean }>({});

  const dispatch = useDispatch();

  if (!appInitialized) {
    return null;
  }

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

  const handleSaveCategory = (category: Category) => {
    console.log('Saving category', category);
    // dispatch(updateCategory(category));
  };

  const handleCloseEditCategoryDialog = () => {
    setShowEditCategoryDialog(false);
  }

  let trimmedCategories = cloneDeep(categories);
  if (!isNil(ignoreCategory)) {
    trimmedCategories = categories.filter(category => category.id !== ignoreCategory!.id)
  }
  const sortedTrimmedCategories: Category[] = trimmedCategories.sort((a, b) => a.name.localeCompare(b.name));

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
          <Tooltip title="Edit transaction">
            <IconButton onClick={() => handleEditCategory(categoryMenuItem)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </td>
        <td className="chatgpt-category-table-cell">{categoryMenuItem.name}</td>
        <td className="chatgpt-category-table-cell">{getNumberOfRulesByCategory(categoryMenuItem.id)}</td>
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
              <th className="chatgpt-category-table-cell">Category Name</th>
              <th className="chatgpt-category-table-cell">Number of Rules</th>
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
