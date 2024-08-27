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
  const [consensusDiscretionariness, setConsensusDiscretionariness] = React.useState<number | undefined>(category ? category.consensusDiscretionariness : 5);
  const [loriDiscretionariness, setLoriDiscretionariness] = React.useState<number | undefined>(category ? category.loriDiscretionariness : 6);
  const [tedDiscretionariness, setTedDiscretionariness] = React.useState<number | undefined>(category ? category.tedDiscretionariness : 6);
  const [discretionarinessType, setDiscretionarinessType] = React.useState<'consensus' | 'individual'>(category?.consensusDiscretionariness !== undefined ? 'consensus' : 'individual');
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
      consensusDiscretionariness: discretionarinessType === 'consensus' ? consensusDiscretionariness : undefined,
      loriDiscretionariness: discretionarinessType === 'individual' ? loriDiscretionariness : undefined,
      tedDiscretionariness: discretionarinessType === 'individual' ? tedDiscretionariness : undefined,
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

  const handleDiscretionarinessTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiscretionarinessType(event.target.value as 'consensus' | 'individual');
    setError(null);
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
          <FormControl component="fieldset" style={{ marginTop: '16px', marginLeft: '0px' }}>
            <FormLabel component="legend">Discretionariness Type</FormLabel>
            <RadioGroup
              value={discretionarinessType}
              onChange={handleDiscretionarinessTypeChange}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel value="consensus" control={<Radio />} label="Consensus Discretionariness" />
              <FormControlLabel value="individual" control={<Radio />} label="Individual Discretionariness" />
            </RadioGroup>
          </FormControl>
          {discretionarinessType === 'consensus' && (
            <Box style={{ marginTop: '16px' }}>
              <Typography gutterBottom>Consensus Discretionariness</Typography>
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
          )}
          {discretionarinessType === 'individual' && (
            <Box style={{ marginTop: '16px' }}>
              <Typography gutterBottom>Lori Discretionariness</Typography>
              <Slider
                value={loriDiscretionariness}
                onChange={(event, newValue) => setLoriDiscretionariness(newValue as number)}
                min={0}
                max={10}
                step={1}
                marks={marks}
                valueLabelDisplay="auto"
              />
              <Typography gutterBottom style={{ marginTop: '16px' }}>Ted Discretionariness</Typography>
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
