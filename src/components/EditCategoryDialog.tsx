import React, { useRef, useEffect } from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Button, DialogActions, DialogContent, FormControlLabel, Tooltip, RadioGroup, FormControl, FormLabel, Radio, Slider, Typography, TextField } from '@mui/material';
import { getCategoryById } from '../selectors';
import { Category, useTypedSelector } from '../types';
import SetImportance from './SetImportance';

export interface EditCategoryDialogProps {
  open: boolean;
  categoryId: string;
  onSave: (category: Category) => void;
  onClose: () => void;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = (props: EditCategoryDialogProps) => {

  const { open, onClose } = props;
  if (!open) {
    return null;
  }

  const category: Category | undefined = useTypedSelector(state => getCategoryById(state, props.categoryId));
  const [categoryLabel, setCategoryLabel] = React.useState(category ? category.name : '');
  const [consensusImportance, setConsensusImportance] = React.useState<number | undefined>(category ? category.consensusImportance : undefined);
  const [loriImportance, setLoriImportance] = React.useState<number | undefined>(category ? category.loriImportance : undefined);
  const [tedImportance, setTedImportance] = React.useState<number | undefined>(category ? category.tedImportance : undefined);
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

  const handleClose = () => {
    onClose();
  };

  const handleSaveCategory = (): void => {

    if (categoryLabel === '') {
      setError('Category Label cannot be empty.');
      return;
    }

    const updatedCategory: Category = {
      ...category!,
      name: categoryLabel,
      consensusImportance,
      loriImportance,
      tedImportance,
    }
    props.onSave(updatedCategory);
    props.onClose();

  };

  const handleKeyDown = (event: { key: string; preventDefault: () => void; }) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleSaveCategory();
    }
  };

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
      <DialogTitle>Edit Category</DialogTitle>
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
          <SetImportance
            initialConsensusImportance={category!.consensusImportance}
            initialLoriImportance={category!.loriImportance}
            initialTedImportance={category!.tedImportance}
            onImportanceChange={handleImportanceChange}
            onError={handleError}
          />
          {error && <div style={{ color: 'red', marginTop: '10px', wordWrap: 'break-word' }}>{error}</div>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSaveCategory}
          autoFocus
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCategoryDialog;
