import React from 'react';
import { Box, FormControl, RadioGroup, FormControlLabel, Radio, MenuItem, Select, InputLabel, SelectChangeEvent } from '@mui/material';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TrackerDispatch, setEndDate, setDateRangeType, setStartDate, setReportStatementId } from '../models';
import { getStartDate, getEndDate, getDateRangeType, getMinMaxTransactionDates, getCheckingAccountStatements, getCreditCardStatements, getReportStatementId } from '../selectors';
import { CheckingAccountStatement, CreditCardStatement, DateRangeType, MinMaxDates, StatementType } from '../types';
import dayjs, { Dayjs } from 'dayjs';
import { isNil } from 'lodash';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { formatDate, getCurrentDate, getISODateString, getRetirementDate } from '../utilities';

interface DateRangeSpecifierProps {
  dateRangeType: DateRangeType;
  startDate: string,
  endDate: string,
  statementId: string,
  minMaxTransactionDates: MinMaxDates,
  creditCardStatements: CreditCardStatement[],
  checkingAccountStatements: CheckingAccountStatement[],
  onSetDateRangeType: (dateRangeType: DateRangeType) => any;
  onSetStartDate: (startDate: string) => any;
  onSetEndDate: (endDate: string) => any;
  onSetReportStatementId: (statementId: string) => any;
}

