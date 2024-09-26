import React, { useState } from 'react';
import { getCategoryById, getTransactionsByCategory } from '../selectors';
import { CategorizedTransaction, Category, StringToTransactionsLUT, useTypedSelector } from '../types';

import '../styles/Tracker.css';
import { formatCurrency, formatDate } from '../utilities';

interface TransactionsListProps {
  categoryId: string;
}

const TransactionsList: React.FC<TransactionsListProps> = (props: TransactionsListProps) => {

  const category: Category = useTypedSelector(state => getCategoryById(state, props.categoryId)!);
  const transactionsByCategoryId: StringToTransactionsLUT = useTypedSelector(state => getTransactionsByCategory(state));

  const [transactionsSortColumn, setTransactionsSortColumn] = useState<string>('transactionDate');
  const [transactionsSortOrder, setTransactionsSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSortTransactions = (column: string) => {
    if (transactionsSortColumn === column) {
      setTransactionsSortOrder(transactionsSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTransactionsSortColumn(column);
      setTransactionsSortOrder('asc');
    }
  };

  const renderSortTransactionsIndicator = (column: string) => {
    if (transactionsSortColumn !== column) return null;
    return transactionsSortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const renderTransaction = (transaction: CategorizedTransaction): JSX.Element => {
    return (
      <React.Fragment>
        <div className="tbc-details-table-row">
          <div className="tbc-fixed-width-base-table-cell tbc-details-table-cell-date" style={{ marginLeft: '36px' }}>{formatDate(transaction.bankTransaction.transactionDate)}</div>
          <div className="tbc-fixed-width-base-table-cell tbc-details-table-cell-amount">{formatCurrency(transaction.bankTransaction.amount)}</div>
          <div className="tbc-fixed-width-base-table-cell tbc-details-table-cell-description">{transaction.bankTransaction.userDescription}</div>
        </div>
      </React.Fragment>
    );
  }

  const renderTransactions = (): JSX.Element[] => {
    const categorizedTransactions: CategorizedTransaction[] = transactionsByCategoryId[props.categoryId];
    const transactionsJSX: JSX.Element[] = categorizedTransactions.map((transaction: CategorizedTransaction) => {
      return renderTransaction(transaction);
    });
    return transactionsJSX;
  }

  return (
    <div className="tbc-details-table-container">
      <div className="tbc-details-table-header">
        <div className="tbc-details-table-row">
          <div className="tbc-fixed-width-base-table-cell tbc-details-table-cell-date" style={{ marginLeft: '36px' }} onClick={() => handleSortTransactions('transactionDate')}>Date{renderSortTransactionsIndicator('transactionDate')}</div>
          <div className="tbc-fixed-width-base-table-cell tbc-details-table-cell-amount" onClick={() => handleSortTransactions('amount')}>Amount{renderSortTransactionsIndicator('amount')}</div>
          <div className="tbc-fixed-width-base-table-cell tbc-details-table-cell-description" onClick={() => handleSortTransactions('userDescription')}>Description{renderSortTransactionsIndicator('userDescription')}</div>
        </div>
      </div>
      <div className="tbc-table-body">
        {renderTransactions()}
      </div>
    </div>
  );
}

export default TransactionsList;
