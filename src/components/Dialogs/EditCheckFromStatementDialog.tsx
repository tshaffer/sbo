import React, { ChangeEvent, useState } from 'react';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, FormLabel, RadioGroup, Radio, Box,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography
} from '@mui/material';
import { CheckTransaction, Transaction } from '../../types';
import { getTransactionById } from '../../selectors';
import { formatCurrency, formatDate } from '../../utilities';
import SelectCategory from '../SelectCategory';
import EditTransactionMoreOptionsDialog from './EditTransactionMoreOptionsDialog';

import { useTypedSelector } from '../../types';

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

  interface ImportanceParameters {
    enableImportance: boolean;
    importanceOption: 'consensus' | 'individual';
    consensusImportance: number | undefined;
    loriImportance: number | undefined;
    tedImportance: number | undefined;
  }

  const getImportanceParameters = (): ImportanceParameters => {
    if (check.consensusImportance !== undefined) {
      return {
        enableImportance: true,
        importanceOption: 'consensus',
        consensusImportance: check.consensusImportance,
        loriImportance: undefined,
        tedImportance: undefined,
      };
    } else if (check.loriImportance !== undefined || check.tedImportance !== undefined) {
      return {
        enableImportance: true,
        importanceOption: 'individual',
        consensusImportance: undefined,
        loriImportance: check.loriImportance,
        tedImportance: check.tedImportance || 5,
      };
    } else {
      return {
        enableImportance: false,
        importanceOption: 'consensus',
        consensusImportance: undefined,
        loriImportance: undefined,
        tedImportance: undefined,
      };
    }
  }

  const importanceParameters: ImportanceParameters = getImportanceParameters();
  const [enableImportance, setEnableImportance] = useState(importanceParameters.enableImportance);
  const [importanceOption, setImportanceOption] = useState<'consensus' | 'individual'>(importanceParameters.importanceOption);
  const [consensusImportance, setConsensusImportance] = useState<number | undefined>(importanceParameters.consensusImportance);
  const [loriImportance, setLoriImportance] = useState<number | undefined>(importanceParameters.loriImportance);
  const [tedImportance, setTedImportance] = useState<number | undefined>(importanceParameters.tedImportance);
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
    if (enableImportance) {
      if (importanceOption === 'consensus') {
        updatedCheck.consensusImportance = consensusImportance;
        updatedCheck.loriImportance = undefined;
        updatedCheck.tedImportance = undefined;
      } else {
        updatedCheck.consensusImportance = undefined;
        updatedCheck.loriImportance = loriImportance;
        updatedCheck.tedImportance = tedImportance;
      }
    } else {
      updatedCheck.consensusImportance = undefined;
      updatedCheck.loriImportance = undefined;
      updatedCheck.tedImportance = undefined;
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

  const handleEnableImportanceChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setEnableImportance(checked);
  };

  const handleImportanceOptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImportanceOption(event.target.value as 'consensus' | 'individual');
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
                  checked={enableImportance}
                  onChange={handleEnableImportanceChange}
                />
              }
              label="Set Importance"
            />
            {enableImportance && (
              <Box sx={{ mt: 2 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Importance Option</FormLabel>
                  <RadioGroup
                    row
                    aria-label="importance-option"
                    name="importance-option"
                    value={importanceOption}
                    onChange={handleImportanceOptionChange}
                  >
                    <FormControlLabel value="consensus" control={<Radio />} label="Consensus" />
                    <FormControlLabel value="individual" control={<Radio />} label="Individual" />
                  </RadioGroup>
                </FormControl>
                {importanceOption === 'consensus' ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography>Consensus Importance</Typography>
                    <Slider
                      value={consensusImportance}
                      onChange={(event, newValue) => setConsensusImportance(newValue as number)}
                      min={0}
                      max={10}
                      step={1}
                      marks={marks}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography>Lori's Importance</Typography>
                    <Slider
                      value={loriImportance}
                      onChange={(event, newValue) => setLoriImportance(newValue as number)}
                      min={0}
                      max={10}
                      step={1}
                      marks={marks}
                      valueLabelDisplay="auto"
                    />
                    <Typography sx={{ mt: 2 }}>Ted's Importance</Typography>
                    <Slider
                      value={tedImportance}
                      onChange={(event, newValue) => setTedImportance(newValue as number)}
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
