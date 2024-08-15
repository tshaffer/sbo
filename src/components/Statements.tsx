import React, { useEffect } from 'react';
import { Tabs, Tab } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const Statements: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedTab = location.pathname.includes('checking-account') ? 'checking-account' : 'credit-card';

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'credit-card' | 'checking-account') => {
    navigate(`/statements/${newValue}`);
  };

  useEffect(() => {
    if (location.pathname === '/statements') {
      navigate('/statements/credit-card');
    }
  }, [location, navigate]);

  return (
    <div>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label="Credit Card" value="credit-card" />
        <Tab label="Checking Account" value="checking-account" />
      </Tabs>
      <Outlet />
    </div>
  );
};

export default Statements;