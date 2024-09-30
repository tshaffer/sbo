import React from 'react';
import { Statement, useDispatch, useTypedSelector } from '../types';
import { useParams } from 'react-router-dom';
import { getCreditCardStatements, getCreditCardTransactionRowInStatementTableProperties } from '../selectors';
import { CreditCardStatement, CreditCardTransactionRowInStatementTableProperties } from '../types';
import { loadTransactions, updateCategoryInTransactions } from '../controllers';
import CreditCardStatementTransactionRow from './Statements/CreditCardStatementTransactionRow';
import TransactionsTable from './TransactionsTable';
import OverrideTransactionCategoriesDialog from './OverrideTransactionCategoriesDialog';

const CreditCardTransactionsTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const [selectedTransactionIds, setSelectedTransactionId] = React.useState<Set<string>>(new Set());
  const [showOverrideTransactionCategoriesDialog, setShowOverrideTransactionCategoriesDialog] = React.useState(false);

  const statements: Statement[] = useTypedSelector(getCreditCardStatements);
  const transactions: CreditCardTransactionRowInStatementTableProperties[] = useTypedSelector(state => getCreditCardTransactionRowInStatementTableProperties(state, id!));

  const handleOverrideTransactionCategories = (selectedTransactionIds: Set<string>) => {
    setSelectedTransactionId(selectedTransactionIds);
    setShowOverrideTransactionCategoriesDialog(true);
  };

  const handleSaveOverrideTransactionCategories = (categoryId: string) => {
    dispatch(updateCategoryInTransactions(
      categoryId,
      Array.from(selectedTransactionIds),
    ));
  };

  const handleCloseOverrideTransactionCategoriesDialog = () => {
    setShowOverrideTransactionCategoriesDialog(false);
  }

  return (
    <React.Fragment>
      <OverrideTransactionCategoriesDialog
        open={showOverrideTransactionCategoriesDialog}
        onClose={handleCloseOverrideTransactionCategoriesDialog}
        onSave={handleSaveOverrideTransactionCategories}
      />
      <TransactionsTable
        statements={statements}
        transactions={transactions}
        onOverrideTransactionCategories={handleOverrideTransactionCategories}
        getTransactionId={(transaction: CreditCardTransactionRowInStatementTableProperties) => transaction.id}
        getStatementId={(statement: CreditCardStatement) => `credit-card/${statement.id}`}
        renderTransactionRow={(transaction, selectedTransactionIds, handleTransactionSelectedChanged) => (
          <CreditCardStatementTransactionRow
            creditCardTransactionId={transaction.id}
            transactionSelected={selectedTransactionIds.has(transaction.id)}
            onTransactionSelectedChanged={handleTransactionSelectedChanged}
          />
        )}
        columnHeaders={['', 'Date', 'Amount', '', '', 'Description', 'Category', 'Source', 'Comment', '']}
        columnKeys={['', 'transactionDate', 'amount', '', '', 'userDescription', 'categorizedTransactionName', '', 'comment', '']}
        tableContainerClassName="credit-card-statement-grid-table-container"
      />
    </React.Fragment>
  );
};

export default CreditCardTransactionsTable;
