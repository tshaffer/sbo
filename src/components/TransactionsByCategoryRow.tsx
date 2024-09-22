import React from 'react';
import { BankTransaction, CategorizedTransaction, Category, useTypedSelector } from '../types';

import { getCategoryById } from '../selectors';
import { isNil, isString } from 'lodash';
import { IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import '../styles/Tracker.css';

export interface TransactionsByCategoryRowProps {
  categoryId: string;
  transactions: CategorizedTransaction[];
}

const TransactionsByCategoryRow: React.FC<TransactionsByCategoryRowProps> = (props: TransactionsByCategoryRowProps) => {

  const category: Category = useTypedSelector(state => getCategoryById(state, props.categoryId)!);

  // const renderExpandIcon = (categoryExpenses: CategoryExpensesData): JSX.Element | null => {
  //   if (!isParentCategory(categoryExpenses)) {
  //     return null;
  //   }
  //   return (
  //     <IconButton onClick={() => handleToggleCategoryExpand(categoryExpenses.id as string)}>
  //       {isCategoryExpanded(categoryExpenses.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
  //     </IconButton>
  //   );
  // }


  return (
    <div
      className="details-table-row"
      key={category.id}
    >
      <div className="fixed-width-base-table-cell fixed-width-table-cell-icon">
        <IconButton>
          <ExpandMoreIcon />
        </IconButton>
      </div>
      <div className="fixed-width-base-table-cell fixed-width-table-cell-property" style={{ marginLeft: '36px' }}>{category.name}</div>
    </div>
  );
}

export default TransactionsByCategoryRow;
