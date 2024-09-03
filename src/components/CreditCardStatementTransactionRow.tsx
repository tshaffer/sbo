import React from 'react';
import { CreditCardTransactionRowInStatementTableProperties, useDispatch, useTypedSelector } from '../types';

import { v4 as uuidv4 } from 'uuid';

import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

import { CategoryAssignmentRule, CreditCardTransaction, Transaction } from '../types';
import { getTransactionById, findMatchingRule, MatchingRuleAssignment, categorizeTransaction, getCategories, getCategoryAssignmentRules, getCategoryById, getOverrideCategory, getOverrideCategoryId } from '../selectors';
import { formatCurrency, formatDate } from '../utilities';

import '../styles/Grid.css';
import { Tooltip, IconButton, Checkbox } from '@mui/material';
import EditTransactionDialog from './EditTransactionDialog';
import AddCategoryAssignmentRuleDialog from './AddCategoryAssignmentRuleDialog';
import { addCategoryAssignmentRule, updateTransaction } from '../controllers';

export interface CreditCardStatementProps {
  creditCardTransactionId: string;
  onSetCreditCardTransactionSelected: (creditCardTransactionId: string, selected: boolean) => any;
  sortedTransactions: CreditCardTransactionRowInStatementTableProperties[]
  selectedTransactionIds: Set<string>;
  onSetSelectedTransactionIds: (transactionIds: Set<string>) => any;
}

const CreditCardStatementTransactionRow: React.FC<CreditCardStatementProps> = (props: CreditCardStatementProps) => {

  const [transactionId, setTransactionId] = React.useState('');
  const [showAddCategoryAssignmentRuleDialog, setShowAddCategoryAssignmentRuleDialog] = React.useState(false);
  const [showEditTransactionDialog, setShowEditTransactionDialog] = React.useState(false);

  const [transactionSelected, setTransactionSelected] = React.useState(false);

  // const [selectedTransactionIds, setSelectedTransactionId] = React.useState<Set<string>>(new Set());

  const dispatch = useDispatch();

  const creditCardTransaction: CreditCardTransaction = useTypedSelector(state => getTransactionById(state, props.creditCardTransactionId)! as CreditCardTransaction);
  const matchingRule: MatchingRuleAssignment | null = useTypedSelector(state => findMatchingRule(state, creditCardTransaction));
  const categoryNameFromCategoryAssignmentRule: string = matchingRule ? matchingRule.category.name : '';
  const patternFromCategoryAssignmentRule: string | null = matchingRule ? matchingRule.pattern : null;
  const categoryNameFromCategoryOverride = useTypedSelector(state => getOverrideCategory(state, props.creditCardTransactionId)
    ? getCategoryById(state, getOverrideCategoryId(state, props.creditCardTransactionId))!.name
    : '');
  const categorizedTransactionName = useTypedSelector(state => categorizeTransaction(creditCardTransaction, getCategories(state), getCategoryAssignmentRules(state))?.name || '');

  const handleEditTransaction = () => {
    setShowEditTransactionDialog(true);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    dispatch(updateTransaction(transaction));
  };

  const handleCloseEditTransactionDialog = () => {
    setShowEditTransactionDialog(false);
  }

  const handleEditRule = (transaction: CreditCardTransaction) => {
    setTransactionId(transaction.id);
    setShowAddCategoryAssignmentRuleDialog(true);
  };

  const handleRemoveCategoryOverride = (transaction: CreditCardTransaction) => {
    const updatedTransaction: CreditCardTransaction = {
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

  // function handleToggleTransactionSelected(event: any, checked: boolean): void {
  //   setTransactionSelected(checked);
  //   props.onSetCreditCardTransactionSelected(creditCardTransaction.id, checked);
  // }
  const lastSelectedIndexRef = React.useRef<number | null>(null);
  
  function handleToggleTransactionSelected(event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void {
    const currentIndex = props.sortedTransactions.findIndex(transaction => transaction.id === creditCardTransaction.id);

    const isShiftPressed = (event.nativeEvent as MouseEvent).shiftKey;

    if (isShiftPressed && lastSelectedIndexRef.current !== null) {
      const start = Math.min(currentIndex, lastSelectedIndexRef.current);
      const end = Math.max(currentIndex, lastSelectedIndexRef.current);
      const newSelectedTransactionIds = new Set(props.selectedTransactionIds);

      for (let i = start; i <= end; i++) {
        if (checked) {
          newSelectedTransactionIds.add(props.sortedTransactions[i].id);
        } else {
          newSelectedTransactionIds.delete(props.sortedTransactions[i].id);
        }
      }

      props.onSetSelectedTransactionIds(newSelectedTransactionIds);
    } else {
      setTransactionSelected(checked);
      props.onSetCreditCardTransactionSelected(creditCardTransaction.id, checked);
    }

    lastSelectedIndexRef.current = currentIndex;
  }


  const renderEditIcon = (): JSX.Element => {
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

  return (
    <React.Fragment>
      <AddCategoryAssignmentRuleDialog
        open={showAddCategoryAssignmentRuleDialog}
        transactionId={transactionId}
        onClose={handleCloseAddRuleDialog}
        onSaveRule={handleSaveRule}
      />
      <EditTransactionDialog
        open={showEditTransactionDialog}
        transactionId={creditCardTransaction.id}
        onClose={handleCloseEditTransactionDialog}
        onSave={handleSaveTransaction}
      />

      <div className="grid-table-cell">
        <Checkbox
          checked={transactionSelected}
          onChange={handleToggleTransactionSelected}
        />
      </div>
      <div className="grid-table-cell">{formatDate(creditCardTransaction.transactionDate)}</div>
      <div className="grid-table-cell">{formatCurrency(creditCardTransaction.amount)}</div>
      <div className="grid-table-cell">{creditCardTransaction.description}</div>
      {renderEditIcon()}
      <div className="grid-table-cell">{creditCardTransaction.userDescription}</div>
      <div className="grid-table-cell">{categorizedTransactionName}</div>
      <div className="grid-table-cell">{creditCardTransaction.category}</div>
      <Tooltip title="Edit rule">
        <IconButton onClick={() => handleEditRule(creditCardTransaction)}>
          <AssignmentIcon />
        </IconButton>
      </Tooltip>
      <div className="grid-table-cell">{categoryNameFromCategoryAssignmentRule}</div>
      <div className="grid-table-cell">{patternFromCategoryAssignmentRule}</div>
      <div className="grid-table-cell">{categoryNameFromCategoryOverride}</div>
      <Tooltip title="Category Override">
        <IconButton
          onClick={() => handleRemoveCategoryOverride(creditCardTransaction)}
          disabled={!creditCardTransaction.overrideCategory}
        >
          {creditCardTransaction.overrideCategory ? <ToggleOnIcon /> : <ToggleOffIcon />}
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
}

export default CreditCardStatementTransactionRow;
