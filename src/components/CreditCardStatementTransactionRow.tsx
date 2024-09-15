import React from 'react';
import { useDispatch, useTypedSelector } from '../types';

import { v4 as uuidv4 } from 'uuid';

import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

import { CategoryAssignmentRule, CreditCardTransaction, Transaction } from '../types';
import { getTransactionById, categorizeTransaction, getCategories, getCategoryAssignmentRules } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';

import '../styles/Grid.css';
import { Tooltip, IconButton, Checkbox } from '@mui/material';
import EditTransactionDialog from './EditTransactionDialog';
import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import { addCategoryAssignmentRule, updateTransaction } from '../controllers';

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export interface CreditCardStatementProps {
  creditCardTransactionId: string;
  transactionSelected: boolean;
  onTransactionSelectedChanged: (event: React.ChangeEvent<HTMLInputElement>, creditCardTransactionId: string, selected: boolean) => any;
}

const CreditCardStatementTransactionRow: React.FC<CreditCardStatementProps> = (props: CreditCardStatementProps) => {

  const [transactionId, setTransactionId] = React.useState('');
  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = React.useState(false);

  const dispatch = useDispatch();

  const creditCardTransaction: CreditCardTransaction = useTypedSelector(state => getTransactionById(state, props.creditCardTransactionId)! as CreditCardTransaction);
  const categorizedTransactionName = useTypedSelector(state => categorizeTransaction(creditCardTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '');

  const [isEditingComment, setIsEditingComment] = React.useState(false);
  const [comment, setComment] = React.useState(creditCardTransaction.comment || "");

  const handleEditTransaction = () => {
    setShowEditTransactionDialog(true);
  };

  const handleCloseEditTransactionDialog = () => {
    setShowEditTransactionDialog(false);
  }

  const handleEditRule = (transaction: CreditCardTransaction) => {
    setTransactionId(transaction.id);
    setShowAddCategoryAssignmentRuleDialog(true);
  };

  const handleRemoveCategoryOverride = (transaction: CreditCardTransaction) => {
    const updatedTransaction: CreditCardTransaction = {
      ...transaction,
      overrideCategory: false,
      overrideCategoryId: ''
    };
    dispatch(updateTransaction(updatedTransaction));
  }

  const handleSaveTransaction = (transaction: Transaction) => {
    dispatch(updateTransaction(transaction));
  };

  const handleSaveComment = (creditCardTransaction: CreditCardTransaction) => {
    const updatedTransaction: CreditCardTransaction = {
      ...creditCardTransaction,
      comment,
    };
    dispatch(updateTransaction(updatedTransaction));

    setIsEditingComment(false);
  };

  const handleCancelComment = () => {
    setComment(creditCardTransaction.comment || "");
    setIsEditingComment(false);
  }
  
  const handleSaveRule = (pattern: string, categoryId: string): void => {
    const id: string = uuidv4();
    const categoryAssignmentRule: CategoryAssignmentRule = {
      id,
      pattern,
      categoryId
    };
    console.log('handleSaveRule: ', categoryAssignmentRule, categoryAssignmentRule);
    dispatch(addCategoryAssignmentRule(categoryAssignmentRule));
  }

  const handleCloseAddRuleDialog = () => {
    setShowAddCategoryAssignmentRuleDialog(false);
  }

  function handleTransactionSelectedChanged(event: any, checked: boolean): void {
    props.onTransactionSelectedChanged(event, creditCardTransaction.id, checked);
  }

  const renderEditIcon = (): JSX.Element => {
    return (
      <div className="credit-card-statement-grid-table-cell">
        <Tooltip title="Edit transaction">
          <IconButton onClick={() => handleEditTransaction()}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  const renderRuleIcon = (): JSX.Element => {
    return (
      <div className="credit-card-statement-grid-table-cell">
        <Tooltip title="Edit rule">
          <IconButton onClick={() => handleEditRule(creditCardTransaction)}>
            <AssignmentIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  const renderCommentColumn = (creditCardTransaction: CreditCardTransaction): JSX.Element => {
    return (
      <div className="credit-card-statement-grid-table-cell">
        {isEditingComment ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <IconButton onClick={() => handleSaveComment(creditCardTransaction)}>
              <SaveIcon />
            </IconButton>
            <IconButton onClick={() => handleCancelComment()}>
              <CancelIcon />
            </IconButton>
          </div>
        ) : (
          <div onClick={() => setIsEditingComment(true)}>
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
        transactionId={transactionId}
        onClose={handleCloseAddRuleDialog}
        onSaveRule={handleSaveRule}
      />
      <EditTransactionDialog
        open={showEditTransactionDialog}
        transactionId={creditCardTransaction.id}
        onClose={handleCloseEditTransactionDialog}
        onSave={handleSaveTransaction}
      />

      <div className="credit-card-statement-grid-table-cell">
        <Checkbox
          checked={props.transactionSelected}
          onChange={handleTransactionSelectedChanged}
        />
      </div>
      <div className="credit-card-statement-grid-table-cell">{formatDate(creditCardTransaction.transactionDate)}</div>
      <div className="credit-card-statement-grid-table-cell">{formatCurrency(-creditCardTransaction.amount)}</div>
      {renderEditIcon()}
      {renderRuleIcon()}
      <div className="credit-card-statement-grid-table-cell">{creditCardTransaction.userDescription}</div>
      <div className="credit-card-statement-grid-table-cell">{categorizedTransactionName}</div>
      {renderCommentColumn(creditCardTransaction)}
      <Tooltip title="Category Override">
        <span>
          <IconButton
            onClick={() => handleRemoveCategoryOverride(creditCardTransaction)}
            disabled={!creditCardTransaction.overrideCategory}
          >
            {creditCardTransaction.overrideCategory ? <ToggleOnIcon /> : <ToggleOffIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </React.Fragment>
  );
}

export default CreditCardStatementTransactionRow;
