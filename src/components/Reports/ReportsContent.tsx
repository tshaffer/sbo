import React from 'react';

import { Box, Typography } from '@mui/material';

import DateRangeSpecifier from './DateRangeSpecifier';
import SpendingReportTable from './SpendingReportTable';

const ReportsContent: React.FC = () => {
  return (
    <React.Fragment>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5">Spending Report</Typography>
        <Box sx={{ padding: '20px' }}>
          <Box>
            <DateRangeSpecifier />
            <SpendingReportTable />
          </Box>
        </Box>
      </Box>
    </React.Fragment>

  );
};

export default ReportsContent;
