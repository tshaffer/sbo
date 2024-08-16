import React, { useState } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import { addCategoryIdToExclude, removeCategoryIdToExclude } from '../models';
import { getCategories, getCategoryIdsToExclude } from '../selectors';
import { Category, TrackerDispatch } from '../types';

import { useDispatch, useTypedSelector } from '../types';

export interface ReportFiltersDialogProps {
  open: boolean;
  onClose: () => void;
}

const ReportFiltersDialog = (props: ReportFiltersDialogProps) => {

  const dispatch = useDispatch();

  const categories: Category[] = useTypedSelector(getCategories);
  const categoryIdsToExclude: string[] = useTypedSelector(getCategoryIdsToExclude);

  if (!props.open) {
    return null;
  }

  const handleToggle = (id: string) => () => {
    if (categoryIdsToExclude.includes(id)) {
      dispatch(removeCategoryIdToExclude(id));
    } else {
      dispatch(addCategoryIdToExclude(id));
    }
  };

  const areAllChecked: boolean = categories.length > 0 && categories.every(category => categoryIdsToExclude.includes(category.id));
  const areSomeButNotAllChecked: boolean = categories.some(category => categoryIdsToExclude.includes(category.id)) && !areAllChecked;
  const areNoneChecked: boolean = categories.length > 0 && categories.every(category => !categoryIdsToExclude.includes(category.id));

  const handleMasterToggle = () => {

    const newCheckedState: boolean = areNoneChecked;

    categories.forEach(category => {
      if (newCheckedState) {
        dispatch(addCategoryIdToExclude(category.id));
      } else {
        dispatch(removeCategoryIdToExclude(category.id));
      }
    });
  };


  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle sx={{ paddingBottom: '0px' }}>Report Filters</DialogTitle>
      <DialogContent sx={{ paddingBottom: '0px' }}>
        <Box display="flex" alignItems="center" mb={0} mt={0}>
          <Checkbox
            edge="start"
            indeterminate={areSomeButNotAllChecked}
            checked={areAllChecked}
            onChange={handleMasterToggle}
          />
          <Box sx={{ marginLeft: '4px' }}>
            <ListItemText primary={areNoneChecked ? 'All' : 'None'} />
          </Box>
        </Box>
        <Typography variant="body1" gutterBottom>
          Categories to exclude
        </Typography>
        <List sx={{ paddingTop: '0px', paddingBottom: '0px' }}>
          {categories.map((category) => (
            <ListItem key={category.id} sx={{ padding: '0px' }}>
              <Box display="flex" alignItems="center">
                <Checkbox
                  edge="start"
                  onChange={handleToggle(category.id)}
                  checked={categoryIdsToExclude.includes(category.id)}
                />
                <Box sx={{ marginLeft: '4px' }}>
                  <ListItemText primary={category.name} />
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ paddingTop: '0px' }}>
        <Button onClick={props.onClose} color="primary" sx={{ mr: 2 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportFiltersDialog;
