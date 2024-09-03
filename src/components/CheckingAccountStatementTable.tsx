import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import '../styles/Grid.css';

import { isNil } from 'lodash';

import { CheckingAccountTransactionRowInStatementTableProperties } from '../types';
import { getCheckingAccountTransactionRowInStatementTableProperties } from '../selectors';

import CheckingAccountStatementTransactionRow from './CheckingAccountStatementTransactionRow';

import { useTypedSelector } from '../types';

const CheckingAccountStatementTable: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const checkingAccountStatementId: string = id!;

  const checkingAccountTransactionRows = useTypedSelector(state => getCheckingAccountTransactionRowInStatementTableProperties(state, checkingAccountStatementId));

  const [sortColumn, setSortColumn] = useState<string>('transactionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  if (isNil(checkingAccountStatementId)) {
    return null;
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const sortedTransactions = [...(checkingAccountTransactionRows)].sort((a: any, b: any) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <React.Fragment>
      <div className="checking-account-statement-grid-table-container">
        <div className="checking-account-statement-grid-table-header">
          <div className="checking-account-statement-grid-table-cell"></div>
          <div className="checking-account-statement-grid-table-cell" onClick={() => handleSort('transactionDate')}>Date{renderSortIndicator('transactionDate')}</div>
          <div className="checking-account-statement-grid-table-cell" onClick={() => handleSort('amount')}>Amount{renderSortIndicator('amount')}</div>
          <div className="checking-account-statement-grid-table-cell" onClick={() => handleSort('name')}>Description{renderSortIndicator('name')}</div>
          <div className="checking-account-statement-grid-table-cell"></div>
          <div className="checking-account-statement-grid-table-cell" onClick={() => handleSort('userDescription')}>User Description{renderSortIndicator('userDescription')}</div>
          <div className="checking-account-statement-grid-table-cell"></div>
          <div className="checking-account-statement-grid-table-cell" onClick={() => handleSort('categoryNameFromCategoryAssignmentRule')}>Category (rule){renderSortIndicator('categoryNameFromCategoryAssignmentRule')}</div>
          <div className="checking-account-statement-grid-table-cell" onClick={() => handleSort('patternFromCategoryAssignmentRule')}>Pattern{renderSortIndicator('patternFromCategoryAssignmentRule')}</div>
          <div className="checking-account-statement-grid-table-cell" onClick={() => handleSort('categoryNameFromCategoryOverride')}>Category (override){renderSortIndicator('categoryNameFromCategoryOverride')}</div>
          <div className="checking-account-statement-grid-table-cell" onClick={() => handleSort('categorizedTransactionName')}>Category{renderSortIndicator('categorizedTransactionName')}</div>
          <div className="checking-account-statement-grid-table-cell"></div>
        </div>
        <div className="checking-account-statement-grid-table-body">
          {sortedTransactions.map((checkingAccountTransactionRowInStatementTableProperties: CheckingAccountTransactionRowInStatementTableProperties) => (
            <div className="checking-account-statement-grid-table-row" key={checkingAccountTransactionRowInStatementTableProperties.id}>
              <CheckingAccountStatementTransactionRow checkingAccountTransaction={checkingAccountTransactionRowInStatementTableProperties.checkingAccountTransaction} />
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

export default CheckingAccountStatementTable;

