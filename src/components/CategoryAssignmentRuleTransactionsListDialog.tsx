import React, {  } from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Button, DialogActions, DialogContent } from '@mui/material';
import { useDispatch } from '../types';
import { getTransactionsByCategoryAssignmentRuleId } from '../controllers';

export interface CategoryAssignmentRuleTransactionsListDialogProps {
  open: boolean;
  categoryAssignmentRuleId: string;
  onClose: () => void;
}

const CategoryAssignmentRuleTransactionsListDialog: React.FC<CategoryAssignmentRuleTransactionsListDialogProps> = (props: CategoryAssignmentRuleTransactionsListDialogProps) => {
  
  const dispatch = useDispatch();

  const { open, categoryAssignmentRuleId, onClose } = props;

  if (!open) {
    return null;
  }

  React.useEffect(() => {
    dispatch(getTransactionsByCategoryAssignmentRuleId(categoryAssignmentRuleId));
  }, []);


  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Category Assignment Rule Transactions</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <Box
          component="form"
          noValidate
          autoComplete="off"
        >
          <div>Pizza</div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryAssignmentRuleTransactionsListDialog;
