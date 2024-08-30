import React, { useState } from 'react';


import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import '../styles/Tracker.css';
import { CategorizedTransaction, Category, CategoryExpensesData, CategoryMenuItem, StringToCategoryLUT, StringToCategoryMenuItemLUT, StringToTransactionsLUT, Transaction } from '../types';
import { formatCurrency, formatPercentage, formatDate, expensesPerMonth, roundTo } from '../utilities';
import { getTransactionsByCategory, getGeneratedReportStartDate, getGeneratedReportEndDate, getCategories, getCategoryByCategoryNameLUT, getCategoryByName, getCategoryIdsToExclude, selectReportDataState } from '../selectors';
import { cloneDeep, isEmpty, isNil } from 'lodash';

import { useDispatch, useTypedSelector } from '../types';

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

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  if (isEmpty(transactionsByCategoryId)) {
    return null;
  }

  const handleButtonClick = (rowId: string) => {
    setSelectedRowId(prevRowId => (prevRowId === rowId ? null : rowId));
  };

  const buildCategoryMenuItems = (categories: Category[]): CategoryMenuItem[] => {
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
        map[category.parentId]?.children.push(map[category.id]);
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

  const getRows = (categories: CategoryMenuItem[]): CategoryExpensesData[] => {
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
        totalExpenses += accumulateExpenses(subCategory);
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

    // Collect top-level rows
    categories.forEach(category => {
      if (category.parentId === '' || categoryExpensesMap.has(category.id)) {
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

  let trimmedCategories: Category[] = cloneDeep(categories);
  trimmedCategories = categories.filter(category =>
    !categoryIdsToExclude.includes(category.id) && category.id !== ignoreCategory?.id
  );
  trimmedCategories = trimCategoriesPerImportance(trimmedCategories);

  const categoryMenuItems: CategoryMenuItem[] = buildCategoryMenuItems(trimmedCategories);

  const rows: CategoryExpensesData[] = getRows(categoryMenuItems);

  let totalAmount = 0;
  for (const categoryExpensesData of rows) {
    const category: Category = categoryByCategoryNameLUT[categoryExpensesData.categoryName.trim()];
    if (category.parentId === '') {
      totalAmount += categoryExpensesData.totalExpenses;
    }
  }

  return (
    <React.Fragment>
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
                      <div className="table-row" key={transaction.bankTransaction.id}>
                        <div className="table-cell"></div>
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
