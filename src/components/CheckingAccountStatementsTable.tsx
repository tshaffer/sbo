import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCheckingAccountStatements } from '../selectors';

const CheckingAccountStatementsTable: React.FC = () => {

  return (
    <div>poops</div>
  );
  // const checkingAccountStatements = useSelector(getCheckingAccountStatements);
  // const navigate = useNavigate();

  // const handleStatementClick = (id: string) => {
  //   navigate(`/statements/checking-account/${id}`);
  // };

  // return (
  //   <div>
  //     <h2>Checking Account Statements</h2>
  //     <table>
  //       <thead>
  //         <tr>
  //           <th>Name</th>
  //           <th>ID</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {checkingAccountStatements.map(statement => (
  //           <tr key={statement.id} onClick={() => handleStatementClick(statement.id)}>
  //             <td>{statement.name}</td>
  //             <td>{statement.id}</td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   </div>
  // );
};

export default CheckingAccountStatementsTable;
