import React from 'react';

import { v4 as uuidv4 } from 'uuid';

import SafetyDividerIcon from '@mui/icons-material/SafetyDivider';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

import { BankTransactionType, CategoryAssignmentRule, CheckTransaction, CheckingAccountTransaction, CheckingAccountTransactionType, SplitTransaction, SplitTransactionUI, Transaction } from '../../types';
import { categorizeTransaction } from '../../selectors';
import { formatCurrency, formatDate } from '../../utilities';

import '../../styles/Grid.css';
import { Tooltip, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import AddCategoryAssignmentRuleDialog from '../Dialogs/AddCategoryAssignmentRuleDialog';
import { addCategoryAssignmentRule, splitTransaction, updateTransaction } from '../../controllers';
import SplitTransactionDialog from '../Dialogs/SplitTransactionDialog';
import EditTransactionDialog from '../Dialogs/EditTransactionDialog';
import EditCheckFromStatementDialog from '../Dialogs/EditCheckFromStatementDialog';
import { useDispatch, useTypedSelector } from '../../types';

export interface CheckingAccountStatementProps {
  checkingAccountTransaction: CheckingAccountTransaction;
}

const CheckingAccountStatementTransactionRow: React.FC<CheckingAccountStatementProps> = (props: CheckingAccountStatementProps) => {

  const categorizedTransactionName = useTypedSelector(state => categorizeTransaction(state, props.checkingAccountTransaction)?.name || '');

  const [isEditingComment, setIsEditingComment] = React.useState(false);
  const [comment, setComment] = React.useState(props.checkingAccountTransaction.comment || "");

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

  const handleSaveComment = (checkingAccountTransaction: CheckingAccountTransaction) => {
    const updatedTransaction: CheckingAccountTransaction = {
      ...checkingAccountTransaction,
      comment,
    };
    dispatch(updateTransaction(updatedTransaction));

    setIsEditingComment(false);
  };

  const handleCancelComment = (checkingAccountTransaction: CheckingAccountTransaction) => {
    setComment(checkingAccountTransaction.comment || "");
    setIsEditingComment(false);
  }

  const handleSaveTransaction = (transaction: Transaction) => {
    dispatch(updateTransaction(transaction));
  };

  const handleCloseEditTransactionDialog = () => {
    setShowEditTransactionDialog(false);
  }

  const handleRemoveCategoryOverride = (transaction: CheckingAccountTransaction) => {
    const updatedTransaction: CheckingAccountTransaction = {
      ...transaction,
      overrideCategory: false,
      overrideCategoryId: ''
    };
    dispatch(updateTransaction(updatedTransaction));
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

  const handleSaveSplitTransaction = (splitTransactionsUI: SplitTransactionUI[]): void => {
    console.log('handleSaveSplitTransaction: ', splitTransactionsUI);
    const splitTransactions: SplitTransaction[] = splitTransactionsUI.map((splitTransactionUI: SplitTransactionUI) => {
      const splitTransaction: SplitTransaction = {
        ...splitTransactionUI,
        amount: parseFloat(splitTransactionUI.amount),
        id: '',
        parentTransactionId: '',
      };
      return splitTransaction;
    });

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

  const renderSplitTransactionIcon = (): JSX.Element | null => {
    return (
      <div className="grid-table-cell" style={{ marginLeft: '32px' }}>
        <Tooltip title="Split Transaction" arrow>
          <span>
            <IconButton onClick={handleSplitTransaction} disabled={props.checkingAccountTransaction.parentTransactionId !== ''}>
              <SafetyDividerIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>

    );
  }

  const renderRuleIcon = (): JSX.Element => {
    return (
      <div className="credit-card-statement-grid-table-cell">
        <Tooltip title="Edit rule">
          <IconButton onClick={() => handleEditRule(props.checkingAccountTransaction)}>
            <AssignmentIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  const renderCommentColumn = (checkingAccountTransaction: CheckingAccountTransaction): JSX.Element => {
    return (
      <div className="credit-card-statement-grid-table-cell">
        {isEditingComment ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <IconButton onClick={() => handleSaveComment(checkingAccountTransaction)}>
              <SaveIcon />
            </IconButton>
            <IconButton onClick={() => handleCancelComment(checkingAccountTransaction)}>
              <CancelIcon />
            </IconButton>
          </div>
        ) : (
          <div onClick={() => setIsEditingComment(true)}>
            {comment || <span style={{ color: "#aaa" }}>Add comment...</span>}
          </div>
        )}
      </div>
    );
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

      {renderSplitTransactionIcon()}
      <div className="grid-table-cell">{formatDate(props.checkingAccountTransaction.transactionDate)}</div>
      <div className="grid-table-cell">{formatCurrency(-props.checkingAccountTransaction.amount)}</div>
      {renderEditIcon()}
      {renderRuleIcon()}
      <div className="grid-table-cell">{props.checkingAccountTransaction.userDescription}</div>
      <div className="grid-table-cell">{categorizedTransactionName}</div>
      {renderCommentColumn(props.checkingAccountTransaction)}
      <Tooltip title="Category Override">
        <span>
          <IconButton
            onClick={() => handleRemoveCategoryOverride(props.checkingAccountTransaction)}
            disabled={!props.checkingAccountTransaction.overrideCategory}
          >
            {props.checkingAccountTransaction.overrideCategory ? <ToggleOnIcon /> : <ToggleOffIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </React.Fragment>
  );
}

export default CheckingAccountStatementTransactionRow;
