import React from 'react';
import { Box, FormControl, RadioGroup, FormControlLabel, Radio, MenuItem, Select, InputLabel, SelectChangeEvent } from '@mui/material';
import { setEndDate, setDateRangeType, setStartDate, setReportStatementId } from '../models';
import { getStartDate, getEndDate, getDateRangeType, getMinMaxTransactionDates, getCheckingAccountStatements, getCreditCardStatements, getReportStatementId } from '../selectors';
import { CheckingAccountStatement, CreditCardStatement, DateRangeType, StatementType } from '../types';
import dayjs, { Dayjs } from 'dayjs';
import { isNil } from 'lodash';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { formatDate, getCurrentDate, getFirstDayOfCurrentYear, getISODateString, getRetirementDate } from '../utilities';

import { useDispatch, useTypedSelector } from '../types';

const DateRangeSpecifier: React.FC = () => {

  const dispatch = useDispatch();

  const dateRangeType = useTypedSelector(state => getDateRangeType(state));
  const startDate: string = useTypedSelector(state => getStartDate(state));
  const endDate = useTypedSelector(state => getEndDate(state));
  const statementId = useTypedSelector(state => getReportStatementId(state));
  const minMaxTransactionDates = useTypedSelector(state => getMinMaxTransactionDates(state));
  const creditCardStatements = useTypedSelector(state => getCreditCardStatements(state));
  const checkingAccountStatements = useTypedSelector(state => getCheckingAccountStatements(state));

  React.useEffect(() => {
    dispatch(setStartDate(getStartDateFromDateRangeType(dateRangeType)));
    dispatch(setEndDate(getEndDateFromDateRangeType(dateRangeType)));
  }, []);

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

  const getStartDateFromDateRangeType = (dateRangeType: DateRangeType): string => {
    switch (dateRangeType) {
      case DateRangeType.All:
        return minMaxTransactionDates.minDate;
      case DateRangeType.YearToDate:
        return getFirstDayOfCurrentYear();
      case DateRangeType.LastYear:
        return getFirstDayOfLastYear();
      case DateRangeType.SinceRetirement:
        return getRetirementDate();
      default:
        return startDate;
    }
  }

  const getEndDateFromDateRangeType = (dateRangeType: DateRangeType): string => {
    switch (dateRangeType) {
      case DateRangeType.All:
        return minMaxTransactionDates.maxDate;
      case DateRangeType.YearToDate:
      case DateRangeType.SinceRetirement:
        return getCurrentDate();
      case DateRangeType.LastYear:
        return getLastDayOfLastYear();
      default:
        return endDate;
    }
  }

  const handleDateOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDateRangeType = event.target.value as DateRangeType;
    dispatch(setDateRangeType(newDateRangeType));
    const newStartDate = getStartDateFromDateRangeType(newDateRangeType);
    const newEndDate = getEndDateFromDateRangeType(newDateRangeType);
    dispatch(setStartDate(newStartDate));
    dispatch(setEndDate(newEndDate));
  }

  const handleSetStartDate = (dateDayJs: Dayjs | null) => {
    if (!isNil(dateDayJs)) {
      const date: Date = dateDayJs.toDate();
      dispatch(setStartDate(date.toISOString()));
    }
  };

  const handleSetEndDate = (dateDayJs: Dayjs | null) => {
    if (!isNil(dateDayJs)) {
      const date: Date = dateDayJs.toDate();
      dispatch(setEndDate(date.toISOString()));
    }
  };

  const handleStatementChange = (event: SelectChangeEvent<string>) => {
    dispatch(setReportStatementId(event.target.value));
    const statementId = event.target.value;
    const statement = creditCardStatements.find((statement: CreditCardStatement) => statement.id === statementId) || checkingAccountStatements.find((statement: CheckingAccountStatement) => statement.id === statementId);
    if (statement) {
      dispatch(setStartDate(statement.startDate));
      dispatch(setEndDate(statement.endDate));
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
                value={dayjs(startDate)}
                onChange={(newValue) => handleSetStartDate(newValue)}
                disabled={dateRangeType !== DateRangeType.DateRange}
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
                value={dayjs(endDate)}
                onChange={(newValue) => handleSetEndDate(newValue)}
                disabled={dateRangeType !== DateRangeType.DateRange}
              />
            </DemoContainer>
          </LocalizationProvider>
        </FormControl>
      </React.Fragment>
    );
  };

  const renderStatementSelect = (): JSX.Element => {
    if (dateRangeType !== DateRangeType.Statement) {
      return <React.Fragment />;
    }
    const combinedStatements = creditCardStatements.concat(checkingAccountStatements);
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
          value={statementId}
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          {renderStartDate()}
          {renderEndDate()}
        </Box>
        <Box sx={{ ml: '32px', display: 'flex', alignItems: 'center' }}>
          <FormControl component="fieldset">
            <RadioGroup row value={dateRangeType} onChange={handleDateOptionChange}>
              <FormControlLabel
                value={DateRangeType.YearToDate}
                control={<Radio />}
                label="Year to Date"
                sx={{ maxHeight: '32px' }}
              />
              <FormControlLabel
                value={DateRangeType.DateRange}
                control={<Radio />}
                label="Date Range"
                sx={{ maxHeight: '32px' }}
              />
              <FormControlLabel
                value={DateRangeType.All}
                control={<Radio />}
                label="All Dates"
                sx={{ maxHeight: '32px' }}
              />
              <FormControlLabel
                value={DateRangeType.LastYear}
                control={<Radio />}
                label="Last Year"
                sx={{ maxHeight: '32px' }}
              />
              <FormControlLabel
                value={DateRangeType.SinceRetirement}
                control={<Radio />}
                label="Since Retirement"
                sx={{ maxHeight: '32px' }}
              />
              <FormControlLabel
                value={DateRangeType.Statement}
                control={<Radio />}
                label="From Statement"
                sx={{ maxHeight: '32px' }}
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>{renderStatementSelect()}</Box>
    </Box>
  );
};

export default DateRangeSpecifier;