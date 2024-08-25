import React, { useRef, useEffect } from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Button, Checkbox, DialogActions, DialogContent, FormControlLabel, Tooltip, RadioGroup, FormControl, FormLabel, Radio, Slider, Typography, TextField } from '@mui/material';
import SelectCategory from './SelectCategory';

export interface AddCategoryDialogProps {
  open: boolean;
  onAddCategory: (
    categoryLabel: string,
    isSubCategory: boolean,
    parentCategoryId: string,
    consensusDiscretionariness?: number,
    loriDiscretionariness?: number,
    tedDiscretionariness?: number,
  ) => void;
  onClose: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = (props: AddCategoryDialogProps) => {
  const { open, onClose } = props;

  const [categoryLabel, setCategoryLabel] = React.useState('');
  const [isSubCategory, setIsSubCategory] = React.useState(false);
  const [parentCategoryId, setParentCategoryId] = React.useState('');
  const [consensusDiscretionariness, setConsensusDiscretionariness] = React.useState<number | undefined>(6);
  const [loriDiscretionariness, setLoriDiscretionariness] = React.useState<number | undefined>(6);
  const [tedDiscretionariness, setTedDiscretionariness] = React.useState<number | undefined>(6);
  const [discretionarinessType, setDiscretionarinessType] = React.useState<'consensus' | 'individual'>('consensus');
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
    props.onAddCategory(categoryLabel, isSubCategory, parentCategoryId, consensusDiscretionariness, loriDiscretionariness, tedDiscretionariness);
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
