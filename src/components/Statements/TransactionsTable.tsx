import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import { Statement } from '../../types';

interface TransactionsTableProps<T> {
  statements: T[];
  transactions: any[];
  onOverrideTransactionCategories?: (selectedTransactionIds: Set<string>) => void;
  getTransactionId: (transaction: any) => string;
  getStatementId: (statement: T) => string;
  renderTransactionRow: (transaction: any, selectedTransactionIds: Set<string>, handleTransactionSelectedChanged: (event: React.ChangeEvent<HTMLInputElement>, transactionId: string, checked: boolean) => void) => React.ReactNode;
  columnHeaders: string[];
  columnKeys: string[];
  tableContainerClassName: string;
}

const TransactionsTable = <T extends Statement,>({
  statements,
  transactions,
  onOverrideTransactionCategories,
  getTransactionId,
  getStatementId,
  renderTransactionRow,
  columnHeaders,
  columnKeys,
  tableContainerClassName,
}: TransactionsTableProps<T>) => {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<string>(columnKeys[1]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());

  // Determine the current statement and its index
  const { id } = useParams<{ id: string }>();
  const sortedStatements = cloneDeep(statements).sort((a, b) => b.endDate.localeCompare(a.endDate));

  const currentIndex: number = sortedStatements.findIndex(statement => statement.id === id);
  const previousStatement = sortedStatements[currentIndex + 1];
  const nextStatement = sortedStatements[currentIndex - 1];

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const handleTransactionSelectedChanged = (event: React.ChangeEvent<HTMLInputElement>, transactionId: string, checked: boolean) => {
    const newSelectedTransactionIds = new Set(selectedTransactionIds);

    if (checked) {
      newSelectedTransactionIds.add(transactionId);
    } else {
      newSelectedTransactionIds.delete(transactionId);
    }

    setSelectedTransactionIds(newSelectedTransactionIds);
  };

  const navigateToStatement = (statement: T | undefined) => {
    if (statement) {
      navigate(`/statements/${getStatementId(statement)}`);
    }
  };

  return (
    <React.Fragment>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button
          onClick={() => navigateToStatement(previousStatement)}
          disabled={!previousStatement}
        >
          Previous Statement
        </Button>
        <Button
          onClick={() => navigateToStatement(nextStatement)}
          disabled={!nextStatement}
        >
          Next Statement
        </Button>
      </Box>
      {onOverrideTransactionCategories && (
        <Button
          onClick={() => onOverrideTransactionCategories(selectedTransactionIds)}
          disabled={selectedTransactionIds.size === 0}
        >
          Override Selected
        </Button>
      )}
      <div className={tableContainerClassName}>
        <div className="grid-table-header">
          {columnHeaders.map((header, index) => (
            <div
              key={index}
              className="grid-table-cell"
              onClick={() => handleSort(columnKeys[index])}
            >
              {header}{sortColumn === columnKeys[index] ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
            </div>
          ))}
        </div>
        <div className="grid-table-body">
          {sortedTransactions.map(transaction => (
            <div className="grid-table-row" key={getTransactionId(transaction)}>
              {renderTransactionRow(transaction, selectedTransactionIds, handleTransactionSelectedChanged)}
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default TransactionsTable;
