import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Button, Accordion, AccordionSummary, AccordionDetails, Typography, Popper, Paper, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const SidebarMenuButton = {
  Reports: 'Reports',
  Categories: 'Categories',
  CategoryAssignmentRules: 'Category Assignment Rules',
  Statements: 'Statements',
};

const SideBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMenu, setCurrentMenu] = useState<string | null>(null);

  const handleHover = (event: React.MouseEvent<HTMLElement>, menu: string) => {
    setAnchorEl(event.currentTarget);
    setCurrentMenu(menu);
  };

  const handleClose = (menuItem: string) => {
    setAnchorEl(null);
    setCurrentMenu(null);
    // Here you might want to navigate to the selected item
  };

  const handleClickAway = () => {
    setAnchorEl(null);
    setCurrentMenu(null);
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
            aria-haspopup="true"
            onMouseEnter={(e) => handleHover(e, SidebarMenuButton.Reports)}
            onClick={() => handleClose('Spending')}
          >
            <span>{SidebarMenuButton.Reports}</span><ChevronRightIcon />
          </Button>
          <Popper
            id="reports-popper"
            open={Boolean(anchorEl) && currentMenu === SidebarMenuButton.Reports}
            anchorEl={anchorEl}
            placement="right-start"
            disablePortal={false}
            modifiers={[
              {
                name: 'offset',
                options: {
                  offset: [0, 0],
                },
              },
            ]}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClickAway}>
                <MenuList>
                  <MenuItem onClick={() => handleClose('Spending')}>
                    <NavLink to="/reports/spending">Spending</NavLink>
                  </MenuItem>
                  <MenuItem onClick={() => handleClose('FixedExpenses')}>
                    <NavLink to="/reports/fixed-expenses">Fixed Expenses</NavLink>
                  </MenuItem>
                  <MenuItem onClick={() => handleClose('UnidentifiedTransactions')}>
                    <NavLink to="/reports/unidentified-transactions">Unidentified Transactions</NavLink>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Popper>

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
            aria-haspopup="true"
            onMouseEnter={(e) => handleHover(e, SidebarMenuButton.Statements)}
            onClick={() => handleClose(SidebarMenuButton.Statements)}
          >
            <span>{SidebarMenuButton.Statements}</span><ChevronRightIcon />
          </Button>
          <Popper
            id="statements-popper"
            open={Boolean(anchorEl) && currentMenu === SidebarMenuButton.Statements}
            anchorEl={anchorEl}
            placement="right-start"
            disablePortal={false}
            modifiers={[
              {
                name: 'offset',
                options: {
                  offset: [0, 0],
                },
              },
            ]}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClickAway}>
                <MenuList>
                  <MenuItem onClick={() => handleClose('Credit Card')}>
                    <NavLink to="/statements/credit-card">Credit Card</NavLink>
                  </MenuItem>
                  <MenuItem onClick={() => handleClose('Checking Account')}>
                    <NavLink to="/statements/checking-account">Checking Account</NavLink>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Popper>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SideBar;
