import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { store } from '../models';

import Layout from './Layout';
import CategoriesTable from './CategoriesTable';
import Statements from './Statements';
import CheckingAccountStatementsTable from './CheckingAccountStatementsTable';
import CreditCardStatementsTable from './CreditCardStatementsTable';
import CreditCardStatementTable from './CreditCardStatementTable';

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
            element: <CreditCardStatementTable />,
          },
          {
            path: 'checking-account',
            element: <CheckingAccountStatementsTable />,
          },
        ],
      },
      {
        path: 'categories',
        element: <CategoriesTable />,
      },
      {
        path: 'category-assignment-rules',
        element: <div>Category Assignment Rules</div>,
      },
      {
        path: 'reports',
        element: <div>Reports</div>,
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