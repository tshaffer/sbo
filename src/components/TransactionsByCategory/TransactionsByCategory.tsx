import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAppInitialized, getCategories, getTransactionsByCategory, getTransactionsByCategoryAssignmentRules } from '../../selectors'; // Adjust imports as needed
import { BankTransactionType, CategorizedTransaction, Category, StringToTransactionsLUT, Transaction, useTypedSelector } from '../../types'; // Adjust imports as needed
import '../../styles/TransactionsByCategory.css'; // Custom CSS
import { formatCurrency, formatDate } from '../../utilities';
import { Typography } from '@mui/material';

type TableSortCriteria = 'name' | 'transactionCount';
type TableSortOrder = 'asc' | 'desc';

type SubTableSortCriteria = 'date' | 'amount' | 'description';
type SubTableSortOrder = 'asc' | 'desc';

const TransactionsByCategory: React.FC = () => {

  const navigate = useNavigate(); // Hook for navigation

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));
  const transactionsByCategory: StringToTransactionsLUT = useTypedSelector(state => getTransactionsByCategory(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));

  const [tableSortCriteria, setTableSortCriteria] = useState<TableSortCriteria>('name');
  const [tableSortOrder, setTableSortOrder] = useState<TableSortOrder>('asc');

  const [subTableSortCriteria, setSubTableSortCriteria] = useState<SubTableSortCriteria>('date');
  const [subTableSortOrder, setSubTableSortOrder] = useState<SubTableSortOrder>('asc');

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  if (!appInitialized) {
    return null;
  }

  const handleTableSort = (criteria: TableSortCriteria) => () => {
    if (tableSortCriteria === criteria) {
      setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortCriteria(criteria);
      setTableSortOrder('asc');
    }
  };

  const sortedCategories = [...categories].sort((a: any, b: any) => {

    let aValue;
    let bValue;

    if (tableSortCriteria === 'transactionCount') {
      aValue = transactionsByCategory[a.id]?.length || 0;
      bValue = transactionsByCategory[b.id]?.length || 0;
    } else {
      aValue = a[tableSortCriteria];
      bValue = b[tableSortCriteria];
    }

    if (aValue < bValue) {
      return tableSortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return tableSortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSubTableSort = (criteria: SubTableSortCriteria) => () => {
    if (subTableSortCriteria === criteria) {
      setSubTableSortOrder(subTableSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSubTableSortCriteria(criteria);
      setSubTableSortOrder('asc');
    }
  };

  const getSortedCategoryTransactions = (sortedCategoryTransactions: any[]) => {

    return sortedCategoryTransactions.sort((a: any, b: any) => {

      let aValue;
      let bValue;

      if (subTableSortCriteria === 'date') {
        aValue = a.bankTransaction.transactionDate;
        bValue = b.bankTransaction.transactionDate;
      } else if (subTableSortCriteria === 'amount') {
        aValue = a.bankTransaction.amount;
        bValue = b.bankTransaction.amount;
      } else {
        aValue = a.bankTransaction.userDescription;
        bValue = b.bankTransaction.userDescription;
      }

      if (aValue < bValue) {
        return subTableSortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return subTableSortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const handleNavigateToStatement = (transaction: Transaction) => {
    if (transaction.bankTransactionType === BankTransactionType.Checking) {
      navigate(`/statements/checking-account/${transaction.statementId}`);
    } else if (transaction.bankTransactionType === BankTransactionType.CreditCard) {
      navigate(`/statements/credit-card/${transaction.statementId}`);
    }
  };


  // Toggles the expanded state of a category
  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const getTableSortIcon = () => {
    return tableSortOrder === 'asc' ? '↑' : '↓';
  };

  const getSubTableSortIcon = () => {
    return subTableSortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <React.Fragment>
      <Typography variant="h5">Transactions by Category</Typography>
      <div className="transactions-by-category-container" style={{ maxHeight: 722 }}>
        <table className="category-table" style={{ width: '1200px' }}>
          <thead>
            <tr>
              <th style={{ width: '36px' }}></th>
              <th onClick={handleTableSort('name')}>
                Category {tableSortCriteria === 'name' && getTableSortIcon()}
              </th>
              <th onClick={handleTableSort('transactionCount')}>
                Transaction Count {tableSortCriteria === 'transactionCount' && getTableSortIcon()}
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
                                <th onClick={handleSubTableSort('date')} style={{ width: '92px' }}>
                                  Date {subTableSortCriteria === 'date' && getSubTableSortIcon()}
                                </th>
                                <th onClick={handleSubTableSort('amount')}>
                                  Amount {subTableSortCriteria === 'amount' && getSubTableSortIcon()}
                                </th>
                                <th onClick={handleSubTableSort('description')}>
                                  Description {subTableSortCriteria === 'description' && getSubTableSortIcon()}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSortedCategoryTransactions(categoryTransactions).map((transaction: CategorizedTransaction) => (
                                <tr
                                  className="transaction-subtable-row"
                                  key={transaction.bankTransaction.id}
                                  onClick={() => handleNavigateToStatement(transaction.bankTransaction)} // Handle row click
                                  style={{ cursor: 'pointer' }} // Change cursor to pointer for visual feedback
                                >
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
