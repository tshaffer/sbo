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
  const [enableDiscretionariness, setEnableDiscretionariness] = useState(false);
  const [discretionarinessOption, setDiscretionarinessOption] = useState<'consensus' | 'individual'>('individual');
  const [consensusDiscretionariness, setConsensusDiscretionariness] = useState<number>(5);
  const [loriDiscretionariness, setLoriDiscretionariness] = useState<number>(5);
  const [tedDiscretionariness, setTedDiscretionariness] = useState<number>(5);
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
    if (enableDiscretionariness) {
      if (discretionarinessOption === 'consensus') {
        updatedTransaction.consensusDiscretionariness = consensusDiscretionariness;
        updatedTransaction.loriDiscretionariness = undefined;
        updatedTransaction.tedDiscretionariness = undefined;
      } else {
        updatedTransaction.consensusDiscretionariness = undefined;
        updatedTransaction.loriDiscretionariness = loriDiscretionariness;
        updatedTransaction.tedDiscretionariness = tedDiscretionariness;
      }
    } else {
      updatedTransaction.consensusDiscretionariness = undefined;
      updatedTransaction.loriDiscretionariness = undefined;
      updatedTransaction.tedDiscretionariness = undefined;
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

export default EditTransactionDialog;
