import React, { useState } from 'react';
import { getAppInitialized, getCategories, getTransactionsByCategory, getTransactionsByCategoryAssignmentRules } from '../selectors'; // Adjust imports as needed
import { CategorizedTransaction, Category, StringToTransactionsLUT, Transaction, useTypedSelector } from '../types'; // Adjust imports as needed
import '../styles/TransactionsByCategory.css'; // Custom CSS
import { formatCurrency, formatDate } from '../utilities';
import { Typography } from '@mui/material';

type SortCriteria = 'name' | 'transactionCount';
type SortOrder = 'asc' | 'desc';

const TransactionsByCategory: React.FC = () => {

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));
  const transactionsByCategory: StringToTransactionsLUT = useTypedSelector(state => getTransactionsByCategory(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));

  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  if (!appInitialized) {
    return null;
  }

  const handleSort = (criteria: SortCriteria) => () => {
    if (sortCriteria === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortOrder('asc');
    }
  };

  const sortedCategories = [...categories].sort((a: any, b: any) => {

    let aValue;
    let bValue;

    if (sortCriteria === 'transactionCount') {
      aValue = transactionsByCategory[a.id]?.length || 0;
      bValue = transactionsByCategory[b.id]?.length || 0;
    } else {
      aValue = a[sortCriteria];
      bValue = b[sortCriteria];
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Toggles the expanded state of a category
  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const getSortIcon = () => {
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <React.Fragment>
      <Typography variant="h5">Transactions by Category</Typography>
      <div className="transactions-by-category-container" style={{ maxHeight: 722 }}>
        <table className="category-table" style={{ width: '1200px' }}>
          <thead>
            <tr>
              <th style={{ width: '36px' }}></th>
              <th onClick={handleSort('name')}>
                Category {sortCriteria === 'name' && getSortIcon()}
              </th>
              <th onClick={handleSort('transactionCount')}>
                Transaction Count {sortCriteria === 'transactionCount' && getSortIcon()}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((category: Category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const categoryTransactions: CategorizedTransaction[] = transactionsByCategory[category.id] || [];

              return (
                <React.Fragment key={category.id}>
                  <tr>
                    <td>
                      <button onClick={() => toggleCategory(category.id)}>
                        {isExpanded ? '▼' : '►'}
                      </button>
                    </td>
                    <td>{category.name}</td>
                    <td>{categoryTransactions.length}</td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={3}>
                        <div className="subtable-container">
                          <table className="transaction-subtable">
                            <thead>
                              <tr>
                                <th style={{ width: '92px' }}>Date</th>
                                <th>Amount</th>
                                <th>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryTransactions.map((transaction: CategorizedTransaction) => (
                                <tr key={transaction.bankTransaction.id}>
                                  <td>{formatDate(transaction.bankTransaction.transactionDate)}</td>
                                  <td>{formatCurrency(-transaction.bankTransaction.amount)}</td>
                                  <td>{transaction.bankTransaction.userDescription}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
};

export default TransactionsByCategory;
