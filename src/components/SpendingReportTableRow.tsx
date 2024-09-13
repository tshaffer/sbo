import React from 'react';

import { useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';

import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

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
  const [isEditingComment, setIsEditingComment] = React.useState(false);
  const [comment, setComment] = React.useState(props.transaction.comment || "");
  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = React.useState(false);

  const commentIdsToIgnore = ['commentDiv', 'commentInput', 'save', 'cancel', 'assign', 'edit'];

  const handleAssignCategory = (transaction: Transaction) => {
    setTransactionId(transaction.id);
    setShowAddCategoryAssignmentRuleDialog(true);
  };

  const handleClickTransaction = (e: any, transaction: Transaction) => {
    console.log('handleClickTransaction');
    console.log(e.target.id);
    if (!commentIdsToIgnore.includes(e.target.id)) {
      navigate(`/statements/credit-card/${transaction.statementId}`);
    }
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
    console.log('handleSetIsEditingCommentEvent: ', isEditing);
    // event.stopPropagation();
    setIsEditingComment(isEditing);
  }

  const handleCommentChanged = (event: any, comment: string) => {
    console.log('handleCommentChanged: ', comment);
    // event.stopPropagation();
    setComment(comment);
  }

  const renderCommentColumn = (transaction: Transaction): JSX.Element => {
    return (
      <div className="credit-card-statement-grid-table-cell">
        {isEditingComment ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              id="commentInput"
              value={comment}
              onChange={(e: any) => {
                e.stopPropagation();
                handleCommentChanged(e, e.target.value)
              }
              }
            />
            <IconButton id='save' onClick={(event: any) => {
              event.stopPropagation();
              handleSaveComment(transaction)
            }
            }>
              <SaveIcon />
            </IconButton>
            <IconButton id='cancel' onClick={(event: any) => {
              event.stopPropagation();
              handleSetIsEditingComment(event, false)
            }
            }>
              <CancelIcon
                id='cancel'
              />
            </IconButton>
          </div>
        ) : (
          <div
            id='commentDiv'
            onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleSetIsEditingComment(event, true)}>
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
        className="table-row-clickable"
        key={props.transaction.id}
        onClick={(e) => handleClickTransaction(e, props.transaction)}
      >
        <div className="table-cell">
          <IconButton id='assign' onClick={(event: any) => {
            event.stopPropagation();
            handleAssignCategory(props.transaction)
          }
          }>
            <AssignmentIcon />
          </IconButton>
          <Tooltip title="Edit transaction">
            <IconButton id='edit' onClick={(event: any) => {
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
        {renderCommentColumn(props.transaction)}
      </div>
    </React.Fragment>);
};

export default SpendingReportTableRow;
