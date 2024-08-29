import React from 'react';

import { v4 as uuidv4 } from 'uuid';

import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { Category, DisregardLevel, SidebarMenuButton } from '../types';
import AddCategoryDialog from './AddCategoryDialog';
import CategoriesTable from './CategoriesTable';
import { addCategory } from '../controllers';

import { useDispatch } from '../types';

const CategoriesContent: React.FC = () => {

  const dispatch = useDispatch();

  const [showAddCategoryDialog, setShowAddCategoryDialog] = React.useState(false);

  const handleAddCategory = (
    categoryLabel: string,
    isSubCategory: boolean,
    parentId: string,
    consensusImportance: number | undefined,
    loriImportance: number | undefined,
    tedImportance: number | undefined,
  ): void => {
    const id: string = uuidv4();
    const category: Category = {
      id,
      name: categoryLabel,
      parentId,
      disregardLevel: DisregardLevel.None,
      consensusImportance,
      loriImportance,
      tedImportance
    };
    dispatch(addCategory(category));
  };

  const handleCloseAddCategoryDialog = () => {
    setShowAddCategoryDialog(false);
  };

  return (
    <div>
      <AddCategoryDialog
        open={showAddCategoryDialog}
        onAddCategory={handleAddCategory}
        onClose={handleCloseAddCategoryDialog}
      />

      <Box sx={{ width: '100%' }}>
        <Typography variant="h5">{SidebarMenuButton.Categories}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowAddCategoryDialog(true)}
          >
            Add
          </Button>
        </Box>
        <Box>
          <CategoriesTable />
        </Box>
      </Box>
    </div>
  );
};

export default CategoriesContent;
