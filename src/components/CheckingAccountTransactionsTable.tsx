import React from 'react';
import { useDispatch, useTypedSelector } from '../types';
import { useParams } from 'react-router-dom';
import { getCheckingAccountStatements, getCheckingAccountTransactionRowInStatementTableProperties } from '../selectors';
import { CheckingAccountStatement, CheckingAccountTransactionRowInStatementTableProperties } from '../types';
import { loadTransactions } from '../controllers';
import CheckingAccountStatementTransactionRow from './CheckingAccountStatementTransactionRow';
import TransactionsTable from './TransactionsTable';

const CheckingAccountTransactionsTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const statements = useTypedSelector(getCheckingAccountStatements);
  const transactions = useTypedSelector(state => getCheckingAccountTransactionRowInStatementTableProperties(state, id!));

  // find transactions where the transaction.categorizedTransactionName is 'ignore'
  // and set the transaction.categorizedTransactionName to ''


  // const transactionsToIgnore = transactions.filter(transaction => transaction.categorizedTransactionName.toLowerCase() === 'ignore');
  // debugger;

  const handleLoadTransactions = (startDate: string, endDate: string) => {
    return dispatch(loadTransactions(startDate, endDate, false, true));
  };

  return (
    <TransactionsTable
      statements={statements}
      transactions={transactions}
      onLoadTransactions={handleLoadTransactions}
      getTransactionId={(transaction: CheckingAccountTransactionRowInStatementTableProperties) => transaction.id}
      getStatementId={(statement: CheckingAccountStatement) => `checking-account/${statement.id}`}
      renderTransactionRow={(transaction, selectedTransactionIds, handleTransactionSelectedChanged) => (
        <CheckingAccountStatementTransactionRow
          checkingAccountTransaction={transaction.checkingAccountTransaction}
        />
      )}
      columnHeaders={['', 'Date', 'Amount', '', '', 'Description', 'Category', 'Comment', '']}
      columnKeys={['', 'transactionDate', 'amount', '', '', 'userDescription', 'categorizedTransactionName', 'comment', '']}
      tableContainerClassName="checking-account-statement-grid-table-container"
    />
  );
};

export default CheckingAccountTransactionsTable;