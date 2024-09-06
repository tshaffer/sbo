import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import '../styles/Grid.css';

import { cloneDeep, isNil } from 'lodash';

import { CheckingAccountStatement, CheckingAccountTransactionRowInStatementTableProperties, useDispatch } from '../types';
import { getCheckingAccountStatements, getCheckingAccountTransactionRowInStatementTableProperties } from '../selectors';

import CheckingAccountStatementTransactionRow from './CheckingAccountStatementTransactionRow';

import { useTypedSelector } from '../types';
import { loadTransactions } from '../controllers';
import { Box, Button } from '@mui/material';

const CheckingAccountStatementTable: React.FC = () => {

  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const checkingAccountStatementId: string = id!;

  const checkingAccountTransactionRows = useTypedSelector(state => getCheckingAccountTransactionRowInStatementTableProperties(state, checkingAccountStatementId));

  const [sortColumn, setSortColumn] = useState<string>('transactionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const statements: CheckingAccountStatement[] = useTypedSelector(state => getCheckingAccountStatements(state));
  let sortedStatements = cloneDeep(statements);
  sortedStatements = sortedStatements.sort((a, b) => b.endDate.localeCompare(a.endDate));

  function findStatementIndexById(statements: CheckingAccountStatement[], id: string): number {
    return statements.findIndex(statement => statement.id === id);
  }

  const indexOfId: number = findStatementIndexById(sortedStatements, id!);
  if (indexOfId === -1) {
    throw new Error(`Statement with id ${id} not found`);
  }

  let nextStatement: CheckingAccountStatement | undefined = undefined;
  let previousStatement: CheckingAccountStatement | undefined = undefined;

  if (indexOfId === 0) {
    nextStatement = sortedStatements[indexOfId + 1];
  } else if (indexOfId === sortedStatements.length - 1) {
    previousStatement = sortedStatements[indexOfId - 1];
  } else {
    previousStatement = sortedStatements[indexOfId - 1];
    nextStatement = sortedStatements[indexOfId + 1];
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

  const navigateToStatement = (checkingAccountStatement: CheckingAccountStatement) => {
    dispatch(loadTransactions(checkingAccountStatement.startDate, checkingAccountStatement.endDate, false, true))
      .then(() => {
        navigate(`/statements/checking-account/${checkingAccountStatement.id}`);
      });
  };

  return (
    <React.Fragment>
      <Box display="flex" justifyContent="space-between" mb={2} >
        <Button
          onClick={() => navigateToStatement(previousStatement!)}
          disabled={!previousStatement}
        >
          Previous Statement
        </Button>
        < Button
          onClick={() => navigateToStatement(nextStatement!)}
          disabled={!nextStatement}
        >
          Next Statement
        </Button>
      </Box>
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

