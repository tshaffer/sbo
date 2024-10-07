import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { store } from '../models';

import Layout from './Layout';
import StatementsTablesContainer from './Statements/StatementsTablesContainer';
import CategoryAssignmentRulesTable from './CategoryAssignmentRules/CategoryAssignmentRulesTable';
import ReportsContent from './Reports/ReportsContent';
import CategoriesContent from './Categories/CategoriesContent';
import CreditCardTransactionsTable from './Statements/CreditCardTransactionsTable';
import CheckingAccountTransactionsTable from './Statements/CheckingAccountTransactionsTable';
import { CreditCardStatementsTable } from './Statements/CreditCardStatementsTable';
import { CheckingAccountStatementsTable } from './Statements/CheckingAccountStatementsTable';
import TransactionsByCategory from './TransactionsByCategory/TransactionsByCategory';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'statements/credit-card/:id',
        element: <CreditCardTransactionsTable />,
      },
      {
        path: 'statements/checking-account/:id',
        element: <CheckingAccountTransactionsTable />,
      },
      {
        path: 'statements',
        element: <StatementsTablesContainer />,
        children: [
          {
            path: 'credit-card',
            element: <CreditCardStatementsTable />,
          },
          {
            path: 'checking-account',
            element: <CheckingAccountStatementsTable />,
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
        element: <ReportsContent />,
      },
      {
        path: 'transactions-by-category',
        element: <TransactionsByCategory />,
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