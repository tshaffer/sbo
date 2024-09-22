import React, { useState } from 'react';
import { getCategoryById, getTransactionsByCategory } from '../selectors';
import { CategorizedTransaction, Category, StringToTransactionsLUT, useTypedSelector } from '../types';

import '../styles/Tracker.css';

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
        <div className="dtc-details-table-row">
          <div className="dtc-fixed-width-base-table-cell dtc-details-table-cell-date" style={{ marginLeft: '36px' }}>{transaction.bankTransaction.transactionDate}</div>
          <div className="dtc-fixed-width-base-table-cell dtc-details-table-cell-amount">{transaction.bankTransaction.amount}</div>
          <div className="dtc-fixed-width-base-table-cell dtc-details-table-cell-description">{transaction.bankTransaction.userDescription}</div>
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
    <div className="dtc-details-table-container">
      <div className="dtc-details-table-header">
        <div className="dtc-details-table-row">
          <div className="dtc-fixed-width-base-table-cell dtc-details-table-cell-date" style={{ marginLeft: '36px' }} onClick={() => handleSortTransactions('transactionDate')}>Date{renderSortTransactionsIndicator('transactionDate')}</div>
          <div className="dtc-fixed-width-base-table-cell dtc-details-table-cell-amount" onClick={() => handleSortTransactions('amount')}>Amount{renderSortTransactionsIndicator('amount')}</div>
          <div className="dtc-fixed-width-base-table-cell dtc-details-table-cell-description" onClick={() => handleSortTransactions('userDescription')}>Description{renderSortTransactionsIndicator('userDescription')}</div>
        </div>
      </div>
      <div className="dtc-table-body">
        {renderTransactions()}
      </div>
    </div>
  );
}

export default TransactionsList;
