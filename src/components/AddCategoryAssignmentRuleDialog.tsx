import React, { useRef, useEffect, useState } from 'react';

import { useDispatch, useTypedSelector } from '../types';


import { isNil } from 'lodash';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button, DialogActions, DialogContent, DialogContentText, Tooltip } from '@mui/material';

import { Category, SidebarMenuButton, Transaction } from '../types';
import SelectCategory from './SelectCategory';
import { getAppInitialized, getCategories, getCategoryByTransactionId, getTransactionById } from '../selectors';
import { canAddCategoryAssignmentRule } from '../controllers';

export interface AddCategoryAssignmentRuleDialogProps {
  open: boolean;
  transactionId: string;
  onSaveRule: (pattern: string, categoryId: string) => void;
  onClose: () => void;
}

const AddCategoryAssignmentRuleDialog = (props: AddCategoryAssignmentRuleDialogProps) => {

  const dispatch = useDispatch();

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));
  const transaction: Transaction | undefined = useTypedSelector(state => getTransactionById(state, props.transactionId));
  const categories: Category[] = useTypedSelector(state => getCategories(state));
  const initialCategoryId: string | null | undefined = useTypedSelector(state => getCategoryByTransactionId(state, props.transactionId)?.id);
  
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const getTransactionDetails = (transaction: Transaction | undefined): string => {
    if (isNil(transaction) || isNil(transaction.userDescription)) {
      // debugger;
      return '';
    }
    return transaction.userDescription;
  }

  const { open, onClose } = props;

  const [pattern, setPattern] = React.useState(getTransactionDetails(transaction));
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>(initialCategoryId ?? '');
  const textFieldRef = useRef(null);

  useEffect(() => {
    setPattern(getTransactionDetails(transaction));
  }, [props.open, props.transactionId, transaction]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (open && textFieldRef.current) {
          (textFieldRef.current as any).focus();
          if (initialCategoryId) {
            setSelectedCategoryId(initialCategoryId);
          } else {
            setSelectedCategoryId('');
          }
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

  const handleSaveRule = (): void => {
    if (selectedCategoryId === '') {
      setAlertDialogOpen(true);
      return;
    }
    if (pattern !== '') {
      dispatch(canAddCategoryAssignmentRule(pattern))
        .then((canAddCategoryRule: boolean) => {
          if (!canAddCategoryRule) {
            alert('Pattern already exists');
            return;
          }
          props.onSaveRule(pattern, selectedCategoryId);
          props.onClose();
          console.log('Category Assignment Rule added');
        })
        .catch((error: any) => {
          throw(error);
          console.log('Error adding category assignment rule: ', error);
          alert('Error: ' + error);
        });
    }
  };

  const handleKeyDown = (event: { key: string; preventDefault: () => void; }) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      handleSaveRule();
    }
  };

  function handleCategoryChange(categoryId: string): void {
    setSelectedCategoryId(categoryId)
  }

  const handleCloseAlertDialog = () => {
    setAlertDialogOpen(false);
  };

  const renderTransactionDetails = (): JSX.Element => {
    if (isNil(transaction)) {
      return <></>;
    } else {
      return <TextField
        defaultValue={getTransactionDetails(transaction)}
        inputProps={{ readOnly: true }}
        disabled
      />
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{SidebarMenuButton.CategoryAssignmentRules}</DialogTitle>
        <DialogContent style={{ paddingBottom: '0px' }}>
          <p>
            Each transaction will automatically be assigned a category based on the existing category associated with it, if available.
          </p>
          <p>
            In some cases, you may want to override the default category assignment by specifying rules based on text patterns found in the transaction's description or existing category. When a transaction matches one of these patterns, it will be assigned the associated category you have specified.
          </p>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            onKeyDown={handleKeyDown}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '500px' }}
          >
            {renderTransactionDetails()}
            <TextField
              label="Pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              inputRef={textFieldRef}
            />

            <div>
              <SelectCategory
                selectedCategoryId={selectedCategoryId}
                onSetCategoryId={handleCategoryChange}
              />
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Tooltip title="Press Enter to add the category assignment rule" arrow>
            <Button onClick={handleSaveRule} autoFocus variant="contained" color="primary">
              Save
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>

      <Dialog onClose={handleCloseAlertDialog} open={alertDialogOpen}>
        <DialogTitle id="alert-dialog-title">
          {'Category Required'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Please select a category for the rule.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlertDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddCategoryAssignmentRuleDialog;
