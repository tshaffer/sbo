import React, { useState } from 'react';
import { getCategories, getTransactionsByCategory, getTransactionsByCategoryAssignmentRules } from '../selectors'; // Adjust imports as needed
import { CategorizedTransaction, Category, StringToTransactionsLUT, Transaction, useTypedSelector } from '../types'; // Adjust imports as needed
import '../styles/TransactionsByCategory.css'; // Custom CSS
import { formatCurrency, formatDate } from '../utilities';
import { Typography } from '@mui/material';

// Define the props and state types
interface TransactionsByCategoryProps { }

// Main component with TypeScript types
const TransactionsByCategory: React.FC<TransactionsByCategoryProps> = () => {

  const transactionsByCategory: StringToTransactionsLUT = useTypedSelector(state => getTransactionsByCategory(state));
  const categories: Category[] = useTypedSelector(state => getCategories(state));

  // State to manage which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Toggles the expanded state of a category
  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  return (
    <React.Fragment>
      <Typography variant="h5">Transactions by Category</Typography>
      <div className="transactions-by-category-container">
        <table className="category-table" style={{ width: '1200px' }}>
          <thead>
            <tr>
              <th style={{ width: '36px' }}></th>
              <th>Category</th>
              <th>Transaction Count</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category: Category) => {
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
