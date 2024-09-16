import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cloneDeep, isEmpty } from 'lodash';
import '../styles/Grid.css';
import { formatCurrency, formatDate } from '../utilities';
import { Statement } from '../types';

interface BaseStatementsTableProps<T extends Statement> {
  statements: T[];
  navigateBasePath: string; // New prop to specify the base path for navigation
  additionalColumns?: (statement: T) => React.ReactNode[];
  additionalColumnHeaders?: string[];
  gridTemplateColumns: string;
}

const BaseStatementsTable = <T extends Statement>({
  statements,
  navigateBasePath,
  additionalColumns = () => [],
  additionalColumnHeaders = [],
  gridTemplateColumns
}: BaseStatementsTableProps<T>) => {

  const navigate = useNavigate();

  if (isEmpty(statements)) {
    return null;
  }

  const handleStatementClicked = (statement: T) => {
    navigate(`${navigateBasePath}/${statement.id}`);
  };

  const sortedStatements = cloneDeep(statements).sort((a, b) => b.endDate.localeCompare(a.endDate));

  return (
    <div className="grid-table-container" style={{ gridTemplateColumns }}>
      <div className="grid-table-header">
        <div className="grid-table-cell"></div>
        <div className="grid-table-cell">End Date</div>
        <div className="grid-table-cell">Start Date</div>
        <div className="grid-table-cell">Transaction Count</div>
        <div className="grid-table-cell">Net</div>
        {additionalColumnHeaders.map((header, idx) => (
          <div key={idx} className="grid-table-cell">{header}</div>
        ))}
      </div>
      <div className="grid-table-body">
        {sortedStatements.map(statement => (
          <div
            className="grid-table-row-clickable"
            key={statement.id}
            onClick={() => handleStatementClicked(statement)}
          >
            <div className="grid-table-cell"></div>
            <div className="grid-table-cell">{formatDate(statement.endDate)}</div>
            <div className="grid-table-cell">{formatDate(statement.startDate)}</div>
            <div className="grid-table-cell">{statement.transactionCount}</div>
            <div className="grid-table-cell">{formatCurrency(-statement.netDebits)}</div>
            {additionalColumns(statement).map((content, idx) => (
              <div key={idx} className="grid-table-cell">{content}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BaseStatementsTable;
