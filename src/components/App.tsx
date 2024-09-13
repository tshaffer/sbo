import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { store } from '../models';

import Layout from './Layout';
import Statements from './Statements';
import CategoryAssignmentRulesTable from './CategoryAssignmentRulesTable';
import ReportsContent from './ReportsContent';
import CategoriesContent from './CategoriesContent';
import CreditCardTransactionsTable from './CreditCardTransactionsTable';
import CheckingAccountTransactionsTable from './CheckingAccountTransactionsTable';
import { CreditCardStatementsTable } from './CreditCardStatementsTable';
import { CheckingAccountStatementsTable } from './CheckingAccountStatementsTable';

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
            element: <CreditCardStatementsTable />,
          },
          {
            path: 'credit-card/:id',
            element: <CreditCardTransactionsTable />,
          },
          {
            path: 'checking-account',
            element: <CheckingAccountStatementsTable />,
          },
          {
            path: 'checking-account/:id',
            element: <CheckingAccountTransactionsTable />,
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