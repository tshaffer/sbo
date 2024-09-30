import React, { useEffect } from 'react';

import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import { Tabs, Tab, Box, Typography, Button } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';

import { SidebarMenuButton } from '../../types';
import UploadStatementDialog from '../Dialogs/UploadStatementDialog';

const StatementsTablesContainer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showUploadStatementDialog, setShowUploadStatementDialog] = React.useState(false);

  const selectedTab = location.pathname.includes('checking-account') ? 'checking-account' : 'credit-card';

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'credit-card' | 'checking-account') => {
    navigate(`/statements/${newValue}`);
  };

  const handleCloseUploadStatementDialog = () => {
    setShowUploadStatementDialog(false);
  };

  useEffect(() => {
    if (location.pathname === '/statements') {
      navigate('/statements/credit-card');
    }
  }, [location, navigate]);

  return (
    <React.Fragment>
      <UploadStatementDialog
        open={showUploadStatementDialog}
        onClose={handleCloseUploadStatementDialog}
      />
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5">{SidebarMenuButton.Statements}</Typography>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Credit Card" value="credit-card" />
          <Tab label="Checking Account" value="checking-account" />
        </Tabs>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            startIcon={<UploadIcon />}
            onClick={() => setShowUploadStatementDialog(true)}
          >
            Upload
          </Button>
        </Box>
        <Outlet />
      </Box>
    </React.Fragment>
  );
};

export default StatementsTablesContainer;