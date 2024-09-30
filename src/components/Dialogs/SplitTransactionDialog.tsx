import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, IconButton,
  Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { CategoryAssignmentRule, CheckingAccountTransaction, SplitTransactionUI } from '../../types';
import { getCategoryAssignmentRules, getTransactionById } from '../../selectors';

import { useTypedSelector } from '../../types';

import SplitTransactionDescription from './SplitTransactionDescription';

interface SplitTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  onSave: (splits: SplitTransactionUI[]) => any;
}

interface CategoryAssignmentRuleOption {
  value: CategoryAssignmentRule | null;
  label: string;
}

const SplitTransactionDialog: React.FC<SplitTransactionDialogProps> = (props: SplitTransactionDialogProps) => {

  const transaction = useTypedSelector(state => getTransactionById(state, props.transactionId)) as CheckingAccountTransaction;
  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));

  const { open, onClose, onSave } = props;

  const [splits, setSplits] = React.useState<SplitTransactionUI[]>([
    { amount: Math.abs(transaction.amount).toString(), userDescription: 'Remainder' },
  ]);
  const amountRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (transaction.amount.toString() !== splits[0].amount) {
      setSplits([{ amount: Math.abs(transaction.amount).toString(), userDescription: 'Remainder' }]);
    }
  }, [transaction.amount]);

  React.useEffect(() => {
    if (open) {
      handleAddSplit();
    }
  }, [open]);

  if (!props.open) {
    return null;
  }

  let categoryAssignmentRuleOptions: CategoryAssignmentRuleOption[] = [];

  if (open) {
    categoryAssignmentRuleOptions = categoryAssignmentRules.map((categoryAssignmentRule: CategoryAssignmentRule) => {
      return {
        value: categoryAssignmentRule,
        label: categoryAssignmentRule.pattern,
      };
    });
    categoryAssignmentRuleOptions.sort((a: any, b: any) => {
      const nameA = a.label.toUpperCase(); // ignore upper and lowercase
      const nameB = b.label.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
  }

  const handleSplitChange = (index: number, field: string, value: string) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    console.log('handleDescriptionChange', index, value);
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], userDescription: value };
    setSplits(newSplits);
    console.log('newSplit', newSplits);
  }

  const handleAmountBlur = (index: number) => {
    const newSplits = [...splits];
    const value = newSplits[index].amount.replace(/^\$/, '');
    const amount = parseFloat(value);

    if (isNaN(amount)) {
      newSplits[index].amount = '';
      setSplits(newSplits);
      if (amountRefs.current[index]) {
        amountRefs.current[index]!.focus();
      }
    } else {
      newSplits[index].amount = amount.toString();
      setSplits(newSplits);
      adjustRemainderAmount(newSplits);
    }
  };

  const handleAddSplit = () => {
    setSplits([
      ...splits.slice(0, -1),
      { amount: '0', userDescription: '' },
      splits[splits.length - 1],
    ]);
    setTimeout(() => {
      if (amountRefs.current[splits.length - 1]) {
        amountRefs.current[splits.length - 1]!.focus();
      }
    }, 0);
  };

  const handleDeleteSplit = (index: number) => {
    const newSplits = splits.filter((_, i) => i !== index);
    setSplits(newSplits);
    adjustRemainderAmount(newSplits);
  };

  const adjustRemainderAmount = (newSplits: SplitTransactionUI[]) => {
    const totalSplitAmount = newSplits.slice(0, -1).reduce((sum, split) => sum + parseFloat(split.amount || '0'), 0);
    const remainderAmount = Math.abs(transaction.amount) - totalSplitAmount;

    if (remainderAmount === 0) {
      newSplits = newSplits.slice(0, -1); // Remove the "Remainder" split
    } else {
      newSplits[newSplits.length - 1].amount = remainderAmount.toString();
    }

    setSplits(newSplits);
  };

  const handleSave = () => {
    const totalAmount = splits.reduce((sum, split) => sum + parseFloat(split.amount || '0'), 0);
    if (totalAmount !== Math.abs(transaction.amount)) {
      alert('The total amount of splits must equal the transaction amount.');
      return;
    }
    const negativeSplits = splits.map(split => ({
      ...split,
      amount: (-Math.abs(parseFloat(split.amount || '0'))).toString()
    }));
    onSave(negativeSplits);
    onClose();
  };

  const renderCategoryAssignmentRuleSelect = (index: number, description: string): JSX.Element => {
    return (
      <SplitTransactionDescription
        splitIndex={index}
        description={description}
        onDescriptionChange={(index: number, val: string) => handleDescriptionChange(index, val)}
      />
    );
  };

  const renderPlaceholderSelect = (index: number): JSX.Element => {
    return (
      <SplitTransactionDescription
        splitIndex={index}
        description={''}
        onDescriptionChange={(index: number, val: string) => handleDescriptionChange(index, val)}
      />
    );
  };

  const renderRemainder = (index: number): JSX.Element => {
    return (
      <SplitTransactionDescription
        splitIndex={index}
        description={'Remainder'}
        onDescriptionChange={(index: number, val: string) => handleDescriptionChange(index, val)}
      />
    );
  };

  const renderSplitDescription = (index: number, split: SplitTransactionUI): JSX.Element => {
    if (split.userDescription === '') {
      return renderPlaceholderSelect(index);
    } else if (split.userDescription === 'Remainder') {
      return renderRemainder(index)
    } else {
      return renderCategoryAssignmentRuleSelect(index, split.userDescription);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Split Transaction</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate autoComplete="off" mt={2}>
          {splits.map((split, index) => (
            <Box key={index} mb={2} display="flex" alignItems="center">
              <TextField
                label="Amount"
                type="text"
                value={split.amount}
                onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                onBlur={() => handleAmountBlur(index)}
                onFocus={(e) => e.target.select()}
                fullWidth
                inputRef={(el) => (amountRefs.current[index] = el)}
                InputLabelProps={{ shrink: true }}
                style={{ marginRight: '8px' }}
              />
              {renderSplitDescription(index, split)}
              {split.userDescription !== 'Remainder' && (
                <IconButton onClick={() => handleDeleteSplit(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button onClick={handleAddSplit}>Add Split</Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitTransactionDialog;
