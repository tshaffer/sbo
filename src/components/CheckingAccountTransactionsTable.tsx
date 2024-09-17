import React from 'react';
import { useTypedSelector } from '../types';
import { useParams } from 'react-router-dom';
import { getCheckingAccountStatements, getCheckingAccountTransactionRowInStatementTableProperties } from '../selectors';
import { CheckingAccountStatement, CheckingAccountTransactionRowInStatementTableProperties } from '../types';
import CheckingAccountStatementTransactionRow from './CheckingAccountStatementTransactionRow';
import TransactionsTable from './TransactionsTable';

const CheckingAccountTransactionsTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const statements: CheckingAccountStatement[] = useTypedSelector(getCheckingAccountStatements);
  const transactions: CheckingAccountTransactionRowInStatementTableProperties[] = useTypedSelector(state => getCheckingAccountTransactionRowInStatementTableProperties(state, id!));

  return (
    <TransactionsTable
      statements={statements}
      transactions={transactions}
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