import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate, useParams } from 'react-router-dom';

import '../styles/Grid.css';

import { Button } from '@mui/material';

import { isNil } from 'lodash';

import { CheckingAccountTransaction, CheckingAccountTransactionRowInStatementTableProperties } from '../types';
import { getCheckingAccountTransactionRowInStatementTableProperties, getTransactionsByStatementId } from '../selectors';

import CheckingAccountStatementTransactionRow from './CheckingAccountStatementTransactionRow';

import { useDispatch, useTypedSelector } from '../types';

const CheckingAccountStatementTable: React.FC = () => {

  console.log('CreditCardStatementTable');
  const { id } = useParams<{ id: string }>();

  const checkingAccountStatementId: string = id!;

  const dispatch = useDispatch();

  const checkingAccountTransactionRows = useTypedSelector(state => getCheckingAccountTransactionRowInStatementTableProperties(state, checkingAccountStatementId));
  // const checkingAccountTransactionRows: any[] = [];

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

  const navigate = useNavigate();

  console.log('render CheckingAccountStatementTable', checkingAccountStatementId);

  return (
    <React.Fragment>
      <div className="checking-account-statement-grid-table-container">
        <div className="grid-table-header">
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell" onClick={() => handleSort('transactionDate')}>Date{renderSortIndicator('transactionDate')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('amount')}>Amount{renderSortIndicator('amount')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('name')}>Description{renderSortIndicator('name')}</div>
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell" onClick={() => handleSort('userDescription')}>User Description{renderSortIndicator('userDescription')}</div>
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell" onClick={() => handleSort('categoryNameFromCategoryAssignmentRule')}>Category (rule){renderSortIndicator('categoryNameFromCategoryAssignmentRule')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('patternFromCategoryAssignmentRule')}>Pattern{renderSortIndicator('patternFromCategoryAssignmentRule')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('categoryNameFromCategoryOverride')}>Category (override){renderSortIndicator('categoryNameFromCategoryOverride')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('categorizedTransactionName')}>Category{renderSortIndicator('categorizedTransactionName')}</div>
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

