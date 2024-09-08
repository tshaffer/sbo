import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import '../styles/Grid.css';

import { cloneDeep } from 'lodash';

import { Box, Button } from '@mui/material';

import { useDispatch } from '../types';
import { useTypedSelector } from '../types';

import { CreditCardStatement, CreditCardTransactionRowInStatementTableProperties } from '../types';
import { loadTransactions, updateCategoryInTransactions } from '../controllers';
import { getCreditCardStatements, getCreditCardTransactionRowInStatementTableProperties } from '../selectors';

import CreditCardStatementTransactionRow from './CreditCardStatementTransactionRow';
import OverrideTransactionCategoriesDialog from './OverrideTransactionCategoriesDialog';

const CreditCardStatementTable: React.FC = (): any => {

  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sortColumn, setSortColumn] = useState<string>('transactionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTransactionIds, setSelectedTransactionId] = useState<Set<string>>(new Set());
  const [showOverrideTransactionCategoriesDialog, setShowOverrideTransactionCategoriesDialog] = React.useState(false);

  const creditCardTransactionRows: CreditCardTransactionRowInStatementTableProperties[] = useTypedSelector(state => getCreditCardTransactionRowInStatementTableProperties(state, id!));

  const statements: CreditCardStatement[] = useTypedSelector(state => getCreditCardStatements(state));
  let sortedStatements = cloneDeep(statements);
  sortedStatements = sortedStatements.sort((a, b) => b.endDate.localeCompare(a.endDate));

  function findStatementIndexById(statements: CreditCardStatement[], id: string): number {
    return statements.findIndex(statement => statement.id === id);
  }

  const indexOfId: number = findStatementIndexById(sortedStatements, id!);
  if (indexOfId === -1) {
    throw new Error(`Statement with id ${id} not found`);
  }

  let nextStatement: CreditCardStatement | undefined = undefined;
  let previousStatement: CreditCardStatement | undefined = undefined;

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

  const handleOverrideTransactionCategories = () => {
    setShowOverrideTransactionCategoriesDialog(true);
  };

  const handleSaveOverrideTransactionCategories = (categoryId: string) => {
    dispatch(updateCategoryInTransactions(
      categoryId,
      Array.from(selectedTransactionIds),
    ));
  };

  const handleCloseOverrideTransactionCategoriesDialog = () => {
    setShowOverrideTransactionCategoriesDialog(false);
  }

  const lastSelectedIndexRef = React.useRef<number | null>(null);

  const sortedTransactions = [...(creditCardTransactionRows)].sort((a: any, b: any) => {
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

  function handleTransactionSelectedChanged(event: React.ChangeEvent<HTMLInputElement>, transactionId: string, checked: boolean): void {
    const currentIndex = sortedTransactions.findIndex(transaction => transaction.id === transactionId);
    const isShiftPressed = (event.nativeEvent as MouseEvent).shiftKey;
    const newSelectedTransactionIds = new Set(selectedTransactionIds);

    if (isShiftPressed && lastSelectedIndexRef.current !== null) {
      const [start, end] = [Math.min(currentIndex, lastSelectedIndexRef.current), Math.max(currentIndex, lastSelectedIndexRef.current)];

      for (let i = start; i <= end; i++) {
        if (checked) {
          newSelectedTransactionIds.add(sortedTransactions[i].id);
        } else {
          newSelectedTransactionIds.delete(sortedTransactions[i].id);
        }
      }
    } else {
      if (checked) {
        newSelectedTransactionIds.add(transactionId);
      } else {
        newSelectedTransactionIds.delete(transactionId);
      }
      lastSelectedIndexRef.current = currentIndex;
    }

    setSelectedTransactionId(newSelectedTransactionIds);
  }

  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const navigateToStatement = (creditCardStatement: CreditCardStatement) => {
    dispatch(loadTransactions(creditCardStatement.startDate, creditCardStatement.endDate, true, false))
      .then(() => {
        navigate(`/statements/credit-card/${creditCardStatement.id}`);
      });
  };

  return (
    <React.Fragment>
      <OverrideTransactionCategoriesDialog
        open={showOverrideTransactionCategoriesDialog}
        onClose={handleCloseOverrideTransactionCategoriesDialog}
        onSave={handleSaveOverrideTransactionCategories}
      />
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
      < Button
        onClick={() => handleOverrideTransactionCategories()}
        disabled={selectedTransactionIds.size === 0}
      >
        Override Selected
      </Button>
      <div className="credit-card-statement-grid-table-container">
        <div className="credit-card-statement-grid-table-header">
          <div className="credit-card-statement-grid-table-cell"></div>
          <div className="credit-card-statement-grid-table-cell" onClick={() => handleSort('transactionDate')}>Date{renderSortIndicator('transactionDate')}</div>
          <div className="credit-card-statement-grid-table-cell" onClick={() => handleSort('amount')}>Amount{renderSortIndicator('amount')}</div>
          <div className="credit-card-statement-grid-table-cell"></div>
          <div className="credit-card-statement-grid-table-cell"></div>
          <div className="credit-card-statement-grid-table-cell" onClick={() => handleSort('userDescription')}>Description{renderSortIndicator('userDescription')}</div>
          <div className="credit-card-statement-grid-table-cell" onClick={() => handleSort('categorizedTransactionName')}>Category{renderSortIndicator('categorizedTransactionName')}</div>
          <div className="credit-card-statement-grid-table-cell" onClick={() => handleSort('comment')}>Comment{renderSortIndicator('comment')}</div>
          <div className="credit-card-statement-grid-table-cell"></div>
        </div>
        <div className="credit-card-statement-grid-table-body">
          {sortedTransactions.map((creditCardTransaction: CreditCardTransactionRowInStatementTableProperties) => (
            <div className="credit-card-statement-grid-table-row" key={creditCardTransaction.id}>
              <CreditCardStatementTransactionRow
                creditCardTransactionId={creditCardTransaction.id}
                transactionSelected={selectedTransactionIds.has(creditCardTransaction.id)}
                onTransactionSelectedChanged={(event: React.ChangeEvent<HTMLInputElement>, transactionId: string, selected: boolean) => handleTransactionSelectedChanged(event, transactionId, selected)}
              />
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default CreditCardStatementTable;