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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'categories',
        element: <CategoriesTable />,
      },
      {
        path: 'statements',
        element: <Statements />,
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
    ]
  }
]);

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default App;