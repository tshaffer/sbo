import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useTypedSelector } from '../types';

import { CreditCardTransactionRowInStatementTableProperties } from '../types';
import { isNil } from 'lodash';
import { getCreditCardTransactionRowInStatementTableProperties } from '../selectors';
import OverrideTransactionCategoriesDialog from './OverrideTransactionCategoriesDialog';
import CreditCardStatementTransactionRow from './CreditCardStatementTransactionRow';
import { updateCategoryInTransactions } from '../controllers';

const CreditCardStatementTable: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  if (isNil(id)) {
    return null;
  }

  const dispatch = useDispatch();

  const [sortColumn, setSortColumn] = useState<string>('transactionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTransactionIds, setSelectedTransactionId] = useState<Set<string>>(new Set());
  const [showOverrideTransactionCategoriesDialog, setShowOverrideTransactionCategoriesDialog] = React.useState(false);

  const creditCardTransactionRows: CreditCardTransactionRowInStatementTableProperties[] = useTypedSelector(state => getCreditCardTransactionRowInStatementTableProperties(state, id!));

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

  return (
    <React.Fragment>
      <OverrideTransactionCategoriesDialog
        open={showOverrideTransactionCategoriesDialog}
        onClose={handleCloseOverrideTransactionCategoriesDialog}
        onSave={handleSaveOverrideTransactionCategories}
      />
      <Button
        onClick={() => handleOverrideTransactionCategories()}
        disabled={selectedTransactionIds.size === 0}
      >
        Override Selected
      </Button>
      <div className="credit-card-statement-grid-table-container">
        <div className="grid-table-header">
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell" onClick={() => handleSort('transactionDate')}>Date{renderSortIndicator('transactionDate')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('amount')}>Amount{renderSortIndicator('amount')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('description')}>Description{renderSortIndicator('description')}</div>
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell" onClick={() => handleSort('userDescription')}>User Description{renderSortIndicator('userDescription')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('categorizedTransactionName')}>Category{renderSortIndicator('categorizedTransactionName')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('category')}>Category from statement{renderSortIndicator('category')}</div>
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell" onClick={() => handleSort('categoryNameFromCategoryAssignmentRule')}>Category (rule){renderSortIndicator('categoryNameFromCategoryAssignmentRule')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('patternFromCategoryAssignmentRule')}>Pattern{renderSortIndicator('patternFromCategoryAssignmentRule')}</div>
          <div className="grid-table-cell" onClick={() => handleSort('categoryNameFromCategoryOverride')}>Category (override){renderSortIndicator('categoryNameFromCategoryOverride')}</div>
          <div className="grid-table-cell"></div>
        </div>
        <div className="grid-table-body">
          {sortedTransactions.map((creditCardTransaction: CreditCardTransactionRowInStatementTableProperties) => (
            <div className="grid-table-row" key={creditCardTransaction.id}>
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