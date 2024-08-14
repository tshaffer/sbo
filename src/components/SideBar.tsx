import React from 'react';
import { NavLink } from 'react-router-dom';

const SideBar: React.FC = () => {
  return (
    <div>
      <NavLink to="/reports">Reports</NavLink>
      <NavLink to="/categories">Categories</NavLink>
      <NavLink to="/category-assignment-rules">Category Assignment Rules</NavLink>
      <NavLink to="/statements">Statements</NavLink>
    </div>
  );
};

export default SideBar;

