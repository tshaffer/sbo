import React from 'react';
import { useDispatch, useTypedSelector } from '../types';

import { v4 as uuidv4 } from 'uuid';

import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

import { CategoryAssignmentRule, CreditCardTransaction, Transaction } from '../types';
import { getTransactionById, findMatchingRule, MatchingRuleAssignment, categorizeTransaction, getCategories, getCategoryAssignmentRules, getCategoryById, getOverrideCategory, getOverrideCategoryId } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';

import '../styles/Grid.css';
import { Tooltip, IconButton, Checkbox, Button, TextField } from '@mui/material';
import EditTransactionDialog from './EditTransactionDialog';
import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import { addCategoryAssignmentRule, updateTransaction } from '../controllers';

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
  const matchingRule: MatchingRuleAssignment | null = useTypedSelector(state => findMatchingRule(state, creditCardTransaction));
  const categoryNameFromCategoryAssignmentRule: string = matchingRule ? matchingRule.category.name : '';
  const patternFromCategoryAssignmentRule: string | null = matchingRule ? matchingRule.pattern : null;
  const categoryNameFromCategoryOverride = useTypedSelector(state => getOverrideCategory(state, props.creditCardTransactionId)
    ? getCategoryById(state, getOverrideCategoryId(state, props.creditCardTransactionId))!.name
    : '');
  const categorizedTransactionName = useTypedSelector(state => categorizeTransaction(creditCardTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '');

  const [isEditing, setIsEditing] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [comment, setComment] = React.useState(creditCardTransaction.comment || "");

  const handleSaveComment = () => {
    console.log('handleSaveComment: ', comment);
    // onSaveComment(transaction.id, comment);
    setIsEditing(false);
  };


  const handleEditTransaction = () => {
    setShowEditTransactionDialog(true);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    dispatch(updateTransaction(transaction));
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
      <div className="transaction-row-cell">
        <Tooltip title="Edit transaction">
          <IconButton onClick={() => handleEditTransaction()}>
            <EditIcon />
          </IconButton>
        </Tooltip>
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

      <div className="transaction-row">
        <div className="transaction-row-main" key={creditCardTransaction.id}>

          <div className="transaction-row-cell">
            <Checkbox
              checked={props.transactionSelected}
              onChange={handleTransactionSelectedChanged}
            />
          </div>

          <div>
            <IconButton onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </div>

          <div className="transaction-row-cell">{formatDate(creditCardTransaction.transactionDate)}</div>
          <div className="transaction-row-cell">{formatCurrency(creditCardTransaction.amount)}</div>
          <div className="transaction-row-cell">{creditCardTransaction.description}</div>
          {renderEditIcon()}
          <div className="transaction-row-cell">{creditCardTransaction.userDescription}</div>
          <div className="transaction-row-cell">{categorizedTransactionName}</div>
          <div className="transaction-row-cell">{comment}</div>
          <Tooltip title="Edit rule">
            <IconButton onClick={() => handleEditRule(creditCardTransaction)}>
              <AssignmentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Category Override">
            <IconButton
              onClick={() => handleRemoveCategoryOverride(creditCardTransaction)}
              disabled={!creditCardTransaction.overrideCategory}
            >
              {creditCardTransaction.overrideCategory ? <ToggleOnIcon /> : <ToggleOffIcon />}
            </IconButton>
          </Tooltip>
        </div>
        {isExpanded && (
          <div className="transaction-row-expanded">
            <TextField
              fullWidth
              multiline
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleSaveComment}>Save</Button>
            <Button onClick={() => setIsExpanded(false)}>Cancel</Button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

export default CreditCardStatementTransactionRow;

/*
<div className="transaction-row">
  <div className="transaction-row-main">
    <div className="transaction-row-cell">
      <IconButton onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </div>
    <div className="transaction-row-cell">{formatDate(transaction.date)}</div>
    <div className="transaction-row-cell">{formatCurrency(transaction.amount)}</div>
    <div className="transaction-row-cell">{transaction.description}</div>
    <div className="transaction-row-cell">{transaction.userDescription}</div>
    <div className="transaction-row-cell">{comment}</div>
  </div>
  {isExpanded && (
    <div className="transaction-row-expanded">
      <TextField
        fullWidth
        multiline
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button onClick={handleSaveComment}>Save</Button>
      <Button onClick={() => setIsExpanded(false)}>Cancel</Button>
    </div>
  )}
</div>
*/
