import React, { useRef, useEffect } from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Button, DialogActions, DialogContent, FormControlLabel, Tooltip, RadioGroup, FormControl, FormLabel, Radio, Slider, Typography, TextField } from '@mui/material';
import { getCategoryById } from '../selectors';
import { Category, useTypedSelector } from '../types';

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
  const [consensusImportance, setConsensusImportance] = React.useState<number | undefined>(category ? category.consensusImportance : 5);
  const [loriImportance, setLoriImportance] = React.useState<number | undefined>(category ? category.loriImportance : 6);
  const [tedImportance, setTedImportance] = React.useState<number | undefined>(category ? category.tedImportance : 6);
  const [importanceType, setImportanceType] = React.useState<'consensus' | 'individual'>(category?.consensusImportance !== undefined ? 'consensus' : 'individual');
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
      consensusImportance: importanceType === 'consensus' ? consensusImportance : undefined,
      loriImportance: importanceType === 'individual' ? loriImportance : undefined,
      tedImportance: importanceType === 'individual' ? tedImportance : undefined,
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

  const handleImportanceTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportanceType(event.target.value as 'consensus' | 'individual');
    setError(null);
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
          <FormControl component="fieldset" style={{ marginTop: '16px', marginLeft: '0px' }}>
            <FormLabel component="legend">Importance Type</FormLabel>
            <RadioGroup
              value={importanceType}
              onChange={handleImportanceTypeChange}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel value="consensus" control={<Radio />} label="Consensus Importance" />
              <FormControlLabel value="individual" control={<Radio />} label="Individual Importance" />
            </RadioGroup>
          </FormControl>
          {importanceType === 'consensus' && (
            <Box style={{ marginTop: '16px' }}>
              <Typography gutterBottom>Consensus Importance</Typography>
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
          )}
          {importanceType === 'individual' && (
            <Box style={{ marginTop: '16px' }}>
              <Typography gutterBottom>Lori Importance</Typography>
              <Slider
                value={loriImportance}
                onChange={(event, newValue) => setLoriImportance(newValue as number)}
                min={0}
                max={10}
                step={1}
                marks={marks}
                valueLabelDisplay="auto"
              />
              <Typography gutterBottom style={{ marginTop: '16px' }}>Ted Importance</Typography>
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
