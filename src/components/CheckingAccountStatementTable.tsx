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
        <div className="grid-table-header">
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell" onClick={() => handleSort('transactionDate')}>Date{renderSortIndicator('transactionDate')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('amount')}>Amount{renderSortIndicator('amount')}</div>
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell" onClick={() => handleSort('userDescription')}>Description{renderSortIndicator('userDescription')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('categorizedTransactionName')}>Category{renderSortIndicator('categorizedTransactionName')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('comment')}>Comment{renderSortIndicator('comment')}</div>
          <div className="grid-table-cell"></div>
        </div>
        <div className="grid-table-body">
          {sortedTransactions.map((checkingAccountTransactionRowInStatementTableProperties: CheckingAccountTransactionRowInStatementTableProperties) => (
            <div className="grid-table-row" key={checkingAccountTransactionRowInStatementTableProperties.id}>
              <CheckingAccountStatementTransactionRow checkingAccountTransaction={checkingAccountTransactionRowInStatementTableProperties.checkingAccountTransaction} />
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

export default CheckingAccountStatementTable;

