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
    transactionsRequired: boolean,
  ) => void;
  onClose: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = (props: AddCategoryDialogProps) => {

  const { open, onClose } = props;

  const [categoryLabel, setCategoryLabel] = React.useState('');
  const [areTransactionsRequired, setAreTransactionsRequired] = React.useState(false);
  const [isSubCategory, setIsSubCategory] = React.useState(false);
  const [parentCategoryId, setParentCategoryId] = React.useState('');

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

  const handleClose = () => {
    onClose();
  };

  const handleAddCategory = (): void => {
    if (categoryLabel !== '') {
      props.onAddCategory(categoryLabel, isSubCategory, parentCategoryId, areTransactionsRequired);
      props.onClose();
    }
  };

  const handleKeyDown = (event: { key: string; preventDefault: () => void; }) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleAddCategory();
    }
  };

  const handleTransactionsRequiredChanged = (event: any) => {
    setAreTransactionsRequired(event.target.checked);
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
            control={<Checkbox checked={areTransactionsRequired} onChange={handleTransactionsRequiredChanged} />}
            label="Are all transactions in this category mandatory?"
          />
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



