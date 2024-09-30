import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Button, DialogActions, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { CategoryAssignmentRule, CreditCardTransaction, useDispatch, useTypedSelector, BankTransactionType, Transaction } from '../types';
import { getTransactionsByCategoryAssignmentRuleId } from '../controllers';
import { formatCurrency, formatDate } from '../utilities';
import { getCategoryAssignmentRuleById } from '../selectors';
import { useNavigate } from 'react-router-dom';

export interface CategoryAssignmentRuleTransactionsListDialogProps {
  open: boolean;
  categoryAssignmentRuleId: string;
  onClose: () => void;
}

const CategoryAssignmentRuleTransactionsListDialog: React.FC<CategoryAssignmentRuleTransactionsListDialogProps> = (props: CategoryAssignmentRuleTransactionsListDialogProps) => {

  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation

  const { open, categoryAssignmentRuleId, onClose } = props;

  const categoryAssignmentRule: CategoryAssignmentRule = useTypedSelector(state => getCategoryAssignmentRuleById(state, categoryAssignmentRuleId))!;
  const [transactions, setTransactions] = React.useState<CreditCardTransaction[]>([]);

  React.useEffect(() => {
    if (open) {
      const promise: Promise<CreditCardTransaction[]> = dispatch(getTransactionsByCategoryAssignmentRuleId(categoryAssignmentRuleId));
      promise.then((transactions: CreditCardTransaction[]) => {
        setTransactions(transactions);
      });
    }
  }, [dispatch, categoryAssignmentRuleId, open]);

  const handleClose = () => {
    onClose();
  };

  const handleNavigateToStatement = (transaction: Transaction) => {
    handleClose(); // Close the dialog before navigating

    // Ensure navigation happens after the dialog closes
    setTimeout(() => {
      const path = transaction.bankTransactionType === BankTransactionType.Checking
      ? `/statements/checking-account/${transaction.statementId}`
      : `/statements/credit-card/${transaction.statementId}`;
      navigate(`${path}?transactionId=${transaction.id}`);
    }, 300); // Timeout to ensure the dialog is fully closed before navigation
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Category Assignment Rule Transactions</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        {/* Pattern */}
        <Typography variant="subtitle1" gutterBottom style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
          Pattern: {categoryAssignmentRule.pattern}
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Override Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow
                    key={transaction.id}
                    hover
                    onClick={() => handleNavigateToStatement(transaction)} // Handle row click
                    style={{ cursor: 'pointer' }} // Change cursor to pointer for visual feedback
                  >
                    <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                    <TableCell>{formatCurrency(-transaction.amount)}</TableCell>
                    <TableCell>{transaction.userDescription}</TableCell>
                    <TableCell>{transaction.overrideCategory ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryAssignmentRuleTransactionsListDialog;
