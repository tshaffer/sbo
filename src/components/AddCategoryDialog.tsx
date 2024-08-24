import React, { useRef, useEffect } from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button, Checkbox, DialogActions, DialogContent, FormControlLabel, Slider, Tooltip, Typography } from '@mui/material';
import SelectCategory from './SelectCategory';

export interface AddCategoryDialogProps {
  open: boolean;
  onAddCategory: (
    categoryLabel: string,
    isSubCategory: boolean,
    parentCategoryId: string,
  ) => void;
  onClose: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = (props: AddCategoryDialogProps) => {

  const { open, onClose } = props;

  const [categoryLabel, setCategoryLabel] = React.useState('');
  const [isSubCategory, setIsSubCategory] = React.useState(false);
  const [parentCategoryId, setParentCategoryId] = React.useState('');

  const [discretionarinessValue, setDiscretionarinessValue] = React.useState(5);
  const [consensusNecessityValue, setConsensusNecessityValue] = React.useState(5);
  const [consensusUtilityValue, setConsensusUtilityValue] = React.useState(5);
  const [loriNecessityValue, setLoriNecessityValue] = React.useState(5);
  const [loriUtilityValue, setLoriUtilityValue] = React.useState(5);
  const [tedUtilityValue, setTedUtilityValue] = React.useState(5);
  const [tedNecessityValue, setTedNecessityValue] = React.useState(5);

  const textFieldRef = useRef(null);

  useEffect(() => {
    setCategoryLabel('');
  }, [props.open]);

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
      label: 'Low',
    },
    {
      value: 5,
      label: 'Medium',
    },
    {
      value: 10,
      label: 'High',
    },
  ];

  const handleClose = () => {
    onClose();
  };

  const handleAddCategory = (): void => {
    if (categoryLabel !== '') {
      props.onAddCategory(categoryLabel, isSubCategory, parentCategoryId);
      props.onClose();
    }
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

  const handleSliderChange = (setter: any, newValue: number | number[]) => {
    setter(newValue as number);
  };
  
  return (
    <Dialog onClose={handleClose} open={open}>
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
          <Typography id="input-slider" gutterBottom>
            Discretionariness
          </Typography>
          <Slider
            value={typeof discretionarinessValue === 'number' ? discretionarinessValue : 0}
            onChange={(_, newValue: number | number[]) => handleSliderChange(setDiscretionarinessValue, newValue)}
            min={0}
            max={10}
            marks={marks}
            />
          <Typography id="input-slider" gutterBottom>
            Consensus Necessity
          </Typography>
          <Slider
            value={typeof consensusNecessityValue === 'number' ? consensusNecessityValue : 0}
            onChange={(_, newValue: number | number[]) => handleSliderChange(setConsensusNecessityValue, newValue)}
            min={0}
            max={10}
            marks={marks}
            />
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
          // disabled={!categoryLabel || (isSubCategory && !parentCategoryId)}
          >
            Add
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryDialog;



