import React, { ChangeEvent, useState } from 'react';
import { useTypedSelector } from '../types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box,
  Checkbox, FormControlLabel, RadioGroup, Radio, FormControl, FormLabel, Slider, Typography
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

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = (props: EditTransactionDialogProps) => {

  if (!props.open) {
    return null;
  }

  const transaction: Transaction = useTypedSelector(state => getTransactionById(state, props.transactionId)!);
  const inferredCategory: Category | null | undefined = useTypedSelector(state => getCategoryByTransactionId(state, props.transactionId));

  const [userDescription, setUserDescription] = useState(transaction.userDescription);
  const [overrideCategory, setOverrideCategory] = React.useState(transaction.overrideCategory);
  const [overrideCategoryId, setOverrideCategoryId] = React.useState(transaction.overrideCategoryId);
  const [excludeFromReportCalculations, setExcludeFromReportCalculations] = useState(transaction.excludeFromReportCalculations);

  interface ImportanceParameters {
    enableImportance: boolean;
    importanceOption: 'consensus' | 'individual';
    consensusImportance: number | undefined;
    loriImportance: number | undefined;
    tedImportance: number | undefined;
  }

  const getImportanceParameters = (): ImportanceParameters => {
    if (transaction.consensusImportance !== undefined) {
      return {
        enableImportance: true,
        importanceOption: 'consensus',
        consensusImportance: transaction.consensusImportance,
        loriImportance: undefined,
        tedImportance: undefined,
      };
    } else if (transaction.loriImportance !== undefined || transaction.tedImportance !== undefined) {
      return {
        enableImportance: true,
        importanceOption: 'individual',
        consensusImportance: undefined,
        loriImportance: transaction.loriImportance,
        tedImportance: transaction.tedImportance || 5,
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
    const updatedTransaction: Transaction = {
      ...transaction,
      userDescription,
      overrideCategory,
      overrideCategoryId,
      excludeFromReportCalculations,
    };
    if (enableImportance) {
      if (importanceOption === 'consensus') {
        updatedTransaction.consensusImportance = consensusImportance;
        updatedTransaction.loriImportance = undefined;
        updatedTransaction.tedImportance = undefined;
      } else {
        updatedTransaction.consensusImportance = undefined;
        updatedTransaction.loriImportance = loriImportance;
        updatedTransaction.tedImportance = tedImportance;
      }
    } else {
      updatedTransaction.consensusImportance = undefined;
      updatedTransaction.loriImportance = undefined;
      updatedTransaction.tedImportance = undefined;
    }
    console.log('handleSave');
    console.log(updatedTransaction);
    props.onSave(updatedTransaction);
    props.onClose();
  };

  const handleSetOverrideCategory = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setOverrideCategory(event.target.checked);
  }

  const handleSetOverrideCategoryId = (categoryId: string): void => {
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
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

export default EditTransactionDialog;
