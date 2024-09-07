/*
import React from 'react';

import '../styles/Grid.css';

import { cloneDeep, isEmpty } from 'lodash';

import { CreditCardStatement } from '../types';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useTypedSelector } from '../types';

import { formatCurrency, formatDate } from '../utilities';
import { getCreditCardStatements } from '../selectors';
import { loadTransactions } from '../controllers/transactions';

const CreditCardStatementsTable: React.FC = () => {

  const dispatch = useDispatch();

  const statements: CreditCardStatement[] = useTypedSelector(state => getCreditCardStatements(state));

  if (isEmpty(statements)) {
    return null;
  }

  const navigate = useNavigate();

  const handleStatementClicked = (creditCardStatement: CreditCardStatement) => {
    dispatch(loadTransactions(creditCardStatement.startDate, creditCardStatement.endDate, true, false))
      .then(() => {
        navigate(`/statements/credit-card/${creditCardStatement.id}`);
      });
  }

  let sortedStatements = cloneDeep(statements);
  sortedStatements = sortedStatements.sort((a, b) => b.endDate.localeCompare(a.endDate));

  return (
    <React.Fragment>
      <div className="grid-table-container">
        <div className="grid-table-header">
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell">Name</div>
          <div className="grid-table-cell">Start Date</div>
          <div className="grid-table-cell">End Date</div>
          <div className="grid-table-cell">Transaction Count</div>
          <div className="grid-table-cell">Net Debits</div>
        </div>
        <div className="grid-table-body">
          {sortedStatements.map((statement: CreditCardStatement) => (
            <div className="grid-table-row" key={statement.id}>
              <div className="grid-table-cell"></div>
              <div
                className="grid-table-cell-clickable"
                onClick={() => handleStatementClicked(statement)}
              >
                {statement.fileName}
              </div>
              <div className="grid-table-cell">{formatDate(statement.startDate)}</div>
              <div className="grid-table-cell">{formatDate(statement.endDate)}</div>
              <div className="grid-table-cell">{statement.transactionCount}</div>
              <div className="grid-table-cell">{formatCurrency(statement.netDebits)}</div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default CreditCardStatementsTable;
*/
import React from 'react';
import { useTypedSelector } from '../types';
import { getCreditCardStatements, getCheckingAccountStatements } from '../selectors';
import { loadTransactions } from '../controllers/transactions';
import StatementsTable from './StatementsTable';

const CreditCardStatementsTable: React.FC = () => {

  const statements = useTypedSelector(getCreditCardStatements);
  
  return (
    <StatementsTable
      statements={statements}
      onLoadTransactions={(startDate, endDate) => loadTransactions(startDate, endDate, true, false)}
      gridTemplateColumns="40px 1fr 1fr 1fr 1fr 1fr"
    />
  );
};

const CheckingAccountStatementsTable: React.FC = () => {
  const statements = useTypedSelector(getCheckingAccountStatements);
  return (
    <StatementsTable
      statements={statements}
      onLoadTransactions={(startDate, endDate) => loadTransactions(startDate, endDate, false, true)}
      gridTemplateColumns="40px 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
      additionalColumns={(statement) => [
        <span key="checkCount">{statement.checkCount}</span>,
        <span key="atmWithdrawalCount">{statement.atmWithdrawalCount}</span>,
      ]}
    />
  );
};

export { CreditCardStatementsTable, CheckingAccountStatementsTable };