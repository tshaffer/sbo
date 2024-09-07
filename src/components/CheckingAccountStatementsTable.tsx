import React from 'react';

import '../styles/Grid.css';

import { cloneDeep, isEmpty } from 'lodash';

import { CheckingAccountStatement } from '../types';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useTypedSelector } from '../types';

import { formatCurrency, formatDate } from '../utilities';
import { getCheckingAccountStatements } from '../selectors';
import { loadTransactions } from '../controllers/transactions';

const CheckingAccountStatementsTable: React.FC = () => {

  const dispatch = useDispatch();

  const statements: CheckingAccountStatement[] = useTypedSelector(state => getCheckingAccountStatements(state));

  if (isEmpty(statements)) {
    return null;
  }

  const navigate = useNavigate();

  const handleStatementClicked = (checkingAccountStatement: CheckingAccountStatement) => {
    dispatch(loadTransactions(checkingAccountStatement.startDate, checkingAccountStatement.endDate, false, true))
      .then(() => {
        navigate(`/statements/credit-card/${checkingAccountStatement.id}`);
      });
  }

  let sortedStatements = cloneDeep(statements);
  sortedStatements = sortedStatements.sort((a, b) => b.endDate.localeCompare(a.endDate));

  return (
    <React.Fragment>
      <div className="checking-account-grid-table-container">
        <div className="grid-table-header">
          <div className="grid-table-cell"></div>
          <div className="grid-table-cell">Name</div>
          <div className="grid-table-cell">Start Date</div>
          <div className="grid-table-cell">End Date</div>
          <div className="grid-table-cell">Transaction Count</div>
          <div className="grid-table-cell">Net Debits</div>
          <div className="grid-table-cell"># of checks</div>
          <div className="grid-table-cell"># of ATM withdrawals</div>
        </div>
        <div className="grid-table-body">
          {sortedStatements.map((statement: CheckingAccountStatement) => (
            <React.Fragment key={statement.id}>
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
                <div className="grid-table-cell">{statement.checkCount}</div>
                <div className="grid-table-cell">{statement.atmWithdrawalCount}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default CheckingAccountStatementsTable;
