import React, { ChangeEvent, useState } from 'react';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, FormLabel, RadioGroup, Radio, Box,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography
} from '@mui/material';
import { CheckTransaction, Transaction } from '../types';
import { getTransactionById } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';
import SelectCategory from './SelectCategory';
import EditTransactionMoreOptionsDialog from './EditTransactionMoreOptionsDialog';

import { useTypedSelector } from '../types';

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
  const [excludeFromReportCalculations, setExcludeFromReportCalculations] = useState(check.excludeFromReportCalculations);

  interface DiscretionarinessParameters {
    enableDiscretionariness: boolean;
    discretionarinessOption: 'consensus' | 'individual';
    consensusDiscretionariness: number | undefined;
    loriDiscretionariness: number | undefined;
    tedDiscretionariness: number | undefined;
  }

  const getDiscretionarinessParameters = (): DiscretionarinessParameters => {
    if (check.consensusDiscretionariness !== undefined) {
      return {
        enableDiscretionariness: true,
        discretionarinessOption: 'consensus',
        consensusDiscretionariness: check.consensusDiscretionariness,
        loriDiscretionariness: undefined,
        tedDiscretionariness: undefined,
      };
    } else if (check.loriDiscretionariness !== undefined || check.tedDiscretionariness !== undefined) {
      return {
        enableDiscretionariness: true,
        discretionarinessOption: 'individual',
        consensusDiscretionariness: undefined,
        loriDiscretionariness: check.loriDiscretionariness,
        tedDiscretionariness: check.tedDiscretionariness || 5,
      };
    } else {
      return {
        enableDiscretionariness: false,
        discretionarinessOption: 'consensus',
        consensusDiscretionariness: undefined,
        loriDiscretionariness: undefined,
        tedDiscretionariness: undefined,
      };
    }
  }

  const discretionarinessParameters : DiscretionarinessParameters = getDiscretionarinessParameters();
  const [enableDiscretionariness, setEnableDiscretionariness] = useState(discretionarinessParameters.enableDiscretionariness);
  const [discretionarinessOption, setDiscretionarinessOption] = useState<'consensus' | 'individual'>(discretionarinessParameters.discretionarinessOption);
  const [consensusDiscretionariness, setConsensusDiscretionariness] = useState<number | undefined>(discretionarinessParameters.consensusDiscretionariness);
  const [loriDiscretionariness, setLoriDiscretionariness] = useState<number | undefined>(discretionarinessParameters.loriDiscretionariness);
  const [tedDiscretionariness, setTedDiscretionariness] = useState<number | undefined>(discretionarinessParameters.tedDiscretionariness);
  const [showEditTransactionMoreOptionsDialog, setShowEditTransactionMoreOptionsDialog] = React.useState(false);

  React.useEffect(() => {
    if (isCheckboxChecked) {
      setUserDescription(`Check number: ${checkNumber}, ${payee}`);
    }
  }, [checkNumber, payee, isCheckboxChecked]);

  if (!props.open) {
    return null;
  }

  const marks = [
    {
      value: 0,
      label: 'None',
    },
    {
      value: 1,
      label: 'Min',
    },
    {
      value: 6,
      label: 'Medium',
    },
    {
      value: 10,
      label: 'Max',
    },
  ];
  
  const handleEditTransactionMoreOptions = () => {
    setShowEditTransactionMoreOptionsDialog(true);
  };

  const handleSaveTransactionMoreOptions = (transaction: Transaction) => {
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
      excludeFromReportCalculations,
    };
    if (enableDiscretionariness) {
      if (discretionarinessOption === 'consensus') {
        updatedCheck.consensusDiscretionariness = consensusDiscretionariness;
        updatedCheck.loriDiscretionariness = undefined;
        updatedCheck.tedDiscretionariness = undefined;
      } else {
        updatedCheck.consensusDiscretionariness = undefined;
        updatedCheck.loriDiscretionariness = loriDiscretionariness;
        updatedCheck.tedDiscretionariness = tedDiscretionariness;
      }
    } else {
      updatedCheck.consensusDiscretionariness = undefined;
      updatedCheck.loriDiscretionariness = undefined;
      updatedCheck.tedDiscretionariness = undefined;
    }
    console.log('handleSave');
    console.log(updatedCheck);
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

  const handleEnableDiscretionarinessChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setEnableDiscretionariness(checked);
  };

  const handleDiscretionarinessOptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDiscretionarinessOption(event.target.value as 'consensus' | 'individual');
  };

  return (
    <React.Fragment>
      <EditTransactionMoreOptionsDialog
        open={showEditTransactionMoreOptionsDialog}
        transactionId={props.transactionId}
        onClose={handleCloseEditTransactionMoreOptionsDialog}
        onSave={handleSaveTransactionMoreOptions}
      />
      <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableDiscretionariness}
                  onChange={handleEnableDiscretionarinessChange}
                />
              }
              label="Set Discretionariness"
            />
            {enableDiscretionariness && (
              <Box sx={{ mt: 2 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Discretionariness Option</FormLabel>
                  <RadioGroup
                    row
                    aria-label="discretionariness-option"
                    name="discretionariness-option"
                    value={discretionarinessOption}
                    onChange={handleDiscretionarinessOptionChange}
                  >
                    <FormControlLabel value="consensus" control={<Radio />} label="Consensus" />
                    <FormControlLabel value="individual" control={<Radio />} label="Individual" />
                  </RadioGroup>
                </FormControl>
                {discretionarinessOption === 'consensus' ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography>Consensus Discretionariness</Typography>
                    <Slider
                      value={consensusDiscretionariness}
                      onChange={(event, newValue) => setConsensusDiscretionariness(newValue as number)}
                      min={0}
                      max={10}
                      step={1}
                      marks={marks}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography>Lori's Discretionariness</Typography>
                    <Slider
                      value={loriDiscretionariness}
                      onChange={(event, newValue) => setLoriDiscretionariness(newValue as number)}
                      min={0}
                      max={10}
                      step={1}
                      marks={marks}
                      valueLabelDisplay="auto"
                    />
                    <Typography sx={{ mt: 2 }}>Ted's Discretionariness</Typography>
                    <Slider
                      value={tedDiscretionariness}
                      onChange={(event, newValue) => setTedDiscretionariness(newValue as number)}
                      min={0}
                      max={10}
                      step={1}
                      marks={marks}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}
              </Box>
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
