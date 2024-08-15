import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import { getAppInitialized } from '../selectors';
import { initializeServer } from '../controllers/app';
import { useDispatch, useTypedSelector } from '../types';
import { setAppInitialized } from '../models';
import { loadCategories } from '../controllers/category';

const Layout: React.FC = () => {

  const dispatch = useDispatch();

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));
  
  React.useEffect(() => {
    if (!appInitialized) {
      console.log('invoke initializeServer');
      dispatch(initializeServer())
        .then(() => {
          console.log('invoke loadCategories');
          return dispatch(loadCategories())
            .then(() => {
              console.log('invoke onSetAppInitialized');
              return dispatch(setAppInitialized());
            }) as Promise<any>;
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