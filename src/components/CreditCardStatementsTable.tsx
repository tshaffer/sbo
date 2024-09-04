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

  function findMinMaxDates(statements:CreditCardStatement[]): { minDate: string, maxDate: string } {
    
    if (statements.length === 0) {
      throw new Error("The input array is empty.");
    }
  
    let minDate = statements[0].startDate;
    let maxDate = statements[0].endDate;
  
    statements.forEach(item => {
      if (item.startDate < minDate) {
        minDate = item.startDate;
      }
      if (item.endDate > maxDate) {
        maxDate = item.endDate;
      }
    });
  
    return { minDate, maxDate };
  }

  const generateAllTransactionsStatement = (): CreditCardStatement => {
    const minMaxDates = findMinMaxDates(statements);
    const allTransactionsStatement: CreditCardStatement = cloneDeep(statements[0]);
    allTransactionsStatement.fileName = 'All Transactions';
    allTransactionsStatement.startDate = minMaxDates.minDate;
    allTransactionsStatement.endDate = minMaxDates.maxDate;
    allTransactionsStatement.transactionCount = statements.reduce((acc, statement) => acc + statement.transactionCount, 0);
    allTransactionsStatement.netDebits = statements.reduce((acc, statement) => acc + statement.netDebits, 0);
    return allTransactionsStatement;
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
  const allTransactionsStatement: CreditCardStatement = generateAllTransactionsStatement();
  sortedStatements.unshift(allTransactionsStatement);

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
