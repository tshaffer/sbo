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
import { addAllTransactionsStatement } from '../controllers';

const CreditCardStatementsTable: React.FC = () => {

  const dispatch = useDispatch();

  const statements: CreditCardStatement[] = useTypedSelector(state => getCreditCardStatements(state));

  React.useEffect(() => {
    console.log('useEffect');
    if (statements.length > 0) {
      console.log('useEffect: statements.length > 0');
      dispatch(addAllTransactionsStatement(statements));
    }
  }, []);


  if (isEmpty(statements)) {
    return null;
  }

  const navigate = useNavigate();

  const handleStatementClicked = (creditCardStatement: CreditCardStatement) => {
    if (creditCardStatement.id === 'allTransactions') {
      dispatch(loadTransactions(creditCardStatement.startDate, creditCardStatement.endDate, true, false))
        .then(() => {
          dispatch(addAllTransactionsStatement(statements))
            .then(() => {
              navigate(`/statements/credit-card/${creditCardStatement.id}`);
            }
            );
        }
        );
    } else {
      dispatch(loadTransactions(creditCardStatement.startDate, creditCardStatement.endDate, true, false))
        .then(() => {
          navigate(`/statements/credit-card/${creditCardStatement.id}`);
        });
    }
  }

  let sortedStatements = cloneDeep(statements);
  sortedStatements = sortedStatements.sort((a, b) => b.endDate.localeCompare(a.endDate));
  // const allTransactionsStatement: CreditCardStatement = generateAllTransactionsStatement();
  // sortedStatements.unshift(allTransactionsStatement);

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
  return <CreditCardStatementTable />;
};
