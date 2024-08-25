import React, { useRef, useEffect } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button, Checkbox, DialogActions, DialogContent, FormControlLabel, Tooltip } from '@mui/material';
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
  const [consensusDiscretionariness, setConsensusDiscretionariness] = React.useState<number | undefined>(undefined);
  const [loriDiscretionariness, setLoriDiscretionariness] = React.useState<number | undefined>(undefined);
  const [tedDiscretionariness, setTedDiscretionariness] = React.useState<number | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);

  const textFieldRef = useRef(null);

  useEffect(() => {
    setCategoryLabel('');
    setConsensusDiscretionariness(undefined);
    setLoriDiscretionariness(undefined);
    setTedDiscretionariness(undefined);
    setError(null);
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

  const handleClose = () => {
    onClose();
  };

  const handleAddCategory = (): void => {
    if (categoryLabel !== '') {
      // Validation
      if (consensusDiscretionariness !== undefined) {
        if (loriDiscretionariness !== undefined || tedDiscretionariness !== undefined) {
          setError('You cannot specify Lori or Ted Discretionariness if Consensus Discretionariness is set.');
          return;
        }
      } else if (loriDiscretionariness === undefined && tedDiscretionariness === undefined) {
        setError('You must specify at least one of Lori or Ted Discretionariness.');
        return;
      }

      // If validation passes, add the category
      props.onAddCategory(categoryLabel, isSubCategory, parentCategoryId, consensusDiscretionariness, loriDiscretionariness, tedDiscretionariness);
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
          <div style={{ paddingTop: '16px' }}>
            <TextField
              margin="normal"
              label="Consensus Discretionariness"
              type="number"
              value={consensusDiscretionariness !== undefined ? consensusDiscretionariness : ''}
              onChange={(event) => setConsensusDiscretionariness(event.target.value ? parseFloat(event.target.value) : undefined)}
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 10 } }}
            />
            <TextField
              margin="normal"
              label="Lori Discretionariness"
              type="number"
              value={loriDiscretionariness !== undefined ? loriDiscretionariness : ''}
              onChange={(event) => setLoriDiscretionariness(event.target.value ? parseFloat(event.target.value) : undefined)}
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 10 } }}
              disabled={consensusDiscretionariness !== undefined}
            />
            <TextField
              margin="normal"
              label="Ted Discretionariness"
              type="number"
              value={tedDiscretionariness !== undefined ? tedDiscretionariness : ''}
              onChange={(event) => setTedDiscretionariness(event.target.value ? parseFloat(event.target.value) : undefined)}
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 10 } }}
              disabled={consensusDiscretionariness !== undefined}
            />
          </div>
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
