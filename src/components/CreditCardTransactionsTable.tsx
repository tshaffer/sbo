import React from 'react';
import { useDispatch, useTypedSelector } from '../types';
import { useParams } from 'react-router-dom';
import { getCreditCardStatements, getCreditCardTransactionRowInStatementTableProperties } from '../selectors';
import { CreditCardStatement, CreditCardTransactionRowInStatementTableProperties } from '../types';
import { loadTransactions, updateCategoryInTransactions } from '../controllers';
import CreditCardStatementTransactionRow from './CreditCardStatementTransactionRow';
import TransactionsTable from './TransactionsTable';

const CreditCardTransactionsTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const statements = useTypedSelector(getCreditCardStatements);
  const transactions = useTypedSelector(state => getCreditCardTransactionRowInStatementTableProperties(state, id!));

  const handleLoadTransactions = (startDate: string, endDate: string) => {
    return dispatch(loadTransactions(startDate, endDate, true, false));
  };

  const handleOverrideTransactionCategories = (selectedTransactionIds: Set<string>) => {
    dispatch(updateCategoryInTransactions(
      'someCategoryId', // Replace with the actual category ID
      Array.from(selectedTransactionIds)
    ));
  };

  return (
    <TransactionsTable
      statements={statements}
      transactions={transactions}
      onLoadTransactions={handleLoadTransactions}
      onOverrideTransactionCategories={handleOverrideTransactionCategories}
      getTransactionId={(transaction: CreditCardTransactionRowInStatementTableProperties) => transaction.id}
      getStatementId={(statement: CreditCardStatement) => `credit-card/${statement.id}`}
      renderTransactionRow={(transaction, selectedTransactionIds, handleTransactionSelectedChanged) => (
        <CreditCardStatementTransactionRow
          creditCardTransactionId={transaction.id}
          transactionSelected={selectedTransactionIds.has(transaction.id)}
          onTransactionSelectedChanged={handleTransactionSelectedChanged}
        />
      )}
      columnHeaders={['Date', 'Amount', '', '', 'Description', 'Category', 'Comment']}
      columnKeys={['transactionDate', 'amount', '', '', 'userDescription', 'categorizedTransactionName', 'comment']}
    />
  );
};

export default CreditCardTransactionsTable;
