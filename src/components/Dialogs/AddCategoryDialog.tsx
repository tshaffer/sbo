import React, { useRef, useEffect } from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Button, Checkbox, DialogActions, DialogContent, FormControlLabel, Tooltip, RadioGroup, FormControl, FormLabel, Radio, Slider, Typography, TextField } from '@mui/material';
import SelectCategory from '../SelectCategory';
import SetImportance from './SetImportance';

export interface AddCategoryDialogProps {
  open: boolean;
  onAddCategory: (
    categoryLabel: string,
    isSubCategory: boolean,
    parentCategoryId: string,
    consensusImportance?: number,
    loriImportance?: number,
    tedImportance?: number,
  ) => void;
  onClose: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = (props: AddCategoryDialogProps) => {
  const { open, onClose } = props;

  const [categoryLabel, setCategoryLabel] = React.useState('');
  const [isSubCategory, setIsSubCategory] = React.useState(false);
  const [parentCategoryId, setParentCategoryId] = React.useState('');
  const [consensusImportance, setConsensusImportance] = React.useState<number | undefined>(6);
  const [loriImportance, setLoriImportance] = React.useState<number | undefined>(6);
  const [tedImportance, setTedImportance] = React.useState<number | undefined>(6);
  const [error, setError] = React.useState<string | null>(null);

  const textFieldRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (open && textFieldRef.current) {
          (textFieldRef.current as any).focus();
        }
      }, 200);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const handleAddCategory = (): void => {
    if (categoryLabel === '') {
      setError('Category Label cannot be empty.');
      return;
    }
    if (isSubCategory && parentCategoryId === '') {
      setError('Parent Category cannot be empty for a subcategory.');
      return;
    }

    // If validation passes, add the category
    props.onAddCategory(categoryLabel, isSubCategory, parentCategoryId, consensusImportance, loriImportance, tedImportance);
    props.onClose();
  };

  const handleKeyDown = (event: { key: string; preventDefault: () => void; }) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleAddCategory();
    }
  };

  const handleIsSubCategoryChanged = (event: any) => {
    setIsSubCategory(event.target.checked);
    if (!event.target.checked) {
      setParentCategoryId('');
    }
  };

  function handleCategoryChange(categoryId: string): void {
    setParentCategoryId(categoryId);
  }

  const handleImportanceChange = (newImportanceValues: { consensusImportance?: number; loriImportance?: number; tedImportance?: number }) => {

    // Check for and update consensus importance
    if (newImportanceValues.consensusImportance !== undefined) {
      setConsensusImportance(newImportanceValues.consensusImportance);
      // Reset individual importances if switching to consensus
      setLoriImportance(undefined);
      setTedImportance(undefined);
    }

    // Check for and update Lori and Ted importances
    if (newImportanceValues.loriImportance !== undefined || newImportanceValues.tedImportance !== undefined) {
      if (newImportanceValues.loriImportance !== undefined) {
        setLoriImportance(newImportanceValues.loriImportance);
      }
      if (newImportanceValues.tedImportance !== undefined) {
        setTedImportance(newImportanceValues.tedImportance);
      }
      // Reset consensus importance if switching to individual
      setConsensusImportance(undefined);
    }
  };

  const handleError = (error: string | null) => {
    setError(error);
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Category</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onKeyDown={handleKeyDown}
        >
          <div style={{ paddingBottom: '8px' }}>
            <TextField
              margin="normal"
              label="Category Label"
              value={categoryLabel}
              onChange={(event) => setCategoryLabel(event.target.value)}
              fullWidth
            />
          </div>
          <FormControlLabel
            control={<Checkbox checked={isSubCategory} onChange={handleIsSubCategoryChanged} />}
            label="Is this a subcategory?"
          />
          {isSubCategory && (
            <SelectCategory
              selectedCategoryId={parentCategoryId}
              onSetCategoryId={handleCategoryChange}
            />
          )}
          <SetImportance
            initialConsensusImportance={consensusImportance}
            initialLoriImportance={loriImportance}
            initialTedImportance={tedImportance}
            onImportanceChange={handleImportanceChange}
            onError={handleError}
          />
          {error && <div style={{ color: 'red', marginTop: '10px', wordWrap: 'break-word' }}>{error}</div>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Tooltip title="Press Enter to add the category" arrow>
          <Button
            onClick={handleAddCategory}
            autoFocus
            variant="contained"
            color="primary"
          >
            Add
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryDialog;
