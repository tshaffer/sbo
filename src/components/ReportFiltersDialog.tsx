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

export interface ReportFiltersDialogPropsFromParent {
  open: boolean;
  onClose: () => void;
}

interface ReportFiltersDialogProps extends ReportFiltersDialogPropsFromParent {
  categories: Category[];
  categoryIdsToExclude: Set<string>;
  onAddCategoryIdToExclude: (categoryId: string) => any;
  onRemoveCategoryIdToExclude: (categoryId: string) => any;
}

const ReportFiltersDialog = (props: ReportFiltersDialogProps) => {

  if (!props.open) {
    return null;
  }

  const handleToggle = (id: string) => () => {
    if (props.categoryIdsToExclude.has(id)) {
      props.onRemoveCategoryIdToExclude(id);
    } else {
      props.onAddCategoryIdToExclude(id);
    }
  };

  const areAllChecked: boolean = props.categories.length > 0 && props.categories.every(category => props.categoryIdsToExclude.has(category.id));
  const areSomeButNotAllChecked: boolean = props.categories.some(category => props.categoryIdsToExclude.has(category.id)) && !areAllChecked;
  const areNoneChecked: boolean = props.categories.length > 0 && props.categories.every(category => !props.categoryIdsToExclude.has(category.id));

  const handleMasterToggle = () => {

    const newCheckedState: boolean = areNoneChecked;

    props.categories.forEach(category => {
      if (newCheckedState) {
        props.onAddCategoryIdToExclude(category.id);
      } else {
        props.onRemoveCategoryIdToExclude(category.id);
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
            <ListItemText primary={areNoneChecked ? 'All': 'None'} />
          </Box>
        </Box>
        <Typography variant="body1" gutterBottom>
          Categories to exclude
        </Typography>
        <List sx={{ paddingTop: '0px', paddingBottom: '0px' }}>
          {props.categories.map((category) => (
            <ListItem key={category.id} sx={{ padding: '0px' }}>
              <Box display="flex" alignItems="center">
                <Checkbox
                  edge="start"
                  onChange={handleToggle(category.id)}
                  checked={props.categoryIdsToExclude.has(category.id)}
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

function mapStateToProps(state: any, ownProps: ReportFiltersDialogPropsFromParent) {
  return {
    categories: getCategories(state).slice().sort((a, b) => a.name.localeCompare(b.name)),
    categoryIdsToExclude: getCategoryIdsToExclude(state),
  };
}

const mapDispatchToProps = (dispatch: TrackerDispatch) => {
  return bindActionCreators({
    onAddCategoryIdToExclude: addCategoryIdToExclude,
    onRemoveCategoryIdToExclude: removeCategoryIdToExclude,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportFiltersDialog);
