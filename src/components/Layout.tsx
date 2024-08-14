import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

const Layout: React.FC = () => {
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