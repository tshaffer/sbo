import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SidebarMenuButton } from '../types';

const SideBar: React.FC = () => {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMenu, setCurrentMenu] = useState<string | null>(null);

  const handleClose = (menuItem: string) => {
    setAnchorEl(null);
    setCurrentMenu(null);
    // Here you might want to navigate to the selected item
  };

  const buttonStyle = {
    justifyContent: 'space-between',
    textTransform: 'none',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Box
      sx={{
        width: '280px',
        minWidth: '280px',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        padding: '10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Accordion defaultExpanded>
        <AccordionSummary
          style={{
            minHeight: '0px',
            maxHeight: '22px',
            marginTop: '14px',
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography>Menu</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            sx={buttonStyle}
            onClick={() => handleClose('List')}
            component={NavLink}
            to="/categories"
          >
            <span>{SidebarMenuButton.Categories}</span><ChevronRightIcon />
          </Button>

          <Button
            sx={buttonStyle}
            onClick={() => handleClose('List')}
            component={NavLink}
            to="/category-assignment-rules"
          >
            <span>{SidebarMenuButton.CategoryAssignmentRules}</span><ChevronRightIcon />
          </Button>

          <Button
            sx={buttonStyle}
            onClick={() => handleClose('List')}
            component={NavLink}
            to="/reports"
          >
            <span>{SidebarMenuButton.Reports}</span><ChevronRightIcon />
          </Button>
          <Button
            sx={buttonStyle}
            onClick={() => handleClose('List')}
            component={NavLink}
            to="/statements"
          >
            <span>{SidebarMenuButton.Statements}</span><ChevronRightIcon />
          </Button>

          <Button
            sx={buttonStyle}
            onClick={() => handleClose('List')}
            component={NavLink}
            to="/transactions-by-category"
          >
            <span>{SidebarMenuButton.TransactionsByCategory}</span><ChevronRightIcon />
          </Button>

        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SideBar;

