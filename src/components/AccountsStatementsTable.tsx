import React from 'react';
import { CheckingAccountStatement, Statement, useTypedSelector } from '../types';
import { getCreditCardStatements, getCheckingAccountStatements } from '../selectors';
import { loadTransactions } from '../controllers/transactions';
import StatementsTable from './StatementsTable';

const CreditCardStatementsTable: React.FC = () => {
  const statements: Statement[] = useTypedSelector(getCreditCardStatements); 
  return (
    <StatementsTable
      statements={statements}
      onLoadTransactions={(startDate, endDate) => loadTransactions(startDate, endDate, true, false)}
      navigateBasePath="/statements/credit-card"  // Set the base path for credit card statements
      gridTemplateColumns="40px 1fr 1fr 1fr 1fr 1fr"
    />
  );
};

const CheckingAccountStatementsTable: React.FC = () => {
  const statements: CheckingAccountStatement[] = useTypedSelector(getCheckingAccountStatements);
  return (
    <StatementsTable
      statements={statements}
      onLoadTransactions={(startDate, endDate) => loadTransactions(startDate, endDate, false, true)}
      navigateBasePath="/statements/checking-account"  // Set the base path for checking account statements
      gridTemplateColumns="40px 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
      additionalColumnHeaders={['# of Checks', '# of ATM Withdrawals']}
      additionalColumns={(statement) => [
        <span key="checkCount">{statement.checkCount}</span>,
        <span key="atmWithdrawalCount">{statement.atmWithdrawalCount}</span>,
      ]}
    />
  );
};

export { CreditCardStatementsTable, CheckingAccountStatementsTable };
