import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Checkbox, List, ListItem, ListItemText,
  Typography, Box
} from '@mui/material';

interface SimpleListDialogProps {
  open: boolean;
  onClose: () => void;
  items: { label: string }[];
  description?: string;
  spacing?: number;
}

const SimpleListDialog: React.FC<SimpleListDialogProps> = ({ open, onClose, items, description, spacing = 8 }) => {
  const [checked, setChecked] = useState<{ [key: number]: boolean }>({});

  const handleToggle = (index: number) => () => {
    setChecked(prevState => {
      const newChecked = { ...prevState, [index]: !prevState[index] };
      return newChecked;
    });
  };

  const handleMasterToggle = () => {
    const allChecked = areAllChecked();
    const newChecked = items.reduce((acc, _, index) => {
      acc[index] = !allChecked;
      return acc;
    }, {} as { [key: number]: boolean });

    setChecked(newChecked);
  };

  const areAllChecked = () => {
    return items.length > 0 && items.every((_, index) => checked[index]);
  };

  const areSomeChecked = () => {
    return items.some((_, index) => checked[index]) && !areAllChecked();
  };

  const masterChecked = areAllChecked();
  const indeterminate = areSomeChecked();

  const handleSave = () => {
    // Handle the save action, if needed
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{ paddingBottom: '0px' }}
      >
        Report Filters
      </DialogTitle>
      <DialogContent sx={{ paddingBottom: '0px' }}>
        <Box display="flex" alignItems="center" mb={0} mt={0}>
          <Checkbox
            edge="start"
            indeterminate={indeterminate}
            checked={masterChecked}
            onChange={handleMasterToggle}
          />
        </Box>
        <Typography variant="body1" gutterBottom>
          Categories to display
        </Typography>
        <List sx={{ paddingTop: '0px', paddingBottom: '0px' }}>
          {items.map((item, index) => (
            <ListItem key={index} sx={{ padding: '0px' }}>
              <Box display="flex" alignItems="center">
                <Checkbox
                  edge="start"
                  onChange={handleToggle(index)}
                  checked={checked[index] || false}
                />
                <Box sx={{ marginLeft: '4px' }}>
                  <ListItemText primary={item.label} />
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ paddingTop: '0px' }}>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleListDialog;