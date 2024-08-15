import React from 'react';
import { useDispatch, useTypedSelector } from '../types';

import { v4 as uuidv4 } from 'uuid';

import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';

import { CategoryAssignmentRule, CreditCardTransaction, Transaction } from '../types';
import { getTransactionById, findMatchingRule, MatchingRuleAssignment, categorizeTransaction, getCategories, getCategoryAssignmentRules, getCategoryById, getOverrideCategory, getOverrideCategoryId } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';

import '../styles/Grid.css';
import { Tooltip, IconButton, Checkbox } from '@mui/material';
import EditTransactionDialog from './EditTransactionDialog';
import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import { updateTransaction } from '../models';

export interface CreditCardStatementProps {
  creditCardTransactionId: string;
  onSetCreditCardTransactionSelected: (creditCardTransactionId: string, selected: boolean) => any;
}

const CreditCardStatementTransactionRow: React.FC<CreditCardStatementProps> = (props: CreditCardStatementProps) => {

  const [transactionId, setTransactionId] = React.useState('');
  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = React.useState(false);

  const [checked, setChecked] = React.useState(false);

  const dispatch = useDispatch();

  const creditCardTransaction: CreditCardTransaction = useTypedSelector(state => getTransactionById(state, props.creditCardTransactionId)! as CreditCardTransaction);

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

  const renderEditIcon = (): JSX.Element => {
    return (
      <div className="grid-table-cell">
        <Tooltip title="Edit transaction">
          <IconButton onClick={() => handleEditTransaction()}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  function handleChange(event: any, checked: boolean): void {
    setChecked(checked);
    props.onSetCreditCardTransactionSelected(creditCardTransaction.id, checked);
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

      <div className="grid-table-cell">
        <Checkbox
          checked={checked}
          onChange={handleChange}
        />
      </div>
      <div className="grid-table-cell">{formatDate(creditCardTransaction.transactionDate)}</div>
      <div className="grid-table-cell">{formatCurrency(creditCardTransaction.amount)}</div>
      <div className="grid-table-cell">{creditCardTransaction.description}</div>
      {renderEditIcon()}
      <div className="grid-table-cell">{creditCardTransaction.userDescription}</div>
      <div className="grid-table-cell">{props.categorizedTransactionName}</div>
      <div className="grid-table-cell">{creditCardTransaction.category}</div>
      <Tooltip title="Edit rule">
        <IconButton onClick={() => handleEditRule(creditCardTransaction)}>
          <AssignmentIcon />
        </IconButton>
      </Tooltip>
      <div className="grid-table-cell">{props.categoryNameFromCategoryAssignmentRule}</div>
      <div className="grid-table-cell">{props.patternFromCategoryAssignmentRule}</div>
      <div className="grid-table-cell">{props.categoryNameFromCategoryOverride}</div>
    </React.Fragment>
  );
}

export default CreditCardStatementTransactionRow;
