import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Checkbox, List, ListItem, ListItemText, Typography, Box,
  Tab, Tabs, Slider, FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { addCategoryIdToExclude, removeCategoryIdToExclude, setConsensusDiscretionary, setConsensusValue, setLoriDiscretionary, setLoriValue, setMatchLowerDiscretionary, setTedDiscretionary, setTedValue, setIndividualDiscretionaryPriority } from '../models';
import { getCategories, getCategoryIdsToExclude } from '../selectors';
import { Category } from '../types';

import { useDispatch, useTypedSelector } from '../types';

export interface ReportFiltersDialogProps {
  open: boolean;
  onClose: () => void;
}

const ReportFiltersDialog = (props: ReportFiltersDialogProps) => {

  const dispatch = useDispatch();

  const categories: Category[] = useTypedSelector(getCategories);
  const categoryIdsToExclude: string[] = useTypedSelector(getCategoryIdsToExclude);

  const consensusDiscretionary: boolean = useTypedSelector(state => state.reportDataState.consensusDiscretionary);
  const loriDiscretionary: boolean = useTypedSelector(state => state.reportDataState.loriDiscretionary);
  const tedDiscretionary: boolean = useTypedSelector(state => state.reportDataState.tedDiscretionary);
  const consensusValue: number = useTypedSelector(state => state.reportDataState.consensusValue);
  const loriValue: number = useTypedSelector(state => state.reportDataState.loriValue);
  const tedValue: number = useTypedSelector(state => state.reportDataState.tedValue);
  const matchLowerDiscretionary: boolean = useTypedSelector(state => state.reportDataState.matchLowerDiscretionary);
  const individualDiscretionaryPriority: string = useTypedSelector(state => state.reportDataState.individualDiscretionaryPriority);

  const [tabIndex, setTabIndex] = useState(0);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleConsensusChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setConsensusDiscretionary(event.target.checked));
  };

  const handleLoriChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setLoriDiscretionary(event.target.checked));
  };

  const handleTedChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTedDiscretionary(event.target.checked));
  };

  const handleMatchLowerDiscretionary = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMatchLowerDiscretionary(event.target.checked));
  }

  const handleIndividualDiscretionaryPriorityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleIndividualDiscretionaryPriorityChange', event.target.value);
    dispatch(setIndividualDiscretionaryPriority(event.target.value));
  };


  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle sx={{ paddingBottom: '0px' }}>Report Filters</DialogTitle>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="Exclusions" />
        <Tab label="Discretionariness" />
      </Tabs>
      <DialogContent sx={{ paddingBottom: '0px' }}>
        {tabIndex === 0 && (
          <Box>
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
          </Box>
        )}
        {tabIndex === 1 && (
          <Box>
            <Typography variant="body1" gutterBottom>
              For each choice (consensus, Lori, and Ted), include the categories where the discretionariness is specified for that choice
              and the value matches (less than or greater than) the value specified here.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox checked={consensusDiscretionary} onChange={handleConsensusChecked} />
              }
              label="Consensus"
            />
            <Slider
              value={consensusValue}
              onChange={(e, newValue) => dispatch(setConsensusValue(newValue as number))}
              disabled={!consensusDiscretionary}
              min={0}
              max={10}
              step={1}
              valueLabelDisplay="auto"
            />
            <FormControlLabel
              control={
                <Checkbox checked={loriDiscretionary} onChange={handleLoriChecked} />
              }
              label="Lori"
            />
            <Slider
              value={loriValue}
              onChange={(e, newValue) => dispatch(setLoriValue(newValue as number))}
              disabled={!loriDiscretionary}
              min={0}
              max={10}
              step={1}
              valueLabelDisplay="auto"
            />
            <FormControlLabel
              control={
                <Checkbox checked={tedDiscretionary} onChange={handleTedChecked} />
              }
              label="Ted"
            />
            <Slider
              value={tedValue}
              onChange={(e, newValue) => dispatch(setTedValue(newValue as number))}
              disabled={!tedDiscretionary}
              min={0}
              max={10}
              step={1}
              valueLabelDisplay="auto"
            />
            <FormControlLabel
              control={
                <Checkbox checked={matchLowerDiscretionary} onChange={handleMatchLowerDiscretionary} />
              }
              label="Match lower discretionary"
            />
          <FormControl component="fieldset" style={{ marginTop: '16px', marginLeft: '0px' }}>
            <FormLabel component="legend">Priority when there are conflicting discretionary choices</FormLabel>
            <RadioGroup
              value={individualDiscretionaryPriority}
              onChange={handleIndividualDiscretionaryPriorityChange}
              style={{ flexDirection: 'row' }}
            >
              <FormControlLabel value="lori" control={<Radio />} label="Lori" />
              <FormControlLabel value="ted" control={<Radio />} label="Ted" />
            </RadioGroup>
          </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ paddingTop: '0px' }}>
        <Button onClick={props.onClose} color="primary" sx={{ mr: 2 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportFiltersDialog;
