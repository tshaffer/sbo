import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import { getAppInitialized } from '../selectors';
import { initializeServer } from '../controllers/app';
import { useDispatch, useTypedSelector } from '../types';
import { setAppInitialized } from '../models';

const Layout: React.FC = () => {

  const dispatch = useDispatch();

  const appInitialized: boolean = useTypedSelector(state => getAppInitialized(state));

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
    <div style={{ display: 'flex', height: '100vh' }}>
      <SideBar />
      <div style={{ flexGrow: 1, padding: '16px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;