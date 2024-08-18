import React, { ChangeEvent, useState } from 'react';

import { useTypedSelector } from '../types';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Category, Transaction } from '../types';
import { getCategoryByTransactionId, getTransactionById } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';
import SelectCategory from './SelectCategory';
import EditTransactionMoreOptionsDialog from './EditTransactionMoreOptionsDialog';

export interface EditTransactionDialogProps {
  open: boolean;
  transactionId: string;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => void;
}

const EditTransactionDialog = (props: EditTransactionDialogProps) => {

  if (!props.open) {
    return null;
  }

  const transaction: Transaction = useTypedSelector(state => getTransactionById(state, props.transactionId)!);
  const inferredCategory: Category | null | undefined = useTypedSelector(state => getCategoryByTransactionId(state, props.transactionId));

  const [userDescription, setUserDescription] = useState(transaction.userDescription);
  const [overrideCategory, setOverrideCategory] = React.useState(transaction.overrideCategory);
  const [overrideCategoryId, setOverrideCategoryId] = React.useState(transaction.overrideCategoryId);
  const [overrideFixedExpense, setOverrideFixedExpense] = useState(transaction.overrideFixedExpense);
  const [overriddenFixedExpense, setOverriddenFixedExpense] = React.useState(transaction.overriddenFixedExpense);
  const [excludeFromReportCalculations, setExcludeFromReportCalculations] = useState(transaction.excludeFromReportCalculations);
  const [showEditTransactionMoreOptionsDialog, setShowEditTransactionMoreOptionsDialog] = React.useState(false);

  const handleEditTransactionMoreOptions = () => {
    setShowEditTransactionMoreOptionsDialog(true);
  };

  const handleSaveTransactionMoreOptions = (transaction: Transaction) => {
    setOverriddenFixedExpense(transaction.overriddenFixedExpense);
    setOverrideFixedExpense(transaction.overrideFixedExpense);
    setExcludeFromReportCalculations(transaction.excludeFromReportCalculations);
    console.log('handleSaveTransactionMoreOptions');
    console.log(transaction);
  };

  const handleCloseEditTransactionMoreOptionsDialog = () => {
    setShowEditTransactionMoreOptionsDialog(false);
  }

  const handleSave = () => {
    const updatedTransaction: Transaction = {
      ...transaction,
      userDescription,
      overrideCategory,
      overrideCategoryId,
      overrideFixedExpense,
      overriddenFixedExpense,
      excludeFromReportCalculations,
    };
    console.log('handleSave');
    console.log(updatedTransaction);
    props.onSave(updatedTransaction);
    props.onClose();
  };

  function handleSetOverrideCategory(event: ChangeEvent<HTMLInputElement>, checked: boolean): void {
    setOverrideCategory(event.target.checked);
  }

  function handleSetOverrideCategoryId(categoryId: string): void {
    setOverrideCategoryId(categoryId);
  }

  return (
    <React.Fragment>
      <EditTransactionMoreOptionsDialog
        open={showEditTransactionMoreOptionsDialog}
        transactionId={props.transactionId}
        onClose={handleCloseEditTransactionMoreOptionsDialog}
        onSave={handleSaveTransactionMoreOptions}
      />
      <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '300px' }}>
            <TextField
              label="Transaction Date"
              value={formatDate(transaction.transactionDate)}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              sx={{ marginTop: '6px' }}
            />
            <TextField
              label="Amount"
              value={formatCurrency(-transaction.amount)}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />
            <TextField
              label="Description"
              value={userDescription}
              onChange={(event) => setUserDescription(event.target.value)}
              fullWidth
            />
            <TextField
              label="Inferred Category"
              value={inferredCategory?.name || 'Uncategorized'}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />
            <FormControlLabel
              control={<Checkbox checked={overrideCategory} onChange={handleSetOverrideCategory} />}
              label="Override category?"
            />
            {overrideCategory && (
              <SelectCategory
                selectedCategoryId={overrideCategoryId}
                onSetCategoryId={handleSetOverrideCategoryId}
              />
            )}
            <Button onClick={handleEditTransactionMoreOptions}>More options</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default EditTransactionDialog;
