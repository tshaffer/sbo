import React from 'react';
import { useTypedSelector } from '../types';
import { getCreditCardStatements, getCheckingAccountStatements } from '../selectors';
import { loadTransactions } from '../controllers/transactions';
import StatementsTable from './StatementsTable';

const CreditCardStatementsTable: React.FC = () => {

  const statements = useTypedSelector(getCreditCardStatements);
  
  return (
    <StatementsTable
      statements={statements}
      onLoadTransactions={(startDate, endDate) => loadTransactions(startDate, endDate, true, false)}
      gridTemplateColumns="40px 1fr 1fr 1fr 1fr 1fr"
    />
  );
};

const CheckingAccountStatementsTable: React.FC = () => {
  const statements = useTypedSelector(getCheckingAccountStatements);
  return (
    <StatementsTable
      statements={statements}
      onLoadTransactions={(startDate, endDate) => loadTransactions(startDate, endDate, false, true)}
      gridTemplateColumns="40px 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
      additionalColumns={(statement) => [
        <span key="checkCount">{statement.checkCount}</span>,
        <span key="atmWithdrawalCount">{statement.atmWithdrawalCount}</span>,
      ]}
    />
  );
};

export { CreditCardStatementsTable, CheckingAccountStatementsTable };
