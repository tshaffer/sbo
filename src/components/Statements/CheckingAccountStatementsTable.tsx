import React from 'react';
import { CheckingAccountStatement, useTypedSelector } from '../../types';
import { getCheckingAccountStatements } from '../../selectors';
import BaseStatementsTable from './BaseStatementsTable';

const CheckingAccountStatementsTable: React.FC = () => {
  const statements: CheckingAccountStatement[] = useTypedSelector(getCheckingAccountStatements);
  return (
    <BaseStatementsTable
      statements={statements}
      navigateBasePath="/statements/checking-account"  // Set the base path for checking account statements
      gridTemplateColumns="40px 1fr 1fr 1fr 1fr 1fr 1fr"
      additionalColumnHeaders={['# of Checks', '# of ATM Withdrawals']}
      additionalColumns={(statement) => [
        <span key="checkCount">{statement.checkCount}</span>,
        <span key="atmWithdrawalCount">{statement.atmWithdrawalCount}</span>,
      ]}
    />
  );
};

export { CheckingAccountStatementsTable };
