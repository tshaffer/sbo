import React, { Dispatch } from 'react';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';

import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import { setAppInitialized, store } from '../models';

import Layout from './Layout';
import { getAppInitialized } from '../selectors';
import { initializeServer } from '../controllers/app';
import { useDispatch } from '../types';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
    ]
  }
]);

const App = () => {

  const dispatch = useDispatch();

  const appInitialized: boolean = useSelector(state => getAppInitialized(state));

  React.useEffect(() => {
    if (!appInitialized) {
      dispatch(initializeServer())
        .then(() => {
          console.log('invoke onSetAppInitialized');
          return dispatch(setAppInitialized());
        }) as Promise<any>;
    }
  }, [appInitialized]);

  if (!appInitialized) {
    return null;
  }

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default App;