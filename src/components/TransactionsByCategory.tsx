import React, { useState } from 'react';
import { StringToTransactionsLUT, useTypedSelector } from '../types';
import { getTransactionsByCategory } from '../selectors';
import { Box, Typography } from '@mui/material';

import '../styles/Tracker.css';
import TransactionsByCategoryRow from './TransactionsByCategoryRow';

const TransactionsByCategory: React.FC = () => {

  const transactionsByCategoryId: StringToTransactionsLUT = useTypedSelector(state => getTransactionsByCategory(state));
  console.log('transactionsByCategory');
  console.log(transactionsByCategoryId);
  console.log(Object.keys(transactionsByCategoryId).length);

  const [sortColumn, setSortColumn] = useState<string>('totalExpenses');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };


  const renderRows = () => {
    return Object.keys(transactionsByCategoryId).map((categoryId: string) => {
      const transactions = transactionsByCategoryId[categoryId];
      return (
        <div key={categoryId}>
          <TransactionsByCategoryRow
            categoryId={categoryId}
            transactions={transactions}
          />
        </div>
      );
    });
  }

  return (
    <React.Fragment>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5">Transactions by Category</Typography>
        <Box sx={{ padding: '20px' }}>
          <Box>
            <div className="dtc-fixed-table-container">
              <div className="dtc-fixed-table-header">
                <div className="dtc-fixed-table-row">
                  <div className="dtc-fixed-width-base-table-cell dtc-fixed-width-table-cell-icon"></div>
                  <div className="dtc-fixed-width-base-table-cell dtc-fixed-width-table-cell-property" style={{ marginLeft: '36px' }} onClick={() => handleSort('categoryName')}>Category{renderSortIndicator('categoryName')}</div>
                  <div className="dtc-fixed-width-base-table-cell dtc-fixed-width-table-cell-property" onClick={() => handleSort('transactionCount')}>Transaction Count{renderSortIndicator('transactionCount')}</div>
                </div>
              </div>
              <div className="dtc-spending-report-table-body">
                {renderRows()}
              </div>
            </div>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
}

export default TransactionsByCategory;
