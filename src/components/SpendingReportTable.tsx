import React, { useState } from 'react';


import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import '../styles/Tracker.css';
import { BankTransaction, CategorizedTransaction, Category, CategoryExpensesData, CategoryMenuItem, StringToCategoryLUT, StringToCategoryMenuItemLUT, StringToTransactionsLUT, Transaction } from '../types';
import { formatCurrency, formatPercentage, expensesPerMonth, roundTo } from '../utilities';
import { getCategories, getCategoryByCategoryNameLUT, getCategoryByName, getCategoryIdsToExclude, selectReportDataState, getStartDate, getEndDate, getTransactionsByCategoryIdInDateRange } from '../selectors';
import { cloneDeep, isEmpty, isNil } from 'lodash';

import { useTypedSelector } from '../types';
import SpendingReportTableRow from './SpendingReportTableRow';

const SpendingReportTable: React.FC = () => {

  const categories: Category[] = useTypedSelector(getCategories);
  const categoryByCategoryNameLUT: StringToCategoryLUT = useTypedSelector(getCategoryByCategoryNameLUT);
  const startDate: string = useTypedSelector(getStartDate);
  const endDate: string = useTypedSelector(getEndDate);
  const transactionsByCategoryIdInDateRange: StringToTransactionsLUT = useTypedSelector(getTransactionsByCategoryIdInDateRange);
  const ignoreCategory: Category | undefined = useTypedSelector(state => getCategoryByName(state, 'Ignore'));
  const categoryIdsToExclude: string[] = useTypedSelector(getCategoryIdsToExclude);
  const reportDataState = useTypedSelector(selectReportDataState);

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const [categorySortColumn, setCategorySortColumn] = useState<string>('totalExpenses');
  const [categorySortOrder, setCategorySortOrder] = useState<'asc' | 'desc'>('desc');

  const [transactionsSortColumn, setTransactionsSortColumn] = useState<string>('transactionDate');
  const [transactionsSortOrder, setTransactionsSortOrder] = useState<'asc' | 'desc'>('desc');

  if (isEmpty(transactionsByCategoryIdInDateRange)) {
    return null;
  }

  const handleSelectRow = (rowId: string) => {
    setSelectedRowId(prevRowId => (prevRowId === rowId ? null : rowId));
  };

  const handleToggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prevExpandedCategories => {
      const newExpandedCategories = new Set(prevExpandedCategories);
      if (newExpandedCategories.has(categoryId)) {
        newExpandedCategories.delete(categoryId);
      } else {
        newExpandedCategories.add(categoryId);
      }
      return newExpandedCategories;
    });
  };

  const isCategoryExpanded = (categoryId: string) => expandedCategories.has(categoryId);

  const sortTransactionsCallback = (a: CategorizedTransaction, b: CategorizedTransaction) => {

    const aValue = a.bankTransaction[transactionsSortColumn as keyof BankTransaction]!;
    const bValue = b.bankTransaction[transactionsSortColumn as keyof BankTransaction]!;

    if (aValue < bValue) {
      return transactionsSortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return transactionsSortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  }

  const getSortedBankTransactions = (categorizedTransactions: CategorizedTransaction[]): CategorizedTransaction[] => {
    const sortedTransactions = [...categorizedTransactions].sort((a, b) => sortTransactionsCallback(a, b));
    return sortedTransactions;
  }

  const handleSortTransactions = (column: string) => {
    if (transactionsSortColumn === column) {
      setTransactionsSortOrder(transactionsSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTransactionsSortColumn(column);
      setTransactionsSortOrder('asc');
    }
  };

  const renderSortTransactionsIndicator = (column: string) => {
    if (transactionsSortColumn !== column) return null;
    return transactionsSortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const sortCategoriesCallback = (a: CategoryExpensesData, b: CategoryExpensesData) => {

    const aValue = a[categorySortColumn as keyof CategoryExpensesData];
    const bValue = b[categorySortColumn as keyof CategoryExpensesData];

    if (aValue < bValue) {
      return categorySortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return categorySortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  }

  const sortCategoriesRecursively = (categories: CategoryExpensesData[]): CategoryExpensesData[] => {

    // Sort top-level categories by total expenses
    const sortedCategories = [...categories].sort((a, b) => sortCategoriesCallback(a, b));

    // Recursively sort children
    sortedCategories.forEach((category) => {
      if (category.children && category.children.length > 0) {
        category.children = sortCategoriesRecursively(category.children);
      }
    });

    return sortedCategories;
  };

  const handleSortCategories = (column: string) => {
    if (categorySortColumn === column) {
      setCategorySortOrder(categorySortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setCategorySortColumn(column);
      setCategorySortOrder('asc');
    }
  };

  const renderSortCategoriesIndicator = (column: string) => {
    if (categorySortColumn !== column) return null;
    return categorySortOrder === 'asc' ? ' ▲' : ' ▼';
  };

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

      categoryExpensesMap.set(categoryMenuItem.id, totalExpenses);

      // Accumulate total expenses for top-level categories
      if (categoryMenuItem.parentId === '') {
        totalTopLevelExpenses += totalExpenses;
      }

      return totalExpenses;
    };

    allCategoriesExpensesData.forEach(categoryExpensesData => accumulateExpenses(categoryExpensesData));

    // Filter out categories with 0 transactions and no descendant transactions
    const filterCategories = (categoryMenuItem: CategoryMenuItem): CategoryMenuItem | null => {
      const categoryTotalExpenses = categoryExpensesMap.get(categoryMenuItem.id) || 0;

      if (categoryTotalExpenses !== 0) {
        // Recursively filter the children
        const filteredChildren = categoryMenuItem.children
          .map(subCategory => filterCategories(subCategory))
          .filter(subCategory => subCategory !== null) as CategoryMenuItem[];

        return {
          ...categoryMenuItem,
          children: filteredChildren,
        };
      }

      // If the category has no transactions and no valid descendants, filter it out
      return null;
    };

    const filteredCategories = categoryMenuItems
      .map(category => filterCategories(category))
      .filter(category => category !== null) as CategoryMenuItem[];

    // Second pass to build rows and calculate percentages
    const processCategory = (category: CategoryMenuItem, level = 0, parentTotalExpenses = 0): CategoryExpensesData => {
      const transactions = transactionsByCategoryIdInDateRange[category.id] || [];
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
    const transactions: CategorizedTransaction[] = transactionsByCategoryIdInDateRange[category.id] || [];
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

  // Hack
  const isSubCategory = (categoryExpenses: CategoryExpensesData): boolean => {
    return categoryExpenses.categoryName.startsWith('\u00A0');
  }

  const isParentCategory = (categoryExpenses: CategoryExpensesData): boolean => {
    return categoryExpenses.children.length > 0;
  }

  // Hack - a category doesn't have any direct indicator of its parent
  const getParentCategory = (
    allCategoriesExpensesData: CategoryExpensesData[],
    categoryExpenses: CategoryExpensesData
  ): CategoryExpensesData | null => {
    for (const categoryExpensesData of allCategoriesExpensesData) {
      const parentCategory = categoryExpensesData.children.find(
        (subCategoryExpensesData) => subCategoryExpensesData.id === categoryExpenses.id
      );
      if (parentCategory) {
        return categoryExpensesData;
      }
    }
    return null;
  };

  const renderExpandIcon = (categoryExpenses: CategoryExpensesData): JSX.Element | null => {
    if (!isParentCategory(categoryExpenses)) {
      return null;
    }
    return (
      <IconButton onClick={() => handleToggleCategoryExpand(categoryExpenses.id as string)}>
        {isCategoryExpanded(categoryExpenses.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    );
  }

  const renderRow = (categoryExpenses: CategoryExpensesData): JSX.Element | null => {

    // display a row if it is a top-level category or a sub-category and its parent is expanded
    const isTopLevelCategory: boolean = !isSubCategory(categoryExpenses);
    if (!isTopLevelCategory) {
      const parentCategory: CategoryExpensesData | null = getParentCategory(rows, categoryExpenses);
      if (!parentCategory) {
        // this should not happen
        debugger;
        return null;
      }
      if (!isCategoryExpanded(parentCategory.id as string)) {
        return null;
      }
    }

    return (
      <React.Fragment key={categoryExpenses.id}>
        <div className="fixed-table-row">
          <div className="fixed-width-base-table-cell fixed-width-table-cell-icon">
            {renderExpandIcon(categoryExpenses)}
          </div>
          <div className="fixed-width-base-table-cell fixed-width-table-cell-icon">
            <IconButton onClick={() => handleSelectRow(categoryExpenses.id as string)}>
              {selectedRowId === categoryExpenses.id ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          </div>
          <div className="fixed-width-base-table-cell fixed-width-table-cell-property" style={{ marginLeft: '36px' }}>{categoryExpenses.categoryName}</div>
          <div className="fixed-width-base-table-cell fixed-width-table-cell-property">{categoryExpenses.transactionCount}</div>
          <div className="fixed-width-base-table-cell fixed-width-table-cell-property">{formatCurrency(categoryExpenses.totalExpenses)}</div>
          <div className="fixed-width-base-table-cell fixed-width-table-cell-property">{formatPercentage(categoryExpenses.percentageOfTotal)}</div>
        </div>
        {selectedRowId === categoryExpenses.id && (
          <div className="details-table-container">
            <div className="details-table-header">
              <div className="details-table-row">
                <div className="fixed-width-base-table-cell details-table-cell-icon"></div>
                <div className="fixed-width-base-table-cell details-table-cell-icon"></div>
                <div className="fixed-width-base-table-cell details-table-cell-property" style={{ marginLeft: '36px' }} onClick={() => handleSortTransactions('transactionDate')}>Date{renderSortTransactionsIndicator('transactionDate')}</div>
                <div className="fixed-width-base-table-cell details-table-cell-property" onClick={() => handleSortTransactions('amount')}>Amount{renderSortTransactionsIndicator('amount')}</div>
                <div className="fixed-width-base-table-cell details-table-cell-property" onClick={() => handleSortTransactions('userDescription')}>Description{renderSortTransactionsIndicator('userDescription')}</div>
                <div className="fixed-width-base-table-cell details-table-cell-property" onClick={() => handleSortTransactions('comment')}>Comment{renderSortTransactionsIndicator('comment')}</div>
              </div>
            </div>
            <div className="table-body">
              {getSortedBankTransactions(categoryExpenses.transactions).map((transaction: { bankTransaction: Transaction }) => (
                <React.Fragment key={transaction.bankTransaction.id}>
                  <SpendingReportTableRow transaction={transaction.bankTransaction} />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }

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
      <h4>
        <span>
          Total Amount: {formatCurrency(totalAmount)}
        </span>
        <span style={{ marginLeft: '32px' }}>
          Per Month: {expensesPerMonth(totalAmount, startDate, endDate)}
        </span>
      </h4>
      <div className="fixed-table-container">
        <div className="fixed-table-header">
          <div className="fixed-table-row">
            <div className="fixed-width-base-table-cell fixed-width-table-cell-icon"></div>
            <div className="fixed-width-base-table-cell fixed-width-table-cell-icon"></div>
            <div className="fixed-width-base-table-cell fixed-width-table-cell-property" style={{ marginLeft: '36px' }} onClick={() => handleSortCategories('categoryName')}>Category{renderSortCategoriesIndicator('categoryName')}</div>
            <div className="fixed-width-base-table-cell fixed-width-table-cell-property" onClick={() => handleSortCategories('transactionCount')}>Transaction Count{renderSortCategoriesIndicator('transactionCount')}</div>
            <div className="fixed-width-base-table-cell fixed-width-table-cell-property" onClick={() => handleSortCategories('totalExpenses')}>Total Amount{renderSortCategoriesIndicator('totalExpenses')}</div>
            <div className="fixed-width-base-table-cell fixed-width-table-cell-property" onClick={() => handleSortCategories('percentageOfTotal')}>Percentage of Total{renderSortCategoriesIndicator('percentageOfTotal')}</div>
          </div>
        </div>
        <div className="spending-report-table-body">
          {rows.map((categoryExpenses: CategoryExpensesData) => (
            renderRow(categoryExpenses)
          ))}
        </div>
      </div>
    </React.Fragment >
  );
};

export default SpendingReportTable;
