import React, { useRef, useEffect, useState } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { isNil } from 'lodash';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button, DialogActions, DialogContent, DialogContentText, Tooltip } from '@mui/material';

import { getAppInitialized, getCategories, getCategoryByTransactionId, getTransactionById } from '../selectors';
import { Category, SidebarMenuButton, Transaction } from '../types';
import { addCategory, canAddCategoryAssignmentRule } from '../controllers';
import { TrackerDispatch } from '../models';
import SelectCategory from './SelectCategory';

export interface AddCategoryAssignmentRuleDialogPropsFromParent {
  open: boolean;
  transactionId: string;
  onSaveRule: (pattern: string, categoryId: string) => void;
  onClose: () => void;
}

export interface AddCategoryAssignmentRuleDialogProps extends AddCategoryAssignmentRuleDialogPropsFromParent {
  appInitialized: boolean;
  transaction: Transaction | undefined;
  categories: Category[];
  initialCategoryId: string | null | undefined;
  onAddCategory: (category: Category) => any;
  onCanAddCategoryAssignmentRule: (pattern: string) => any;
}

const AddCategoryAssignmentRuleDialog = (props: AddCategoryAssignmentRuleDialogProps) => {

  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const getTransactionDetails = (transaction: Transaction | undefined): string => {
    if (isNil(transaction) || isNil(transaction.userDescription)) {
      // debugger;
      return '';
    }
    return transaction.userDescription;
  }

  const { open, onClose } = props;

  const [pattern, setPattern] = React.useState(getTransactionDetails(props.transaction));
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>(props.initialCategoryId ?? '');
  const textFieldRef = useRef(null);

  useEffect(() => {
    setPattern(getTransactionDetails(props.transaction));
  }, [props.open, props.transactionId, props.transaction]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (open && textFieldRef.current) {
          (textFieldRef.current as any).focus();
          if (props.initialCategoryId) {
            setSelectedCategoryId(props.initialCategoryId);
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
      props.onCanAddCategoryAssignmentRule(pattern)
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
    if (isNil(props.transaction)) {
      return <></>;
    } else {
      return <TextField
        defaultValue={getTransactionDetails(props.transaction)}
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

function mapStateToProps(state: any, ownProps: AddCategoryAssignmentRuleDialogPropsFromParent) {
  return {
    appInitialized: getAppInitialized(state),
    transaction: getTransactionById(state, ownProps.transactionId),
    categories: getCategories(state),
    initialCategoryId: getCategoryByTransactionId(state, ownProps.transactionId)?.id,
  };
}

const mapDispatchToProps = (dispatch: TrackerDispatch) => {
  return bindActionCreators({
    onAddCategory: addCategory,
    onCanAddCategoryAssignmentRule: canAddCategoryAssignmentRule,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(AddCategoryAssignmentRuleDialog);
