import React from 'react';

import { v4 as uuidv4 } from 'uuid';

import SafetyDividerIcon from '@mui/icons-material/SafetyDivider';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';

import { BankTransactionType, CategoryAssignmentRule, CheckTransaction, CheckingAccountTransaction, CheckingAccountTransactionType, SplitTransaction, Transaction } from '../types';
import { categorizeTransaction, findMatchingRule, getCategories, getCategoryAssignmentRules, getCategoryById, getOverrideCategory, getOverrideCategoryId, MatchingRuleAssignment } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';

import '../styles/Grid.css';
import { Tooltip, IconButton } from '@mui/material';
import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import { addCategoryAssignmentRule, splitTransaction, updateTransaction } from '../controllers';
import SplitTransactionDialog from './SplitTransactionDialog';
import EditTransactionDialog from './EditTransactionDialog';
import EditCheckFromStatementDialog from './EditCheckFromStatementDialog';
import { useDispatch, useTypedSelector } from '../types';

export interface CheckingAccountStatementProps {
  checkingAccountTransaction: CheckingAccountTransaction;
}

const CheckingAccountStatementTransactionRow: React.FC<CheckingAccountStatementProps> = (props: CheckingAccountStatementProps) => {

  const matchingRule: MatchingRuleAssignment | null = useTypedSelector(state => findMatchingRule(state, props.checkingAccountTransaction));
  const categoryNameFromCategoryAssignmentRule: string = matchingRule ? matchingRule.category.name : '';
  const patternFromCategoryAssignmentRule = matchingRule ? matchingRule.pattern : '';
  const categoryById = useTypedSelector(state => getCategoryById(state, getOverrideCategoryId(state, props.checkingAccountTransaction.id)));
  const categoryNameFromCategoryOverride = useTypedSelector(state => getOverrideCategory(state, props.checkingAccountTransaction.id))
    ? categoryById!.name
    : '';
  const categorizedTransactionName = useTypedSelector(state => categorizeTransaction(props.checkingAccountTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '');

  const dispatch = useDispatch();

  const [transactionId, setTransactionId] = React.useState('');
  const [showSplitTransactionDialog, setShowSplitTransactionDialog] = React.useState(false);
  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = React.useState(false);
  const [showEditCheckDialog, setShowEditCheckDialog] = React.useState(false);

  function handleSplitTransaction(): void {
    console.log('Split Transaction', props.checkingAccountTransaction.id);
    setShowSplitTransactionDialog(true);
  }

  const handleEditRule = (transaction: CheckingAccountTransaction) => {
    setTransactionId(transaction.id);
    setShowAddCategoryAssignmentRuleDialog(true);
  };

  const handleEditCheck = () => {
    setShowEditCheckDialog(true);
  };

  const handleSaveCheck = (check: CheckTransaction) => {
    dispatch(updateTransaction(check));
  };

  const handleCloseEditCheckDialog = () => {
    setShowEditCheckDialog(false);
  }

  const handleEditTransaction = () => {
    setShowEditTransactionDialog(true);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    dispatch(updateTransaction(transaction));
  };

  const handleCloseEditTransactionDialog = () => {
    setShowEditTransactionDialog(false);
  }

  const handleSaveRule = (pattern: string, categoryId: string): void => {
    const id: string = uuidv4();
    const categoryAssignmentRule: CategoryAssignmentRule = {
      id,
      pattern,
      categoryId
    };
    console.log('handleSaveRule: ', categoryAssignmentRule, categoryAssignmentRule);
    dispatch(addCategoryAssignmentRule(categoryAssignmentRule));
  }

  const handleCloseAddRuleDialog = () => {
    setShowAddCategoryAssignmentRuleDialog(false);
  }

  const handleSaveSplitTransaction = (splitTransactions: any[]): void => {
    console.log('handleSaveSplitTransaction: ', splitTransactions);
    dispatch(splitTransaction(props.checkingAccountTransaction.id, splitTransactions));
  }

  const handleCloseAddSplitTransactionDialog = () => {
    setShowSplitTransactionDialog(false);
  }

  const renderEditIcon = (): JSX.Element => {
    if (props.checkingAccountTransaction.bankTransactionType === BankTransactionType.Checking) {
      if ((props.checkingAccountTransaction as CheckingAccountTransaction).checkingAccountTransactionType === CheckingAccountTransactionType.Check) {
        return (
          <div className="grid-table-cell">
            <Tooltip title="Set check number and payee">
              <IconButton onClick={() => handleEditCheck()}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          </div>
        );
      }
    }
    return (
      <div className="grid-table-cell">
        <Tooltip title="Edit transaction">
          <IconButton onClick={() => handleEditTransaction()}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  const renderEditCheckDialog = (): JSX.Element | null => {
    if (showEditCheckDialog) {
      return (
        <EditCheckFromStatementDialog
          open={showEditCheckDialog}
          transactionId={props.checkingAccountTransaction.id}
          onClose={handleCloseEditCheckDialog}
          onSave={handleSaveCheck}
        />
      );
    }
    return null;
  }

  return (
    <React.Fragment>
      <SplitTransactionDialog
        open={showSplitTransactionDialog}
        transactionId={props.checkingAccountTransaction.id}
        onClose={handleCloseAddSplitTransactionDialog}
        onSave={handleSaveSplitTransaction}
      />
      <AddCategoryAssignmentRuleDialog
        open={showAddCategoryAssignmentRuleDialog}
        transactionId={transactionId}
        onClose={handleCloseAddRuleDialog}
        onSaveRule={handleSaveRule}
      />
      {renderEditCheckDialog()}
      <EditTransactionDialog
        open={showEditTransactionDialog}
        transactionId={props.checkingAccountTransaction.id}
        onClose={handleCloseEditTransactionDialog}
        onSave={handleSaveTransaction}
      />

      <div className="grid-table-cell" style={{ marginLeft: '32px' }}>
        <Tooltip title="Split Transaction" arrow>
          <span>
            <IconButton onClick={handleSplitTransaction} disabled={props.checkingAccountTransaction.parentTransactionId !== ''}>
              <SafetyDividerIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
      <div className="grid-table-cell">{formatDate(props.checkingAccountTransaction.transactionDate)}</div>
      <div className="grid-table-cell">{formatCurrency(props.checkingAccountTransaction.amount)}</div>
      <div className="grid-table-cell">{props.checkingAccountTransaction.name}</div>
      {renderEditIcon()}
      <div className="grid-table-cell">{props.checkingAccountTransaction.userDescription}</div>
      <div className="grid-table-cell">
        <Tooltip title="Edit rule">
          <IconButton onClick={() => handleEditRule(props.checkingAccountTransaction)}>
            <AssignmentIcon />
          </IconButton>
        </Tooltip>
      </div>
      <div className="grid-table-cell">{categoryNameFromCategoryAssignmentRule}</div>
      <div className="grid-table-cell">{patternFromCategoryAssignmentRule}</div>
      <div className="grid-table-cell">{categoryNameFromCategoryOverride}</div>
      <div className="grid-table-cell">{categorizedTransactionName}</div>
    </React.Fragment>
  );
}

export default CheckingAccountStatementTransactionRow;
