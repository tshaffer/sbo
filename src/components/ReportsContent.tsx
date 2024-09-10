import React from 'react';

import { Tabs, Tab, Box, Typography, Button } from '@mui/material';

import { ReportTypes, SidebarMenuButton } from '../types';

import DateRangeSpecifier from './DateRangeSpecifier';
import SpendingReportTable from './SpendingReportTable';
import ReportFiltersDialog from './ReportFiltersDialog';

export interface ReportsContentProps {
  activeTab: number;
}

const ReportsContent: React.FC<ReportsContentProps> = (props: ReportsContentProps) => {

  const [tabIndex, setTabIndex] = React.useState(props.activeTab);
  const [reportFiltersDialogOpen, setReportFiltersDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setTabIndex(props.activeTab);
  }, [props.activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleOpenReportFiltersDialog = () => {
    setReportFiltersDialogOpen(true);
  };

  const handleCloseReportFiltersDialog = () => {
    setReportFiltersDialogOpen(false);
  };

  const renderReportButtons = (tabIndex: number): JSX.Element => {
    return (
      <Box sx={{ mt: 3 }}>
        {tabIndex !== 2 &&
          <Button
            sx={{ marginRight: '8px' }}
            variant="contained"
            color="secondary"
            onClick={handleOpenReportFiltersDialog}
          >
            Filters
          </Button>
        }
      </Box>
    )
  }

  const renderReport = (tabIndex: number): JSX.Element => {
    switch (tabIndex) {
      case 0:
      default:
        return <SpendingReportTable />;
    }
  }

  return (
    <React.Fragment>
      <ReportFiltersDialog
        open={reportFiltersDialogOpen}
        onClose={handleCloseReportFiltersDialog}
      />
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5">{SidebarMenuButton.Reports}</Typography>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label={ReportTypes.Spending} />
        </Tabs>
        <Box sx={{ padding: '20px' }}>
          <Box>
            <DateRangeSpecifier />
            {renderReportButtons(tabIndex)}
            {renderReport(tabIndex)}
          </Box>
        </Box>
      </Box>
    </React.Fragment>

  );
};

export default ReportsContent;
