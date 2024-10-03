import React from 'react';

import { useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';

import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import '../../styles/Tracker.css';
import { BankTransactionType, useDispatch } from '../../types';
import { CategoryAssignmentRule, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utilities';

import AddCategoryAssignmentRuleDialog from '../Dialogs/AddCategoryAssignmentRuleDialog';
import EditTransactionDialog from '../Dialogs/EditTransactionDialog';
import { addCategoryAssignmentRule, updateTransaction } from '../../controllers';

export interface SpendingReportTableRowProps {
  transaction: Transaction;
}

const SpendingReportTableRow: React.FC<SpendingReportTableRowProps> = (props: SpendingReportTableRowProps) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [transactionId, setTransactionId] = React.useState('');
  const [isEditingComment, setIsEditingComment] = React.useState(false);
  const [comment, setComment] = React.useState(props.transaction.comment || "");
  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = React.useState(false);

  const handleAssignCategoryRule = (transaction: Transaction) => {
    setTransactionId(transaction.id);
    setShowAddCategoryAssignmentRuleDialog(true);
  };

  const handleNavigateToStatement = (transaction: Transaction) => {
    const path = transaction.bankTransactionType === BankTransactionType.Checking
      ? `/statements/checking-account/${transaction.statementId}`
      : `/statements/credit-card/${transaction.statementId}`;
    navigate(`${path}?transactionId=${transaction.id}`);
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

  const handleSaveComment = (transaction: Transaction) => {
    const updatedTransaction: Transaction = {
      ...transaction,
      comment,
    };
    dispatch(updateTransaction(updatedTransaction));

    setIsEditingComment(false);
  };

  const handleCancelComment = () => {
    setComment(props.transaction.comment || "");
    setIsEditingComment(false);
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

  const handleSetIsEditingComment = (event: React.MouseEvent<HTMLElement, MouseEvent>, isEditing: boolean) => {
    setIsEditingComment(isEditing);
  }

  const handleCommentChanged = (event: any, comment: string) => {
    setComment(comment);
  }

  const renderCommentColumn = (transaction: Transaction): JSX.Element => {
    return (
      <div className="fixed-width-base-table-cell details-table-cell-comment">
        {isEditingComment ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              id="commentInput"
              value={comment}
              onChange={(e: any) => {
                handleCommentChanged(e, e.target.value)
              }
              }
            />
            <IconButton id='save' onClick={() => {
              handleSaveComment(transaction)
            }
            }>
              <SaveIcon />
            </IconButton>
            <IconButton
              id='cancel'
              onClick={handleCancelComment}
            >
              <CancelIcon />
            </IconButton>
          </div>
        ) : (
          <div
            id='commentDiv'
            onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              handleSetIsEditingComment(event, true)
            }
            }>
            {comment || <span style={{ color: "#aaa" }}>Add comment...</span>}
          </div>
        )}
      </div>
    );
  }

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
        className="details-table-row"
        key={props.transaction.id}
      >
        <div className="fixed-width-base-table-cell details-table-cell-icon">
          <Tooltip title="Assign Rule">
            <IconButton id='assign' onClick={() => {
              handleAssignCategoryRule(props.transaction)
            }
            }>
              <AssignmentIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div className="fixed-width-base-table-cell details-table-cell-icon">
          <Tooltip title="Edit transaction">
            <IconButton id='edit' onClick={() => {
              handleEditTransaction(props.transaction)
            }
            }>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div className="fixed-width-base-table-cell details-table-cell-icon">
          <Tooltip title="Statement">
            <IconButton id='edit' onClick={() => {
              handleNavigateToStatement(props.transaction)
            }
            }>
              <AccountBalanceIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div className="fixed-width-base-table-cell details-table-cell-date" style={{ marginLeft: '36px' }}>{formatDate(props.transaction.transactionDate)}</div>
        <div className="fixed-width-base-table-cell details-table-cell-amount">{formatCurrency(-props.transaction.amount)}</div>
        <div className="fixed-width-base-table-cell details-table-cell-description">{props.transaction.userDescription}</div>
        {renderCommentColumn(props.transaction)}
      </div>
    </React.Fragment>);
};

export default SpendingReportTableRow;
