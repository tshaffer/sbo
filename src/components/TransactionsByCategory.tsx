import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getCategories, getTransactionsByCategory, getTransactionsByCategoryAssignmentRules } from '../selectors'; // Adjust imports as needed
import { Category, StringToTransactionsLUT, Transaction, useTypedSelector } from '../types'; // Adjust imports as needed
import '../styles/TransactionsByCategory.css'; // Custom CSS

interface TransactionsByCategoryProps { }

const TransactionsByCategory: React.FC<TransactionsByCategoryProps> = () => {

  const transactionsByCategoryId: StringToTransactionsLUT = useTypedSelector(state => getTransactionsByCategory(state));

  const categories: Category[] = useTypedSelector(state => getCategories(state));
  // const categories: Category[] = useTypedSelector(state => getCategories(state));

  // const categories = useSelector(getCategories);
  // const transactionsByCategory = useSelector(getTransactionsByCategoryAssignmentRules);

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  return (
    <div className="transactions-by-category-container">
      <table className="category-table" style={{ width: '1200px' }}>
        <thead>
          <tr>
            <th></th>
            <th>Category</th>
            <th>Transaction Count</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category: Category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const categoryTransactions = transactionsByCategory[category.id] || [];

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
                        <div className="category-header">
                          <strong>{category.name}</strong> - {categoryTransactions.length} transactions
                        </div>
                        <table className="transaction-subtable">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Amount</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryTransactions.map((transaction: Transaction) => (
                              <tr key={transaction.id}>
                                <td>{transaction.date}</td>
                                <td>{transaction.amount}</td>
                                <td>{transaction.description}</td>
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
  );
};

export default TransactionsByCategory;