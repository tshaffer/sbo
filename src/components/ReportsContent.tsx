import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Tabs, Tab, Box, Typography, Button } from '@mui/material';

import { TrackerDispatch, setGeneratedReportEndDate, setGeneratedReportStartDate } from '../models';
import { getStartDate, getEndDate, getDateRangeType, getReportStatement, getReportStatementId } from '../selectors';
import { loadTransactions } from '../controllers';

import DateRangeSpecifier from './DateRangeSpecifier';
import SpendingReportTable from './SpendingReportTable';
import UnIdentifiedTransactionTable from './UnidentifiedTransactionTable';
import FixedExpensesReport from './FixedExpensesReport';
import { DateRangeType, ReportTypes, SidebarMenuButton, Statement, StatementType } from '../types';
import { isNil } from 'lodash';
import ReportFiltersDialog from './ReportFiltersDialog';

export interface ReportsContentPropsFromParent {
  activeTab: number;
}

interface ReportsContentProps extends ReportsContentPropsFromParent {
  startDate: string,
  endDate: string,
  dateRangeType: DateRangeType,
  reportStatement: Statement | null,
  onLoadTransactions: (startDate: string, endDate: string, includeCreditCardTransactions: boolean, includeCheckingAccountTransactions: boolean) => any;
  onSetGeneratedReportStartDate: (date: string) => any;
  onSetGeneratedReportEndDate: (date: string) => any;
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

  const handleGenerateReport = () => {

    props.onSetGeneratedReportStartDate(props.startDate);
    props.onSetGeneratedReportEndDate(props.endDate);

    let includeCreditCardTransactions = true;
    let includeCheckingAccountTransactions = true;
    if (props.dateRangeType === DateRangeType.Statement) {
      if (!isNil(props.reportStatement)) {
        includeCreditCardTransactions = props.reportStatement.type === StatementType.CreditCard;
        includeCheckingAccountTransactions = props.reportStatement.type === StatementType.Checking;
      }
    }

    props.onLoadTransactions(props.startDate, props.endDate, includeCreditCardTransactions, includeCheckingAccountTransactions);
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

function mapStateToProps(state: any) {
  return {
    startDate: getStartDate(state),
    endDate: getEndDate(state),
    dateRangeType: getDateRangeType(state),
    reportStatement: getReportStatement(state, getReportStatementId(state)),
  };
}

const mapDispatchToProps = (dispatch: TrackerDispatch) => {
  return bindActionCreators({
    onLoadTransactions: loadTransactions,
    onSetGeneratedReportStartDate: setGeneratedReportStartDate,
    onSetGeneratedReportEndDate: setGeneratedReportEndDate,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportsContent);
