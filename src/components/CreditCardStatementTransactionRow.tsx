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
import { Tooltip, IconButton, Checkbox, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import EditTransactionDialog from './EditTransactionDialog';
import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import { addCategoryAssignmentRule, updateTransaction } from '../controllers';

export interface CreditCardStatementProps {
  creditCardTransactionId: string;
  transactionSelected: boolean;
  onTransactionSelectedChanged: (event: React.ChangeEvent<HTMLInputElement>, creditCardTransactionId: string, selected: boolean) => any;
}

const CreditCardStatementTransactionRow: React.FC<CreditCardStatementProps> = (props: CreditCardStatementProps) => {

  const [transactions, setTransactions] = React.useState([
    {
      id: '1',
      transactionDate: '2023-11-01',
      amount: 150.00,
      description: 'Grocery Shopping',
      userDescription: 'Weekly groceries at Walmart',
      comment: '', // Initial comment
    },
    // other transactions...
  ]);

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

  const [comment, setComment] = React.useState(creditCardTransaction.comment || "");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTransaction(null);
    setComment('');
  };

  const handleSaveComment = () => {
    if (selectedTransaction) {
      setTransactions(transactions.map(transaction =>
        transaction.id === (selectedTransaction as any).id
          ? { ...transaction, comment: comment }
          : transaction
      ));
    }
    handleCloseDialog();
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
      <div className="credit-card-statement-grid-table-cell">
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

      <div className="credit-card-statement-grid-table-cell">
        <Checkbox
          checked={props.transactionSelected}
          onChange={handleTransactionSelectedChanged}
        />
      </div>
      <div className="credit-card-statement-grid-table-cell">{formatDate(creditCardTransaction.transactionDate)}</div>
      <div className="credit-card-statement-grid-table-cell">{formatCurrency(creditCardTransaction.amount)}</div>
      <div className="credit-card-statement-grid-table-cell">{creditCardTransaction.description}</div>
      {renderEditIcon()}
      <div className="credit-card-statement-grid-table-cell">{creditCardTransaction.userDescription}</div>
      <div className="credit-card-statement-grid-table-cell">{categorizedTransactionName}</div>


      <div className="credit-card-statement-grid-table-cell">
        <Tooltip title="Edit Comment">
          <IconButton onClick={() => setIsDialogOpen(true)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </div>

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

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveComment} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </React.Fragment>
  );
}

export default CreditCardStatementTransactionRow;
