import React from 'react';

import { Tabs, Tab, Box, Typography, Button } from '@mui/material';

import { setGeneratedReportEndDate, setGeneratedReportStartDate } from '../models';
import { getStartDate, getEndDate, getDateRangeType, getReportStatement, getReportStatementId } from '../selectors';
import { loadTransactions } from '../controllers';

import DateRangeSpecifier from './DateRangeSpecifier';
import SpendingReportTable from './SpendingReportTable';
import UnIdentifiedTransactionTable from './UnidentifiedTransactionTable';
import FixedExpensesReport from './FixedExpensesReport';
import { DateRangeType, ReportTypes, SidebarMenuButton, StatementType } from '../types';
import { isNil } from 'lodash';
import ReportFiltersDialog from './ReportFiltersDialog';
import { useDispatch, useTypedSelector } from '../types';

export interface ReportsContentProps {
  activeTab: number;
}

const ReportsContent: React.FC<ReportsContentProps> = (props: ReportsContentProps) => {

  const dispatch = useDispatch();

  const startDate = useTypedSelector(state => getStartDate(state));
  const endDate = useTypedSelector(state => getEndDate(state));
  const dateRangeType = useTypedSelector(state => getDateRangeType(state));
  const reportStatement = useTypedSelector(state => getReportStatement(state, getReportStatementId(state)));

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

  const handleGenerateReport = () => {

    dispatch(setGeneratedReportStartDate(startDate));
    dispatch(setGeneratedReportEndDate(endDate));

    let includeCreditCardTransactions = true;
    let includeCheckingAccountTransactions = true;
    if (dateRangeType === DateRangeType.Statement) {
      if (!isNil(reportStatement)) {
        includeCreditCardTransactions = reportStatement.type === StatementType.CreditCard;
        includeCheckingAccountTransactions = reportStatement.type === StatementType.Checking;
      }
    }

    dispatch(loadTransactions(startDate, endDate, includeCreditCardTransactions, includeCheckingAccountTransactions));
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
        <Button variant="contained" color="primary" onClick={handleGenerateReport}>
          Generate Report
        </Button>
      </Box>
    )
  }

  const renderReport = (tabIndex: number): JSX.Element => {
    switch (tabIndex) {
      case 0:
      default:
        return <SpendingReportTable />;
      case 1:
        return <FixedExpensesReport />;
      case 2:
        return <UnIdentifiedTransactionTable />;
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
          <Tab label={ReportTypes.FixedExpenses} />
          <Tab label={ReportTypes.UnidentifiedTransactions} />
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
