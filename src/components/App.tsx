import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { store } from '../models';

import Layout from './Layout';
import Statements from './Statements';
import { CheckingAccountStatementsTable, CreditCardStatementsTable } from './AccountsStatementsTable';
import CategoryAssignmentRulesTable from './CategoryAssignmentRulesTable';
import ReportsContent from './ReportsContent';
import CategoriesContent from './CategoriesContent';
import CreditCardStatementTable from './CreditCardStatementTable';
import CheckingAccountStatementTable from './CheckingAccountStatementTable';
import { loadTransactions } from '../controllers/transactions';

const handleLoadTransactions = (startDate: string, endDate: string, includeCreditCardTransactions: boolean, includeCheckingAccountTransactions: boolean): any => {
  loadTransactions(startDate, endDate, includeCreditCardTransactions, includeCheckingAccountTransactions);
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'statements',
        element: <Statements />,
        children: [
          {
            path: 'credit-card',
            element: <CreditCardStatementsTable statements={[]} onLoadTransactions={(startDate, endDate) => handleLoadTransactions(startDate, endDate, true, false)} gridTemplateColumns={'40px 1fr 1fr 1fr 1fr 1fr'} />,
          },
          {
            path: 'credit-card/:id',
            element: <CreditCardStatementTable />,
          },
          {
            path: 'checking-account',
            element: <CheckingAccountStatementsTable statements={[]} onLoadTransactions={(startDate, endDate) => handleLoadTransactions(startDate, endDate, false, true)} gridTemplateColumns={'40px 1fr 1fr 1fr 1fr 1fr 1fr 1fr'} />,
          },
          {
            path: 'checking-account/:id',
            element: <CheckingAccountStatementTable />,
          },
        ],
      },
      {
        path: 'categories',
        element: <CategoriesContent />,
      },
      {
        path: 'category-assignment-rules',
        element: <CategoryAssignmentRulesTable />,
      },
      {
        path: 'reports',
        element: <ReportsContent activeTab={0} />,
      },
    ],
  },
]);

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default App;