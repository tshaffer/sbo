import React, { ChangeEvent, useState } from 'react';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { BankTransaction, Category, CheckTransaction, CheckingAccountTransaction, Transaction } from '../types';
import { TrackerDispatch } from '../types';
import { getCategories, getTransactionById } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';
import { isNil } from 'lodash';
import SelectCategory from './SelectCategory';
import EditTransactionMoreOptionsDialog from './EditTransactionMoreOptionsDialog';

import { useDispatch, useTypedSelector } from '../types';

export interface EditCheckFromStatementDialogProps {
  transactionId: string;
  open: boolean;
  onClose: () => void;
  onSave: (updatedCheck: CheckTransaction) => void;
}

const EditCheckFromStatementDialog: React.FC<EditCheckFromStatementDialogProps> = (props: EditCheckFromStatementDialogProps) => {

  const checkingAccountTransaction: Transaction | undefined = useTypedSelector(state => getTransactionById(state, props.transactionId));

  const check: CheckTransaction = checkingAccountTransaction as CheckTransaction;

  const [payee, setPayee] = useState(check.payee);
  const [checkNumber, setCheckNumber] = useState(check.checkNumber);
  const [checkNumberError, setCheckNumberError] = useState<string | null>(null);
  const [userDescription, setUserDescription] = useState(check.userDescription);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [overrideCategory, setOverrideCategory] = React.useState(check.overrideCategory);
  const [overrideCategoryId, setOverrideCategoryId] = React.useState(check.overrideCategoryId);
  const [overrideFixedExpense, setOverrideFixedExpense] = useState(check.overrideFixedExpense);
  const [overriddenFixedExpense, setOverriddenFixedExpense] = React.useState(check.overriddenFixedExpense);
  const [excludeFromReportCalculations, setExcludeFromReportCalculations] = useState(check.excludeFromReportCalculations);
  const [showEditTransactionMoreOptionsDialog, setShowEditTransactionMoreOptionsDialog] = React.useState(false);

  React.useEffect(() => {
    if (isCheckboxChecked) {
      setUserDescription(`Check number: ${checkNumber}, ${payee}`);
    }
  }, [checkNumber, payee, isCheckboxChecked]);

  if (!props.open) {
    return null;
  }

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
    if (!validateCheckNumber(checkNumber)) {
      setCheckNumberError('Check number must be a valid number');
      return;
    }
    const updatedCheck: CheckTransaction = {
      ...check,
      payee,
      checkNumber,
      userDescription,
      overrideCategory,
      overrideCategoryId,
      overrideFixedExpense,
      overriddenFixedExpense,
      excludeFromReportCalculations,
    };
    props.onSave(updatedCheck);
    props.onClose();
  };

  const validateCheckNumber = (value: string): boolean => {
    return value === '' || !isNaN(Number(value));
  };

  const handleCheckNumberBlur = () => {
    if (!validateCheckNumber(checkNumber)) {
      setCheckNumberError('Check number must be a valid number');
    } else {
      setCheckNumberError(null);
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setIsCheckboxChecked(isChecked);
    if (isChecked) {
      setUserDescription(`Check number: ${checkNumber}, ${payee}`);
    }
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
        <DialogTitle>Edit Check</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '300px' }}>
            <TextField
              label="Transaction Date"
              value={formatDate(check.transactionDate)}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />
            <TextField
              label="Amount"
              value={formatCurrency(-check.amount)}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />
            <TextField
              label="Payee"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              fullWidth
            />
            <TextField
              label="Check Number"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value)}
              onBlur={handleCheckNumberBlur}
              error={!!checkNumberError}
              helperText={checkNumberError}
              fullWidth
            />
            <FormControlLabel
              control={<Checkbox checked={isCheckboxChecked} onChange={handleCheckboxChange} />}
              label="Derive description"
            />
            <TextField
              label="Description"
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              disabled={isCheckboxChecked}
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

export default EditCheckFromStatementDialog;
