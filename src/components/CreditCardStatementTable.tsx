import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useTypedSelector } from '../types';

import { CreditCardTransactionRowInStatementTableProperties } from '../types';
import { isNil } from 'lodash';
import { updateCategoryInTransactions } from '../models/slices/transactionsSlice';
import { getCreditCardTransactionRowInStatementTableProperties, getTransactionsByStatementId } from '../selectors';
import OverrideTransactionCategoriesDialog from './OverrideTransactionCategoriesDialog';
import CreditCardStatementTransactionRow from './CreditCardStatementTransactionRow';

const CreditCardStatementDetails: React.FC = () => {

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
    dispatch(updateCategoryInTransactions({
      categoryId,
      transactionIds: Array.from(selectedTransactionIds)
    }));
  };

  const handleCloseOverrideTransactionCategoriesDialog = () => {
    setShowOverrideTransactionCategoriesDialog(false);
  }

  function handleSetCreditCardTransactionSelected(transactionId: string, selected: boolean): any {
    const newSelectedTransactionIds = new Set(selectedTransactionIds);
    if (selected) {
      newSelectedTransactionIds.add(transactionId);
    } else {
      newSelectedTransactionIds.delete(transactionId);
    }
    setSelectedTransactionId(newSelectedTransactionIds);
  }

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
        </div>
        <div className="grid-table-body">
          {sortedTransactions.map((creditCardTransaction: CreditCardTransactionRowInStatementTableProperties) => (
            <div className="grid-table-row" key={creditCardTransaction.id}>
              <CreditCardStatementTransactionRow
                creditCardTransactionId={creditCardTransaction.id}
                onSetCreditCardTransactionSelected={(transactionId: string, selected: boolean) => handleSetCreditCardTransactionSelected(transactionId, selected)}
              />
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default CreditCardStatementDetails;