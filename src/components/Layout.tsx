import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import { getAppInitialized } from '../selectors';
import { initializeServer } from '../controllers/app';
import { useDispatch, useTypedSelector } from '../types';
import { setAppInitialized } from '../models';
import { loadCategories } from '../controllers/category';
import { loadCheckingAccountStatements, loadCreditCardStatements } from '../controllers/statements';
import { loadCategoryAssignmentRules, loadMinMaxTransactionDates } from '../controllers';

const Layout: React.FC = () => {

  const dispatch = useDispatch();

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));

  React.useEffect(() => {
    if (!appInitialized) {
      dispatch(initializeServer())
        .then(() => {
          dispatch(loadCategories())
        })
        .then(() => {
          dispatch(loadCategoryAssignmentRules())
        })
        .then(() => {
          dispatch(loadCreditCardStatements())
        })
        .then(() => {
          dispatch(loadCheckingAccountStatements())
        })
        .then(() => {
          dispatch(loadMinMaxTransactionDates())
        })
        .then(() => {
          console.log('invoke onSetAppInitialized');
          dispatch(setAppInitialized())
        });
    }
  }, [appInitialized]);

  if (!appInitialized) {
    return null;
  }
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SideBar />
      <div style={{ flexGrow: 1, padding: '16px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;