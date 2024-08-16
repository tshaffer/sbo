import React from 'react';

import '../styles/Tracker.css';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { cloneDeep, isEmpty } from 'lodash';

import { CheckingAccountStatement } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useTypedSelector } from '../types';

import { getCheckingAccountStatements } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';
import CheckingAccountStatementTable from './CheckingAccountStatementTable';
import { loadTransactions } from '../controllers';

const CheckingAccountStatementsTable: React.FC = () => {

  const dispatch = useDispatch();

  const statements: CheckingAccountStatement[] = useTypedSelector(state => getCheckingAccountStatements(state));

  if (isEmpty(statements)) {
    return null;
  }

  const navigate = useNavigate();

  const handleStatementClicked = (checkingAccountStatement: CheckingAccountStatement) => {
    console.log('navigate to credit card statement', checkingAccountStatement.id);
    dispatch(loadTransactions(checkingAccountStatement.startDate, checkingAccountStatement.endDate, false, true))
      .then(() => {
        navigate(`/statements/checking-account/${checkingAccountStatement.id}`);
      });
  }

  let sortedStatements = cloneDeep(statements);
  sortedStatements = sortedStatements.sort((a, b) => b.endDate.localeCompare(a.endDate));

  return (
    <React.Fragment>
      <div className="table-container">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell"></div>
            <div className="table-cell">Name</div>
            <div className="table-cell">Start Date</div>
            <div className="table-cell">End Date</div>
            <div className="table-cell">Transaction Count</div>
            <div className="table-cell">Net Debits</div>
            <div className="table-cell"># of checks</div>
            <div className="table-cell"># of ATM withdrawals</div>
          </div>
        </div>
        <div className="table-body">
          {sortedStatements.map((statement: CheckingAccountStatement) => (
            <React.Fragment key={statement.id}>
              <div className="table-row">
                <div className="table-cell"></div>
                <div
                  className="grid-table-cell-clickable"
                  onClick={() => handleStatementClicked(statement)}
                >
                  {statement.fileName}
                </div>
                <div className="table-cell">{formatDate(statement.startDate)}</div>
                <div className="table-cell">{formatDate(statement.endDate)}</div>
                <div className="table-cell">{statement.transactionCount}</div>
                <div className="table-cell">{formatCurrency(statement.netDebits)}</div>
                <div className="table-cell">{statement.checkCount}</div>
                <div className="table-cell">{statement.atmWithdrawalCount}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </React.Fragment >
  );
};

export default CheckingAccountStatementsTable;