const DateRangeSpecifier: React.FC<DateRangeSpecifierProps> = (props: DateRangeSpecifierProps) => {

  React.useEffect(() => {
    props.onSetStartDate(getStartDate(props.dateRangeType));
    props.onSetEndDate(getEndDate(props.dateRangeType));
  }, []);

  const getFirstDayOfCurrentYear = (): string => {
    const now = new Date();
    const firstDayOfCurrentYear = new Date(now.getFullYear(), 0, 1);
    return getISODateString(firstDayOfCurrentYear);
  };

  const getFirstDayOfLastYear = (): string => {
    const now = new Date();
    const firstDayOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    return getISODateString(firstDayOfLastYear);
  };

  const getLastDayOfLastYear = (): string => {
    const now = new Date();
    const lastDayOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
    return getISODateString(lastDayOfLastYear);
  };

  const getStartDate = (dateRangeType: DateRangeType): string => {
    switch (dateRangeType) {
      case DateRangeType.All:
        return props.minMaxTransactionDates.minDate;
      case DateRangeType.YearToDate:
        return getFirstDayOfCurrentYear();
      case DateRangeType.LastYear:
        return getFirstDayOfLastYear();
      case DateRangeType.SinceRetirement:
        return getRetirementDate();
      default:
        return props.startDate;
    }
  }

  const getEndDate = (dateRangeType: DateRangeType): string => {
    switch (dateRangeType) {
      case DateRangeType.All:
        return props.minMaxTransactionDates.maxDate;
      case DateRangeType.YearToDate:
      case DateRangeType.SinceRetirement:
        return getCurrentDate();
      case DateRangeType.LastYear:
        return getLastDayOfLastYear();
      default:
        return props.endDate;
    }
  }

  const handleDateOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDateRangeType = event.target.value as DateRangeType;
    props.onSetDateRangeType(newDateRangeType);
    const newStartDate = getStartDate(newDateRangeType);
    const newEndDate = getEndDate(newDateRangeType);
    props.onSetStartDate(newStartDate);
    props.onSetEndDate(newEndDate);
  }

  const handleSetStartDate = (dateDayJs: Dayjs | null) => {
    if (!isNil(dateDayJs)) {
      const date: Date = dateDayJs.toDate();
      props.onSetStartDate(date.toISOString());
    }
  };

  const handleSetEndDate = (dateDayJs: Dayjs | null) => {
    if (!isNil(dateDayJs)) {
      const date: Date = dateDayJs.toDate();
      props.onSetEndDate(date.toISOString());
    }
  };

  const handleStatementChange = (event: SelectChangeEvent<string>) => {
    props.onSetReportStatementId(event.target.value);
    const statementId = event.target.value;
    const statement = props.creditCardStatements.find((statement: CreditCardStatement) => statement.id === statementId) || props.checkingAccountStatements.find((statement: CheckingAccountStatement) => statement.id === statementId); 
    if (statement) {
      props.onSetStartDate(statement.startDate);
      props.onSetEndDate(statement.endDate);
    }
  };

  const renderStartDate = (): JSX.Element => {
    return (
      <React.Fragment>
        <FormControl style={{ marginLeft: '6px', display: 'block' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                label="Start date"
                value={dayjs(props.startDate)}
                onChange={(newValue) => handleSetStartDate(newValue)}
                disabled={props.dateRangeType !== DateRangeType.DateRange}
              />
            </DemoContainer>
          </LocalizationProvider>
        </FormControl>
      </React.Fragment>
    );
  };

  const renderEndDate = (): JSX.Element => {
    return (
      <React.Fragment>
        <FormControl style={{ marginLeft: '6px', display: 'block' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                label="End date"
                value={dayjs(props.endDate)}
                onChange={(newValue) => handleSetEndDate(newValue)}
                disabled={props.dateRangeType !== DateRangeType.DateRange}
              />
            </DemoContainer>
          </LocalizationProvider>
        </FormControl>
      </React.Fragment>
    );
  };

  const renderStatementSelect = (): JSX.Element => {
    if (props.dateRangeType !== DateRangeType.Statement) {
      return <React.Fragment />;
    }
    const combinedStatements = props.creditCardStatements.concat(props.checkingAccountStatements);
    const sortedStatements = combinedStatements.sort((a, b) => {
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateB.getTime() - dateA.getTime(); // Sort in descending order
    });

    return (
      <FormControl sx={{ ml: 2, minWidth: 120 }}>
        <InputLabel id="statement-select-label">Statement</InputLabel>
        <Select
          labelId="statement-select-label"
          id="statement-select"
          value={props.statementId}
          onChange={handleStatementChange}
          label="Statement"
        >
          {sortedStatements.map((statement, index) => {
            return (
              <MenuItem key={statement.id} value={statement.id}>{(statement.type === StatementType.CreditCard ? 'Chase: ' : 'US Bank: ') + formatDate(statement.endDate)}</MenuItem>
            );
          })}
        </Select>
      </FormControl>

    );
  }
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl component="fieldset">
          <RadioGroup row value={props.dateRangeType} onChange={handleDateOptionChange}>
            <FormControlLabel value={DateRangeType.SinceRetirement} control={<Radio />} label="Since Retirement" sx={{ maxHeight: '32px' }} />
            <FormControlLabel value={DateRangeType.All} control={<Radio />} label="All Dates" sx={{ maxHeight: '32px' }} />
            <FormControlLabel value={DateRangeType.YearToDate} control={<Radio />} label="Year to Date" sx={{ maxHeight: '32px' }} />
            <FormControlLabel value={DateRangeType.LastYear} control={<Radio />} label="Last Year" sx={{ maxHeight: '32px' }} />
            <FormControlLabel value={DateRangeType.DateRange} control={<Radio />} label="Date Range" sx={{ maxHeight: '32px' }} />
            <FormControlLabel value={DateRangeType.Statement} control={<Radio />} label="From Statement" sx={{ maxHeight: '32px' }} />
          </RadioGroup>
        </FormControl>
        {renderStatementSelect()}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        {renderStartDate()}
        {renderEndDate()}
      </Box>
    </Box>
  );
};

function mapStateToProps(state: any) {
  return {
    dateRangeType: getDateRangeType(state),
    startDate: getStartDate(state),
    endDate: getEndDate(state),
    statementId: getReportStatementId(state),
    minMaxTransactionDates: getMinMaxTransactionDates(state),
    creditCardStatements: getCreditCardStatements(state),
    checkingAccountStatements: getCheckingAccountStatements(state),
  };
}

const mapDispatchToProps = (dispatch: TrackerDispatch) => {
  return bindActionCreators({
    onSetDateRangeType: setDateRangeType,
    onSetStartDate: setStartDate,
    onSetEndDate: setEndDate,
    onSetReportStatementId: setReportStatementId,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(DateRangeSpecifier);
