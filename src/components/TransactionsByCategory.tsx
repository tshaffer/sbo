import React, { useState } from 'react';
import { StringToTransactionsLUT, useTypedSelector } from '../types';
import { getTransactionsByCategory } from '../selectors';
import { Box, Typography } from '@mui/material';

const TransactionsByCategory: React.FC = () => {

  const transactionsByCategoryId: StringToTransactionsLUT = useTypedSelector(state => getTransactionsByCategory(state));
  console.log('transactionsByCategory', transactionsByCategoryId);

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


  return (
    <React.Fragment>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5">Transactions by Category</Typography>
        <Box sx={{ padding: '20px' }}>
          <Box>
            <div className="fixed-table-container">
              <div className="fixed-table-header">
                <div className="fixed-table-row">
                  <div className="fixed-width-base-table-cell fixed-width-table-cell-property" onClick={() => handleSort('categoryName')}>Category{renderSortIndicator('categoryName')}</div>
                  <div className="fixed-width-base-table-cell fixed-width-table-cell-property" onClick={() => handleSort('transactionCount')}>Transaction Count{renderSortIndicator('transactionCount')}</div>
                </div>
              </div>
            </div>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
}

export default TransactionsByCategory;
