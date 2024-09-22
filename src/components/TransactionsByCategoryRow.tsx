import React, { useState } from 'react';
import { BankTransaction, CategorizedTransaction, Category, useTypedSelector } from '../types';

import { getCategoryById } from '../selectors';
import { isNil, isString } from 'lodash';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TransactionsList from './TransactionsList';
import '../styles/Tracker.css';
import { render } from 'react-dom';

export interface TransactionsByCategoryRowProps {
  categoryId: string;
  transactions: CategorizedTransaction[];
}

const TransactionsByCategoryRow: React.FC<TransactionsByCategoryRowProps> = (props: TransactionsByCategoryRowProps) => {

  const [showTransactions, setShowTransactions] = useState<boolean>(false);

  const category: Category = useTypedSelector(state => getCategoryById(state, props.categoryId)!);

  function handleToggleShowTransactions(): void {
    setShowTransactions(!showTransactions);
  }

  const renderTransactionsList = () => {
    if (showTransactions) {
      return (
        <TransactionsList categoryId={props.categoryId}/>
      );
    }
    return null;
  }

  return (
    <div
      className="tbc-details-table-row"
      key={category.id}
    >
      <div className="tbc-fixed-width-base-table-cell tbc-fixed-width-table-cell-icon">
      <div className="tbc-fixed-width-base-table-cell tbc-fixed-width-table-cell-icon">
            <IconButton onClick={() => handleToggleShowTransactions()}>
              {showTransactions ? <RemoveIcon /> : <AddIcon />}
            </IconButton>
          </div>
      </div>
      <div className="tbc-fixed-width-base-table-cell tbc-fixed-width-table-cell-property" style={{ marginLeft: '36px' }}>{category.name}</div>
      {renderTransactionsList()}
    </div>
  );
}

export default TransactionsByCategoryRow;
