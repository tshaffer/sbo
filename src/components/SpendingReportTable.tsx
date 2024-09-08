import React, { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';

import '../styles/Tracker.css';
import { CategorizedTransaction, Category, CategoryAssignmentRule, CategoryExpensesData, CategoryMenuItem, StringToCategoryLUT, StringToCategoryMenuItemLUT, StringToTransactionsLUT, Transaction } from '../types';
import { formatCurrency, formatPercentage, formatDate, expensesPerMonth, roundTo } from '../utilities';
import { getTransactionsByCategory, getGeneratedReportStartDate, getGeneratedReportEndDate, getCategories, getCategoryByCategoryNameLUT, getCategoryByName, getCategoryIdsToExclude, selectReportDataState } from '../selectors';
import { cloneDeep, isEmpty, isNil } from 'lodash';

import { addCategoryAssignmentRule, updateTransaction } from '../controllers';
import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import EditTransactionDialog from './EditTransactionDialog';

import { useDispatch, useTypedSelector } from '../types';
import { Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SpendingReportTable: React.FC = () => {

  const categories: Category[] = useTypedSelector(getCategories);
  const categoryByCategoryNameLUT: StringToCategoryLUT = useTypedSelector(getCategoryByCategoryNameLUT);
  const generatedReportStartDate: string = useTypedSelector(getGeneratedReportStartDate);
  const generatedReportEndDate: string = useTypedSelector(getGeneratedReportEndDate);
  const transactionsByCategoryId: StringToTransactionsLUT = useTypedSelector(getTransactionsByCategory);
  const ignoreCategory: Category | undefined = useTypedSelector(state => getCategoryByName(state, 'Ignore'));
  const categoryIdsToExclude: string[] = useTypedSelector(getCategoryIdsToExclude);
  const reportDataState = useTypedSelector(selectReportDataState);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = React.useState('');
  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = React.useState(false);

  if (isEmpty(transactionsByCategoryId)) {
    return null;
  }

  const handleButtonClick = (rowId: string) => {
    setSelectedRowId(prevRowId => (prevRowId === rowId ? null : rowId));
  };

  const handleClickTransaction = (transaction: Transaction) => {
    navigate(`/statements/credit-card/${transaction.statementId}`);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionId(transaction.id);
    setShowEditTransactionDialog(true);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    dispatch(updateTransaction(transaction));
  };

  const handleCloseEditTransactionDialog = () => {
    setShowEditTransactionDialog(false);
  }

  const handleAssignCategory = (transaction: Transaction) => {
    setTransactionId(transaction.id);
    setShowAddCategoryAssignmentRuleDialog(true);
  };

  const handleSaveRule = (pattern: string, categoryId: string): void => {
    const id: string = uuidv4();
    const categoryAssignmentRule: CategoryAssignmentRule = {
      id,
      pattern,
      categoryId
    };
    dispatch(addCategoryAssignmentRule(categoryAssignmentRule));
  }

  const handleCloseAddRuleDialog = () => {
    setShowAddCategoryAssignmentRuleDialog(false);
  };


  const old_buildCategoryMenuItems = (categories: Category[]): CategoryMenuItem[] => {

    const map: StringToCategoryMenuItemLUT = {};
    const roots: CategoryMenuItem[] = [];

    // First pass: Create the map with children and initialize levels to -1
    categories.forEach(category => {
      map[category.id] = { ...category, children: [], level: -1 };
    });

    // Second pass: Populate the children and identify root categories
    categories.forEach(category => {
      if (category.parentId === '') {
        roots.push(map[category.id]);
      } else {
        if (map[category.parentId]) {
          map[category.parentId].children.push(map[category.id]);
        } else {
          console.warn(`Parent category with ID ${category.parentId} not found for category ${category.id}`);
        }
      }
    });

    // Function to recursively calculate levels
    const calculateLevels = (category: CategoryMenuItem, level: number) => {
      category.level = level;
      category.children.forEach(child => calculateLevels(child, level + 1));
    };

    // Calculate levels starting from the roots
    roots.forEach(root => calculateLevels(root, 0));

    // Function to flatten the tree
    const flattenTree = (categoryMenuItems: CategoryMenuItem[], result: CategoryMenuItem[] = []): CategoryMenuItem[] => {
      categoryMenuItems.forEach(categoryMenuItem => {
        result.push(categoryMenuItem);
        if (categoryMenuItem.children.length > 0) {
          flattenTree(categoryMenuItem.children, result);
        }
      });
      return result;
    };

    return flattenTree(roots);
  };
  const sortCategoriesRecursively = (categories: CategoryExpensesData[]): CategoryExpensesData[] => {

    // Sort top-level categories by total expenses
    const sortedCategories = [...categories].sort((a, b) => b.totalExpenses - a.totalExpenses);

    // Recursively sort children
    sortedCategories.forEach((category) => {
      if (category.children && category.children.length > 0) {
        category.children = sortCategoriesRecursively(category.children);
      }
    });

    return sortedCategories;
  };

  const old_getRows = (categories: CategoryMenuItem[]): CategoryExpensesData[] => {
    const rows: CategoryExpensesData[] = [];
    const categoryExpensesMap = new Map<string, number>();
    let totalTopLevelExpenses = 0;

    // First pass to accumulate the total expenses for each category
    const accumulateExpenses = (category: CategoryMenuItem): number => {
      const transactions: CategorizedTransaction[] = transactionsByCategoryId[category.id] || [];
      const categoryTotalExpenses = -1 * roundTo(transactions.reduce((sum, transaction) => sum + transaction.bankTransaction.amount, 0), 2);
      let totalExpenses = categoryTotalExpenses;

      // Accumulate expenses for child categories
      category.children.forEach((subCategory) => {
        const subCategoryExpenses = accumulateExpenses(subCategory);
        totalExpenses += subCategoryExpenses;
      });

      // Only add to the map if there are any expenses (direct or from children)
      if (totalExpenses > 0 || category.children.length > 0) {
        categoryExpensesMap.set(category.id, totalExpenses);
      }

      // Accumulate total expenses for top-level categories
      if (category.parentId === '') {
        totalTopLevelExpenses += totalExpenses;
      }

      return totalExpenses;
    };

    categories.forEach(category => accumulateExpenses(category));

    // Second pass to build rows and calculate percentages
    const processCategory = (category: CategoryMenuItem, level = 0, parentTotalExpenses = 0): CategoryExpensesData => {
      const transactions = transactionsByCategoryId[category.id] || [];
      const categoryTotalExpenses = categoryExpensesMap.get(category.id) || 0;
      const categoryTransactionCount = transactions.length;

      const spaces = '\u00A0'.repeat(level * 8);

      const percentageOfParent = parentTotalExpenses ? roundTo((categoryTotalExpenses / parentTotalExpenses) * 100, 2) : 0;
      const percentageOfTotal = parentTotalExpenses === 0 && totalTopLevelExpenses !== 0
        ? roundTo((categoryTotalExpenses / totalTopLevelExpenses) * 100, 2)
        : percentageOfParent;

      const categoryRow: CategoryExpensesData = {
        id: category.id,
        categoryName: `${spaces}${category.name}`,
        transactions,
        totalExpenses: categoryTotalExpenses,
        transactionCount: categoryTransactionCount,
        percentageOfTotal: percentageOfTotal,
        children: []
      };

      // Process subcategories recursively
      category.children.forEach((subCategory) => {
        const subCategoryRow = processCategory(subCategory, level + 1, categoryTotalExpenses);
        categoryRow.children.push(subCategoryRow);
      });

      return categoryRow;
    };

    // Collect top-level rows, ensuring no duplicate processing of child categories
    const processedCategoryIds = new Set<string>();
    categories.forEach(category => {
      if (category.parentId === '' && !processedCategoryIds.has(category.id)) {
        rows.push(processCategory(category));
        processedCategoryIds.add(category.id);
      }
    });

    const sortedRows = sortCategoriesRecursively(rows);

    // Flatten the sorted structure for rendering
    const flattenRows = (sortedRows: CategoryExpensesData[], flatRows: CategoryExpensesData[] = []): CategoryExpensesData[] => {
      sortedRows.forEach((row) => {
        flatRows.push(row);
        if (row.children && row.children.length > 0) {
          flattenRows(row.children, flatRows);
        }
      });
      return flatRows;
    };

    return flattenRows(sortedRows);
  };

  /*
  const getRows = (allCategoriesExpensesData: CategoryExpensesData[], categoryMenuItems: CategoryMenuItem[]): CategoryExpensesData[] => {

    const rows: CategoryExpensesData[] = [];
    const categoryExpensesMap = new Map<string, number>();
    let totalTopLevelExpenses = 0;

    // First pass to accumulate the total expenses for each category
    const getCategoryMenuItemById = (id: string): CategoryMenuItem => {
      return categoryMenuItems.find(category => category.id === id) as CategoryMenuItem;
    }

    const getCategoryExpensesDataById = (id: string): CategoryExpensesData => {
      return allCategoriesExpensesData.find(category => category.id === id) as CategoryExpensesData;
    }

    const accumulateExpenses = (categoriesExpensesData: CategoryExpensesData): number => {
      const categoryMenuItem: CategoryMenuItem = getCategoryMenuItemById(categoriesExpensesData.id);

      let totalExpenses = categoriesExpensesData.totalExpenses;

      // Accumulate expenses for child categories
      categoryMenuItem.children.forEach((subCategory) => {
        const subCategoryExpensesData = getCategoryExpensesDataById(subCategory.id)
        totalExpenses += accumulateExpenses(subCategoryExpensesData);
      });

      // Only add to the map if there are any expenses (direct or from children)
      if (totalExpenses > 0 || categoryMenuItem.children.length > 0) {
        categoryExpensesMap.set(categoryMenuItem.id, totalExpenses);
      }

      // Accumulate total expenses for top-level categories
      if (categoryMenuItem.parentId === '') {
        totalTopLevelExpenses += totalExpenses;
      }

      return totalExpenses;
    };

    allCategoriesExpensesData.forEach(categoryExpensesData => accumulateExpenses(categoryExpensesData));

    // Second pass to build rows and calculate percentages
    const processCategory = (category: CategoryMenuItem, level = 0, parentTotalExpenses = 0): CategoryExpensesData => {
      const transactions = transactionsByCategoryId[category.id] || [];
      const categoryTotalExpenses = categoryExpensesMap.get(category.id) || 0;
      const categoryTransactionCount = transactions.length;

      const spaces = '\u00A0'.repeat(level * 8);

      const percentageOfParent = parentTotalExpenses ? roundTo((categoryTotalExpenses / parentTotalExpenses) * 100, 2) : 0;
      const percentageOfTotal = parentTotalExpenses === 0 && totalTopLevelExpenses !== 0
        ? roundTo((categoryTotalExpenses / totalTopLevelExpenses) * 100, 2)
        : percentageOfParent;

      const categoryRow: CategoryExpensesData = {
        id: category.id,
        categoryName: `${spaces}${category.name}`,
        transactions,
        totalExpenses: categoryTotalExpenses,
        transactionCount: categoryTransactionCount,
        percentageOfTotal: percentageOfTotal,
        children: []
      };

      // Process subcategories recursively
      category.children.forEach((subCategory) => {
        const subCategoryRow = processCategory(subCategory, level + 1, categoryTotalExpenses);
        categoryRow.children.push(subCategoryRow);
      });

      return categoryRow;
    };

    // Collect top-level rows, ensuring no duplicate processing of child categories
    const processedCategoryIds = new Set<string>();
    categoryMenuItems.forEach(categoryMenuItem => {
      if (categoryMenuItem.parentId === '' && !processedCategoryIds.has(categoryMenuItem.id)) {
        rows.push(processCategory(categoryMenuItem));
        processedCategoryIds.add(categoryMenuItem.id);
      }
    });

    const sortedRows = sortCategoriesRecursively(rows);

    // Flatten the sorted structure for rendering
    const flattenRows = (sortedRows: CategoryExpensesData[], flatRows: CategoryExpensesData[] = []): CategoryExpensesData[] => {
      sortedRows.forEach((row) => {
        flatRows.push(row);
        if (row.children && row.children.length > 0) {
          flattenRows(row.children, flatRows);
        }
      });
      return flatRows;
    };

    return flattenRows(sortedRows);
  };
  */

  const getRows = (allCategoriesExpensesData: CategoryExpensesData[], categoryMenuItems: CategoryMenuItem[]): CategoryExpensesData[] => {

    const rows: CategoryExpensesData[] = [];
    const categoryExpensesMap = new Map<string, number>();
    let totalTopLevelExpenses = 0;

    // First pass to accumulate the total expenses for each category
    const getCategoryMenuItemById = (id: string): CategoryMenuItem => {
      return categoryMenuItems.find(category => category.id === id) as CategoryMenuItem;
    }

    const getCategoryExpensesDataById = (id: string): CategoryExpensesData => {
      return allCategoriesExpensesData.find(category => category.id === id) as CategoryExpensesData;
    }

    const accumulateExpenses = (categoriesExpensesData: CategoryExpensesData): number => {
      const categoryMenuItem: CategoryMenuItem = getCategoryMenuItemById(categoriesExpensesData.id);

      let totalExpenses = categoriesExpensesData.totalExpenses;

      // Accumulate expenses for child categories
      categoryMenuItem.children.forEach((subCategory) => {
        const subCategoryExpensesData = getCategoryExpensesDataById(subCategory.id)
        totalExpenses += accumulateExpenses(subCategoryExpensesData);
      });

      // Only add to the map if there are any expenses (direct or from children)
      // if (totalExpenses > 0 || categoryMenuItem.children.length > 0) {
      //   categoryExpensesMap.set(categoryMenuItem.id, totalExpenses);
      // }
      categoryExpensesMap.set(categoryMenuItem.id, totalExpenses);

      // Accumulate total expenses for top-level categories
      if (categoryMenuItem.parentId === '') {
        totalTopLevelExpenses += totalExpenses;
      }

      return totalExpenses;
    };

    allCategoriesExpensesData.forEach(categoryExpensesData => accumulateExpenses(categoryExpensesData));

    // Filter out categories with 0 transactions and no descendent transactions
    const filterCategories = (categoryMenuItem: CategoryMenuItem): boolean => {
      const categoryTotalExpenses = categoryExpensesMap.get(categoryMenuItem.id) || 0;

      console.log('filterCategories', categoryMenuItem.name, categoryTotalExpenses);

      if (categoryTotalExpenses !== 0) {
        console.log('categoryTotalExpenses > 0: return true');
        return true;
      }

      // Recursively check children
      for (const subCategory of categoryMenuItem.children) {
        if (filterCategories(subCategory)) {
          console.log('recursive call: return true');
          return true;
        }
      }

      console.log('return false');
      return false;
    };

    const filteredCategories = categoryMenuItems.filter(categoryMenuItem => filterCategories(categoryMenuItem));

    console.log('filteredCategories', filteredCategories);
    
    // Second pass to build rows and calculate percentages
    const processCategory = (category: CategoryMenuItem, level = 0, parentTotalExpenses = 0): CategoryExpensesData => {
      const transactions = transactionsByCategoryId[category.id] || [];
      const categoryTotalExpenses = categoryExpensesMap.get(category.id) || 0;
      const categoryTransactionCount = transactions.length;

      const spaces = '\u00A0'.repeat(level * 8);

      const percentageOfParent = parentTotalExpenses ? roundTo((categoryTotalExpenses / parentTotalExpenses) * 100, 2) : 0;
      const percentageOfTotal = parentTotalExpenses === 0 && totalTopLevelExpenses !== 0
        ? roundTo((categoryTotalExpenses / totalTopLevelExpenses) * 100, 2)
        : percentageOfParent;

      const categoryRow: CategoryExpensesData = {
        id: category.id,
        categoryName: `${spaces}${category.name}`,
        transactions,
        totalExpenses: categoryTotalExpenses,
        transactionCount: categoryTransactionCount,
        percentageOfTotal: percentageOfTotal,
        children: []
      };

      // Process subcategories recursively
      category.children.forEach((subCategory) => {
        const subCategoryRow = processCategory(subCategory, level + 1, categoryTotalExpenses);
        categoryRow.children.push(subCategoryRow);
      });

      return categoryRow;
    };

    // // Collect top-level rows, ensuring no duplicate processing of child categories
    // const processedCategoryIds = new Set<string>();
    // categoryMenuItems.forEach(categoryMenuItem => {
    //   if (categoryMenuItem.parentId === '' && !processedCategoryIds.has(categoryMenuItem.id)) {
    //     rows.push(processCategory(categoryMenuItem));
    //     processedCategoryIds.add(categoryMenuItem.id);
    //   }
    // });

    // Collect top-level rows
    filteredCategories.forEach(category => {
      if (category.parentId === '') {
        rows.push(processCategory(category));
      }
    });

    const sortedRows = sortCategoriesRecursively(rows);

    // Flatten the sorted structure for rendering
    const flattenRows = (sortedRows: CategoryExpensesData[], flatRows: CategoryExpensesData[] = []): CategoryExpensesData[] => {
      sortedRows.forEach((row) => {
        flatRows.push(row);
        if (row.children && row.children.length > 0) {
          flattenRows(row.children, flatRows);
        }
      });
      return flatRows;
    };

    return flattenRows(sortedRows);
  };

  const getSortedBankTransactions = (categorizedTransactions: CategorizedTransaction[]): CategorizedTransaction[] => {
    const sortedCategorizedTransactions: CategorizedTransaction[] = categorizedTransactions.sort((a, b) => b.bankTransaction.transactionDate.localeCompare(a.bankTransaction.transactionDate));
    return sortedCategorizedTransactions;
  }

  const matches = (importanceFilter: string, categoryImportanceValue: number, reportSpecImportanceValue: number): boolean => {
    if (importanceFilter === 'lower' && categoryImportanceValue < reportSpecImportanceValue) {
      return true;
    }
    else if (categoryImportanceValue >= reportSpecImportanceValue) {
      return true;
    }
    return false;
  }

  // new code
  const trimCategoriesPerExclusions = (categories: Category[]): Category[] => {
    let trimmedCategories = cloneDeep(categories);
    trimmedCategories = categories.filter(category =>
      !categoryIdsToExclude.includes(category.id) && category.id !== ignoreCategory?.id
    );
    return trimmedCategories;
  }

  const trimCategoriesPerImportance = (categories: Category[]): Category[] => {
    const {
      consensusDiscretionary: reportSpecConsensusDiscretionary,
      loriDiscretionary: reportSpecLoriDiscretionary,
      tedDiscretionary: reportSpecTedDiscretionary,
      consensusValue: reportSpecConsensusValue,
      loriValue: reportSpecLoriValue,
      tedValue: reportSpecTedValue,
      importanceFilter: reportSpecImportanceFilter,
      individualDiscretionaryPriority: reportSpecIndividualDiscretionaryPriority,
    } = reportDataState;

    if (!reportSpecConsensusDiscretionary && !reportSpecLoriDiscretionary && !reportSpecTedDiscretionary) {
      return categories;
    }

    return categories.filter((category) => {
      const { consensusImportance, loriImportance, tedImportance } = category;

      if (reportSpecConsensusDiscretionary && !isNil(consensusImportance)) {
        return matches(reportSpecImportanceFilter, consensusImportance, reportSpecConsensusValue!);
      }

      if (reportSpecLoriDiscretionary && reportSpecTedDiscretionary) {
        const prioritizedDiscretionary = reportSpecIndividualDiscretionaryPriority === 'ted' ? tedImportance : loriImportance;
        const prioritizedValue = reportSpecIndividualDiscretionaryPriority === 'ted' ? reportSpecTedValue! : reportSpecLoriValue!;
        if (!isNil(prioritizedDiscretionary)) {
          return matches(reportSpecImportanceFilter, prioritizedDiscretionary, prioritizedValue);
        }
      }

      if (reportSpecLoriDiscretionary && !isNil(loriImportance)) {
        return matches(reportSpecImportanceFilter, loriImportance, reportSpecLoriValue!);
      }

      if (reportSpecTedDiscretionary && !isNil(tedImportance)) {
        return matches(reportSpecImportanceFilter, tedImportance, reportSpecTedValue!);
      }

      return false;
    });
  };

  const buildCategoryExpensesData = (category: Category): CategoryExpensesData => {
    const transactions: CategorizedTransaction[] = transactionsByCategoryId[category.id] || [];
    const categoryTotalExpenses = -1 * roundTo(transactions.reduce((sum, transaction) => sum + transaction.bankTransaction.amount, 0), 2);
    const categoryExpensesData: CategoryExpensesData = {
      id: category.id,
      categoryName: category.name,
      transactions,
      totalExpenses: categoryTotalExpenses,
      transactionCount: transactions.length,
      percentageOfTotal: 0,
      children: []
    };
    return categoryExpensesData;
  }

  const buildCategoriesExpensesData = (categories: Category[]): CategoryExpensesData[] => {
    const categoryExpensesData: CategoryExpensesData[] = categories.map(category => buildCategoryExpensesData(category));
    return categoryExpensesData;
  }

  const buildCategoryMenuItems = (
    categoriesExpensesData: CategoryExpensesData[]
  ): CategoryMenuItem[] => {
    const map: StringToCategoryMenuItemLUT = {};
    const roots: CategoryMenuItem[] = new Array<CategoryMenuItem>();

    // Create a map for easy lookup of categories by ID
    categories.forEach(category => {
      map[category.id] = { ...category, children: [], level: -1 };
    });

    // Set to track categories to include (all categories with transactions and their ancestors)
    const categoriesToInclude = new Set<string>();

    // Add categories in categoriesExpensesData and all their ancestors to the set
    const addCategoryAndAncestors = (categoryId: string) => {
      let currentCategoryId = categoryId;
      while (currentCategoryId) {
        if (categoriesToInclude.has(currentCategoryId)) break; // Already processed this branch

        categoriesToInclude.add(currentCategoryId);
        const currentCategory = map[currentCategoryId];
        currentCategoryId = currentCategory.parentId;
      }
    };

    // Populate the set with all categories in categoriesExpensesData and their ancestors
    categoriesExpensesData.forEach(categoryExpenses => {
      addCategoryAndAncestors(categoryExpenses.id);
    });

    // Now, build the tree based on categoriesToInclude
    categoriesToInclude.forEach(categoryId => {
      const category = map[categoryId];
      if (category.parentId === '') {
        roots.push(category);
      } else {
        map[category.parentId]?.children.push(category);
      }
    });

    // Function to recursively calculate levels
    const calculateLevels = (category: CategoryMenuItem, level: number) => {
      category.level = level;
      category.children.forEach(child => calculateLevels(child, level + 1));
    };

    // Calculate levels starting from the roots
    roots.forEach(root => calculateLevels(root, 0));

    // Function to flatten the tree
    const flattenTree = (categoryMenuItems: CategoryMenuItem[], result: CategoryMenuItem[] = []): CategoryMenuItem[] => {
      categoryMenuItems.forEach(categoryMenuItem => {
        result.push(categoryMenuItem);
        if (categoryMenuItem.children.length > 0) {
          flattenTree(categoryMenuItem.children, result);
        }
      });
      return result;
    };

    // Return the flattened tree structure
    return flattenTree(roots);
  };

  const generateCategoryExpensesData = (
    categoryMenuItems: CategoryMenuItem[],
    categoriesExpensesData: CategoryExpensesData[]
  ): CategoryExpensesData[] => {
    // Create a map from categoriesExpensesData for quick lookup
    const expensesDataMap = new Map<string, CategoryExpensesData>();
    categoriesExpensesData.forEach(expensesData => {
      expensesDataMap.set(expensesData.id, expensesData);
    });

    // Function to accumulate and calculate expenses recursively
    const calculateExpenses = (
      categoryMenuItem: CategoryMenuItem,
      parentTotalExpenses: number = 0
    ): CategoryExpensesData => {
      // If this category already has expenses data, use it
      let categoryExpensesData = expensesDataMap.get(categoryMenuItem.id);

      if (!categoryExpensesData) {
        // Create an empty CategoryExpensesData object for categories with no transactions
        categoryExpensesData = {
          id: categoryMenuItem.id,
          categoryName: categoryMenuItem.name,
          transactions: [],
          transactionCount: 0,
          totalExpenses: 0,
          percentageOfTotal: 0,
          children: []
        };
        expensesDataMap.set(categoryMenuItem.id, categoryExpensesData);
      }

      // Accumulate expenses for child categories
      categoryMenuItem.children.forEach(child => {
        const childExpensesData = calculateExpenses(child, categoryExpensesData!.totalExpenses);
        categoryExpensesData!.children.push(childExpensesData);
      });

      // Calculate percentage of total (in the context of its parent or the entire report)
      const percentageOfParent = parentTotalExpenses ? (categoryExpensesData.totalExpenses / parentTotalExpenses) * 100 : 0;
      categoryExpensesData.percentageOfTotal = percentageOfParent;

      return categoryExpensesData;
    };

    // Process each top-level category in categoryMenuItems
    const result: CategoryExpensesData[] = [];
    categoryMenuItems.forEach(categoryMenuItem => {
      if (categoryMenuItem.parentId === '') {
        result.push(calculateExpenses(categoryMenuItem));
      }
    });

    // Ensure all elements in the original categoriesExpensesData array are included with updated fields
    categoriesExpensesData.forEach(expensesData => {
      if (!result.some(item => item.id === expensesData.id)) {
        result.push({
          ...expensesData,
          totalExpenses: expensesData.totalExpenses,
          percentageOfTotal: (expensesData.totalExpenses / result.reduce((sum, item) => sum + item.totalExpenses, 0)) * 100
        });
      }
    });

    return result;
  };

  // Filter out categories that have been excluded
  // Trim categories based on importance
  // Get category expenses data for trimmed categories
  // Build category menu items
  // Generate Category Expenses Data
  // Get rows
  // Calculate total amount

  let trimmedCategories: Category[];

  // Filter out categories that have been excluded
  trimmedCategories = trimCategoriesPerExclusions(categories);

  // Trim categories based on importance
  trimmedCategories = trimCategoriesPerImportance(trimmedCategories);

  // Get category expenses data for trimmed categories
  const categoriesExpensesData: CategoryExpensesData[] = buildCategoriesExpensesData(trimmedCategories);

  // Build category menu items
  const categoryMenuItems: CategoryMenuItem[] = buildCategoryMenuItems(categoriesExpensesData);

  // Generate Category Expenses Data
  const allCategoriesExpensesData: CategoryExpensesData[] = generateCategoryExpensesData(categoryMenuItems, categoriesExpensesData);

  // Get rows
  // const rows: CategoryExpensesData[] = old_getRows(categoryMenuItems);
  const rows: CategoryExpensesData[] = getRows(allCategoriesExpensesData, categoryMenuItems);

  // Calculate total amount
  let totalAmount = 0;
  for (const categoryExpensesData of rows) {
    const category: Category = categoryByCategoryNameLUT[categoryExpensesData.categoryName.trim()];
    if (category.parentId === '') {
      totalAmount += categoryExpensesData.totalExpenses;
    }
  }

  return (
    <React.Fragment>
      <AddCategoryAssignmentRuleDialog
        open={showAddCategoryAssignmentRuleDialog}
        onSaveRule={handleSaveRule}
        onClose={handleCloseAddRuleDialog}
        transactionId={transactionId}
      />
      <EditTransactionDialog
        open={showEditTransactionDialog}
        transactionId={transactionId}
        onClose={handleCloseEditTransactionDialog}
        onSave={handleSaveTransaction}
      />
      <h4>Date Range {formatDate(generatedReportStartDate)} - {formatDate(generatedReportEndDate)}</h4>
      <h4>Total Amount: {formatCurrency(totalAmount)}</h4>
      <h4>Per Month: {expensesPerMonth(totalAmount, generatedReportStartDate, generatedReportEndDate)}</h4>
      <div className="table-container">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell"></div>
            <div className="table-cell">Category</div>
            <div className="table-cell">Transaction Count</div>
            <div className="table-cell">Total Amount</div>
            <div className="table-cell">Percentage of Total</div>
          </div>
        </div>
        <div className="spending-report-table-body">
          {rows.map((categoryExpenses: { id: React.Key | null | undefined; categoryName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; transactionCount: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; totalExpenses: number; percentageOfTotal: number; transactions: any[]; }) => (
            <React.Fragment key={categoryExpenses.id}>
              <div className="table-row">
                <div className="table-cell">
                  <IconButton onClick={() => handleButtonClick(categoryExpenses.id as string)}>
                    {selectedRowId === categoryExpenses.id ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </div>
                <div className="table-cell">{categoryExpenses.categoryName}</div>
                <div className="table-cell">{categoryExpenses.transactionCount}</div>
                <div className="table-cell">{formatCurrency(categoryExpenses.totalExpenses)}</div>
                <div className="table-cell">{formatPercentage(categoryExpenses.percentageOfTotal)}</div>
              </div>
              {selectedRowId === categoryExpenses.id && (
                <div className="details-table-container">
                  <div className="table-header">
                    <div className="table-row">
                      <div className="table-cell"></div>
                      <div className="table-cell">Date</div>
                      <div className="table-cell">Amount</div>
                      <div className="table-cell">Description</div>
                    </div>
                  </div>
                  <div className="table-body">
                    {getSortedBankTransactions(categoryExpenses.transactions).map((transaction: { bankTransaction: Transaction }) => (
                      <div
                        className="table-row-clickable"
                        key={transaction.bankTransaction.id}
                        onClick={() => handleClickTransaction(transaction.bankTransaction)}
                      >
                        <div className="table-cell">
                          <IconButton onClick={(event: any) => {
                            event.stopPropagation();
                            handleAssignCategory(transaction.bankTransaction)
                          }
                          }>
                            <AssignmentIcon />
                          </IconButton>
                          <Tooltip title="Edit transaction">
                            <IconButton onClick={(event: any) => {
                              event.stopPropagation();
                              handleEditTransaction(transaction.bankTransaction)
                            }
                            }>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                        <div className="table-cell">{formatDate(transaction.bankTransaction.transactionDate)}</div>
                        <div className="table-cell">{formatCurrency(-transaction.bankTransaction.amount)}</div>
                        <div className="table-cell">{transaction.bankTransaction.userDescription}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </React.Fragment >
  );
};

export default SpendingReportTable;
