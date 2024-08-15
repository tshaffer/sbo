import React from 'react';

import '../styles/Grid.css';

import { cloneDeep, isEmpty } from 'lodash';

import { CreditCardStatement } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useTypedSelector } from '../types';

import { formatCurrency, formatDate } from '../utilities';
import { getCreditCardStatements } from '../selectors';
import { loadTransactions } from '../controllers/transactions';
import CreditCardStatementTable from './CreditCardStatementTable';

const CreditCardStatementsTable: React.FC = () => {

  const dispatch = useDispatch();

  const statements: CreditCardStatement[] = useTypedSelector(state => getCreditCardStatements(state));

  if (isEmpty(statements)) {
    return null;
  }

  const navigate = useNavigate();

  const handleStatementClicked = (creditCardStatement: CreditCardStatement) => {
    console.log('navigate to credit card statement', creditCardStatement.id);
    dispatch(loadTransactions(creditCardStatement.startDate, creditCardStatement.endDate, true, false))
      .then(() => {
        navigate(`/creditCardStatement/${creditCardStatement.id}`);
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

export const CreditCardStatementTableWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // return <CreditCardStatementTable creditCardStatementId={id as string} navigate={navigate} />;
  return <CreditCardStatementTable/>;
};
