import React, {  } from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Button, DialogActions, DialogContent } from '@mui/material';
import SelectCategory from './SelectCategory';

export interface OverrideTransactionCategoriesDialogProps {
  open: boolean;
  onSave: (categoryId: string) => void;
  onClose: () => void;
}

const OverrideTransactionCategoriesDialog = (props: OverrideTransactionCategoriesDialogProps) => {

  const { open, onSave, onClose } = props;

  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>('');

  if (!open) {
    return null;
  }

  function handleSave(event: any): void {
    onSave(selectedCategoryId);
    onClose();
  }

  function handleCategoryChange(categoryId: string): void {
    setSelectedCategoryId(categoryId)
  }
  
  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select Category</DialogTitle>
        <DialogContent style={{ paddingBottom: '0px' }}>
          <div>
            <SelectCategory
              selectedCategoryId={selectedCategoryId}
              onSetCategoryId={handleCategoryChange}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} autoFocus variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OverrideTransactionCategoriesDialog;
