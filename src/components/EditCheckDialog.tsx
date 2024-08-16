import React, { ChangeEvent, useState } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { BankTransaction, Category, CheckTransaction, CheckingAccountTransaction, Transaction } from '../types';
import { TrackerDispatch } from '../types';
import { getUnidentifiedBankTransactionById, getCategories, getTransactionById } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';
import { isNil } from 'lodash';
import SelectCategory from './SelectCategory';

export interface EditCheckDialogPropsFromParent {
  open: boolean;
  unidentifiedBankTransactionId: string;
  onClose: () => void;
  onSave: (updatedCheck: CheckTransaction) => void;
}

interface EditCheckDialogProps extends EditCheckDialogPropsFromParent {
  check: CheckTransaction;
  categories: Category[];
}

const EditCheckDialog = (props: EditCheckDialogProps) => {

  const [payee, setPayee] = useState(props.check.payee);
  const [checkNumber, setCheckNumber] = useState(props.check.checkNumber);
  const [checkNumberError, setCheckNumberError] = useState<string | null>(null);
  const [userDescription, setUserDescription] = useState(props.check.userDescription);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [overrideCategory, setOverrideCategory] = React.useState(props.check.overrideCategory);
  const [overrideCategoryId, setOverrideCategoryId] = React.useState(props.check.overrideCategoryId);

  React.useEffect(() => {
    if (isCheckboxChecked) {
      setUserDescription(`Check number: ${checkNumber}, ${payee}`);
    }
  }, [checkNumber, payee, isCheckboxChecked]);

  if (!props.open) {
    return null;
  }

  const handleSave = () => {
    if (!validateCheckNumber(checkNumber)) {
      setCheckNumberError('Check number must be a valid number');
      return;
    }
    const updatedCheck: CheckTransaction = {
      ...props.check,
      payee,
      checkNumber,
      userDescription,
      overrideCategory,
      overrideCategoryId,
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
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Edit Check</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '300px' }}>
          <TextField
            label="Transaction Date"
            value={formatDate(props.check.transactionDate)}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
          />
          <TextField
            label="Amount"
            value={formatCurrency(-props.check.amount)}
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
  );
};

function mapStateToProps(state: any, ownProps: EditCheckDialogPropsFromParent) {
  const checkingAccountTransaction: Transaction | undefined = getTransactionById(state, ownProps.unidentifiedBankTransactionId);
  const check: BankTransaction | null = getUnidentifiedBankTransactionById(state, ownProps.unidentifiedBankTransactionId);
  return {
    check: !isNil(checkingAccountTransaction) ? checkingAccountTransaction as CheckTransaction : check as CheckTransaction,
    categories: getCategories(state),
  };
}

const mapDispatchToProps = (dispatch: TrackerDispatch) => {
  return bindActionCreators({
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(EditCheckDialog);
