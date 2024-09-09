import React, { useEffect } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SidebarMenuButton } from '../types';

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
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5">{SidebarMenuButton.Statements}</Typography>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label="Credit Card" value="credit-card" />
        <Tab label="Checking Account" value="checking-account" />
      </Tabs>
      <Outlet />
    </Box>
  );
};

export default Statements;