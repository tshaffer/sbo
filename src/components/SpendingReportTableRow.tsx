import React from 'react';

import { useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';

import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';

import '../styles/Tracker.css';
import { useDispatch } from '../types';
import { CategoryAssignmentRule, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utilities';

import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import EditTransactionDialog from './EditTransactionDialog';
import { addCategoryAssignmentRule, updateTransaction } from '../controllers';

export interface SpendingReportTableRowProps {
  transaction: Transaction;
}

const SpendingReportTableRow: React.FC<SpendingReportTableRowProps> = (props: SpendingReportTableRowProps) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [transactionId, setTransactionId] = React.useState('');
  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = React.useState(false);

  const handleAssignCategory = (transaction: Transaction) => {
    setTransactionId(transaction.id);
    setShowAddCategoryAssignmentRuleDialog(true);
  };

  const handleClickTransaction = (transaction: Transaction) => {
    navigate(`/statements/credit-card/${transaction.statementId}`);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionId(transaction.id);
    setShowEditTransactionDialog(true);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    dispatch(updateTransaction(transaction));
  };

  const handleCloseEditTransactionDialog = () => {
    setShowEditTransactionDialog(false);
  }

  const handleSaveRule = (pattern: string, categoryId: string): void => {
    const id: string = uuidv4();
    const categoryAssignmentRule: CategoryAssignmentRule = {
      id,
      pattern,
      categoryId
    };
    dispatch(addCategoryAssignmentRule(categoryAssignmentRule));
  }

  const handleCloseAddRuleDialog = () => {
    setShowAddCategoryAssignmentRuleDialog(false);
  };

  return (
    <React.Fragment>
      <AddCategoryAssignmentRuleDialog
        open={showAddCategoryAssignmentRuleDialog}
        onSaveRule={handleSaveRule}
        onClose={handleCloseAddRuleDialog}
        transactionId={transactionId}
      />
      <EditTransactionDialog
        open={showEditTransactionDialog}
        transactionId={transactionId}
        onClose={handleCloseEditTransactionDialog}
        onSave={handleSaveTransaction}
      />
      <div
        className="table-row-clickable"
        key={props.transaction.id}
        onClick={() => handleClickTransaction(props.transaction)}
      >
        <div className="table-cell">
          <IconButton onClick={(event: any) => {
            event.stopPropagation();
            handleAssignCategory(props.transaction)
          }
          }>
            <AssignmentIcon />
          </IconButton>
          <Tooltip title="Edit transaction">
            <IconButton onClick={(event: any) => {
              event.stopPropagation();
              handleEditTransaction(props.transaction)
            }
            }>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div className="table-cell">{formatDate(props.transaction.transactionDate)}</div>
        <div className="table-cell">{formatCurrency(-props.transaction.amount)}</div>
        <div className="table-cell">{props.transaction.userDescription}</div>
        <div className="table-cell">{props.transaction.comment}</div>
      </div>
    </React.Fragment>);
};

export default SpendingReportTableRow;
