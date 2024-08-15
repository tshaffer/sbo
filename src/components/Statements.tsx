import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import CreditCardStatementsTable from './CreditCardStatementsTable';
import CheckingAccountStatementsTable from './CheckingAccountStatementsTable';

const Statements: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'credit-card' | 'checking-account'>('credit-card');

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'credit-card' | 'checking-account') => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label="Credit Card" value="credit-card" />
        <Tab label="Checking Account" value="checking-account" />
      </Tabs>
      {selectedTab === 'credit-card' && <CreditCardStatementsTable />}
      {selectedTab === 'checking-account' && <CheckingAccountStatementsTable />}
    </div>
  );
};

export default Statements;
