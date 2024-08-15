import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import { useDispatch } from 'react-redux';

const Layout: React.FC = () => {

  const dispatch = useDispatch();

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