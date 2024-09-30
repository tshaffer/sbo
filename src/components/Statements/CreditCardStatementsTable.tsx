import React from 'react';
import { Statement, useTypedSelector } from '../../types';
import { getCreditCardStatements } from '../../selectors';
import BaseStatementsTable from './BaseStatementsTable';

const CreditCardStatementsTable: React.FC = () => {
  const statements: Statement[] = useTypedSelector(getCreditCardStatements);
  return (
    <BaseStatementsTable
      statements={statements}
      navigateBasePath="/statements/credit-card"  // Set the base path for credit card statements
      gridTemplateColumns="40px 1fr 1fr 1fr 1fr"
    />
  );
};

export { CreditCardStatementsTable };
