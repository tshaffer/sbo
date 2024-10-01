import React, { useEffect, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import { Statement } from '../types';

import '../styles/Grid.css';

interface TransactionsTableProps<T> {
  statements: T[];
  transactions: any[];
  onOverrideTransactionCategories?: (selectedTransactionIds: Set<string>) => void;
  getTransactionId: (transaction: any) => string;
  getStatementId: (statement: T) => string;
  renderTransactionRow: (transaction: any, selectedTransactionIds: Set<string>, handleTransactionSelectedChanged: (event: React.ChangeEvent<HTMLInputElement>, transactionId: string, checked: boolean) => void) => React.ReactNode;
  columnHeaders: string[];
  columnKeys: string[];
  tableContainerClassName: string;
}

const TransactionsTable = <T extends Statement,>({
  statements,
  transactions,
  onOverrideTransactionCategories,
  getTransactionId,
  getStatementId,
  renderTransactionRow,
  columnHeaders,
  columnKeys,
  tableContainerClassName,
}: TransactionsTableProps<T>) => {

  const location = useLocation();
  const navigate = useNavigate();

  const [sortColumn, setSortColumn] = useState<string>(columnKeys[1]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());

  const transactionId = new URLSearchParams(location.search).get('transactionId');
  console.log('TransactionsTable');
  console.log(transactionId);

  const transactionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    console.log('Transaction refs:', transactionRefs.current);
  }, [transactionRefs]);

  // After the component mounts, scroll to the transaction
  // useEffect(() => {
  //   if (transactionId && transactionRefs.current[transactionId]) {
  //     console.log('Attempting to scroll to transaction:', transactionId);

  //     setTimeout(() => {
  //       const transactionElement = transactionRefs.current[transactionId];
  //       if (transactionElement) {
  //         console.log('Scrolling to:', transactionElement);

  //         console.log('transactionElement id:', transactionId);
  //         // transactionElement.parentElement?.scrollTo({ top: 800, behavior: 'smooth' });
  //         // transactionElement.parentElement?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  //         // the following line of code actually works
  //         transactionElement.parentElement?.parentElement?.scrollTo({ top: 1200, behavior: 'smooth' });
  //         // transactionElement.parentElement?.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //       } else {
  //         console.log('Transaction element not found:', transactionId);
  //       }
  //     }, 1000); // Delay to ensure rendering is complete
  //   }
  // }, [transactionId]);

  // useEffect(() => {
  //   if (transactionId && transactionRefs.current[transactionId]) {
  //     console.log('Attempting to scroll to transaction:', transactionId);

  //     setTimeout(() => {
  //       const transactionElement = transactionRefs.current[transactionId];
  //       if (transactionElement) {
  //         const scrollableParent = transactionElement.parentElement?.parentElement;
  //         if (scrollableParent) {
  //           // Calculate the top position of the transaction relative to the scrollable container
  //           const scrollTop = transactionElement.offsetTop - scrollableParent.offsetTop;

  //           console.log(transactionElement.offsetTop, scrollableParent.offsetTop, scrollTop);

  //           scrollableParent.scrollTo({ top: scrollTop, behavior: 'smooth' });
  //         } else {
  //           console.log('Scrollable parent not found');
  //         }
  //       } else {
  //         console.log('Transaction element not found');
  //       }
  //     }, 1000); // Delay to ensure rendering is complete
  //   }
  // }, [transactionId]);


  // useEffect(() => {
  //   if (transactionId && transactionRefs.current[transactionId]) {
  //     console.log('Attempting to scroll to transaction:', transactionId);

  //     setTimeout(() => {
  //       const transactionElement = transactionRefs.current[transactionId];
  //       if (transactionElement) {
  //         const scrollableParent = transactionElement.parentElement?.parentElement;

  //         if (scrollableParent) {
  //           // Get the bounding rect of the transaction element and its scrollable parent
  //           const transactionRect = transactionElement.getBoundingClientRect();
  //           const scrollableRect = scrollableParent.getBoundingClientRect();

  //           // Calculate the difference between the top of the transaction and the top of the scrollable container
  //           const scrollTop = transactionRect.top - scrollableRect.top + scrollableParent.scrollTop;

  //           console.log(transactionRect.top, scrollableRect.top, scrollTop); // Debugging info

  //           // Scroll the parent container to the calculated position
  //           scrollableParent.scrollTo({ top: scrollTop, behavior: 'smooth' });
  //         } else {
  //           console.log('Scrollable parent not found');
  //         }
  //       } else {
  //         console.log('Transaction element not found');
  //       }
  //     }, 1000); // Delay to ensure rendering is complete
  //   }
  // }, [transactionId]);

  // useEffect(() => {
  //   if (transactionId && transactionRefs.current[transactionId]) {
  //     console.log('Attempting to scroll to transaction:', transactionId);

  //     setTimeout(() => {
  //       const transactionElement = transactionRefs.current[transactionId];
  //       if (transactionElement) {
  //         let scrollableParent: any = transactionElement.parentElement;

  //         // Walk up the DOM to find the actual scrollable parent
  //         while (scrollableParent && !scrollableParent.scrollTop) {
  //           scrollableParent = scrollableParent.parentElement;
  //         }

  //         scrollableParent = transactionElement.parentElement?.parentElement;

  //         if (scrollableParent) {
  //           // Scroll to the transaction element's offset relative to the scrollable parent
  //           const scrollTop = transactionElement.offsetTop + scrollableParent.scrollTop;

  //           console.log(`Scrolling to transaction: ${transactionId}`);
  //           console.log('Transaction offsetTop:', transactionElement.offsetTop);
  //           console.log('Scrollable parent scrollTop:', scrollableParent.scrollTop);
  //           console.log('Calculated scrollTop:', scrollTop);

  //           // scrollableParent.scrollTo({ top: scrollTop, behavior: 'smooth' });
  //           scrollableParent.scrollTo({ top: 1200, behavior: 'smooth' });
  //         } else {
  //           console.log('Scrollable parent not found');
  //         }
  //       } else {
  //         console.log('Transaction element not found');
  //       }
  //     }, 1000); // Delay to ensure rendering is complete
  //   }
  // }, [transactionId]);

  // useEffect(() => {
  //   if (transactionId && transactionRefs.current[transactionId]) {
  //     console.log('Attempting to scroll to transaction:', transactionId);

  //     setTimeout(() => {
  //       const transactionElement = transactionRefs.current[transactionId];
  //       if (transactionElement) {
  //         // Directly use the known scrollable parent (in this case, it should be the grid container)
  //         // const scrollableParent = transactionElement.closest('.credit-card-statement-grid-table-container'); // Add the correct class name for your container

  //         const scrollableParent = transactionElement.parentElement?.parentElement

  //         if (scrollableParent) {
  //           // Use the element's offsetTop relative to the scrollable parent
  //           const transactionOffsetTop = transactionElement.offsetTop;

  //           console.log('Transaction offsetTop:', transactionOffsetTop);
  //           console.log('Scrollable parent scrollTop before scroll:', scrollableParent.scrollTop);

  //           // Scroll the parent container to the transaction element's offsetTop
  //           scrollableParent.scrollTo({ top: transactionOffsetTop, behavior: 'smooth' });

  //           console.log('Scrollable parent scrollTop after scroll:', scrollableParent.scrollTop);
  //         } else {
  //           console.log('Scrollable parent not found');
  //         }
  //       } else {
  //         console.log('Transaction element not found');
  //       }
  //     }, 1000); // Delay to ensure rendering is complete
  //   }
  // }, [transactionId]);

  // useEffect(() => {
  //   if (transactionId && transactionRefs.current[transactionId]) {
  //     console.log('Attempting to scroll to transaction:', transactionId);

  //     setTimeout(() => {
  //       const transactionElement = transactionRefs.current[transactionId];
  //       if (transactionElement) {

  //         const scrollableParent = transactionElement.closest('.credit-card-statement-grid-table-container'); // Add the correct class name for your container
  //         // const scrollableParent = transactionElement.parentElement?.parentElement;

  //         debugger;

  //         if (scrollableParent) {
  //           // Get the bounding rectangles for both the transaction element and the scrollable parent
  //           const transactionRect = transactionElement.getBoundingClientRect();
  //           const scrollableParentRect = scrollableParent.getBoundingClientRect();

  //           // Calculate the amount to scroll (difference between top of transaction and top of scrollable parent)
  //           const scrollAmount = transactionRect.top - scrollableParentRect.top;

  //           console.log('Transaction bounding rect:', transactionRect.top);
  //           console.log('Scrollable parent bounding rect:', scrollableParentRect.top);
  //           console.log('Scroll amount:', scrollAmount);

  //           // Scroll the parent container by the calculated amount
  //           scrollableParent.scrollTo({ top: scrollableParent.scrollTop + scrollAmount, behavior: 'smooth' });

  //           console.log('Scrollable parent scrollTop after scroll:', scrollableParent.scrollTop);
  //         } else {
  //           console.log('Scrollable parent not found');
  //         }
  //       } else {
  //         console.log('Transaction element not found');
  //       }
  //     }, 1000); // Delay to ensure rendering is complete
  //   }
  // }, [transactionId]);

  useEffect(() => {
    if (transactionId && transactionRefs.current[transactionId]) {
      console.log('Attempting to scroll to transaction:', transactionId);

      setTimeout(() => {
        const transactionElement = transactionRefs.current[transactionId];
        if (transactionElement) {
          const scrollableParent = transactionElement.closest('.credit-card-statement-grid-table-container'); // Replace with the correct class

          if (scrollableParent) {
            // Calculate the distance between the transactionElement and the scrollable parent
            const transactionOffsetTop = transactionElement.offsetTop; // The element's offset within its parent
            const parentScrollTop = scrollableParent.scrollTop; // The parent's current scroll position

            console.log('Transaction offsetTop:', transactionOffsetTop);
            console.log('Scrollable parent scrollTop before scroll:', parentScrollTop);

            // Scroll to the transaction element's offset position within the scrollable container
            scrollableParent.scrollTo({ top: transactionOffsetTop, behavior: 'smooth' });

            console.log('Scrollable parent scrollTop after scroll:', scrollableParent.scrollTop);
          } else {
            console.log('Scrollable parent not found');
          }
        } else {
          console.log('Transaction element not found');
        }
      }, 1000); // Delay to ensure rendering is complete
    }
  }, [transactionId]);

  // Determine the current statement and its index
  const { id } = useParams<{ id: string }>();
  const sortedStatements = cloneDeep(statements).sort((a, b) => b.endDate.localeCompare(a.endDate));

  const currentIndex: number = sortedStatements.findIndex(statement => statement.id === id);
  const previousStatement = sortedStatements[currentIndex + 1];
  const nextStatement = sortedStatements[currentIndex - 1];

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const handleTransactionSelectedChanged = (event: React.ChangeEvent<HTMLInputElement>, transactionId: string, checked: boolean) => {
    const newSelectedTransactionIds = new Set(selectedTransactionIds);

    if (checked) {
      newSelectedTransactionIds.add(transactionId);
    } else {
      newSelectedTransactionIds.delete(transactionId);
    }

    setSelectedTransactionIds(newSelectedTransactionIds);
  };

  const navigateToStatement = (statement: T | undefined) => {
    if (statement) {
      navigate(`/statements/${getStatementId(statement)}`);
    }
  };

  return (
    <React.Fragment>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button
          onClick={() => navigateToStatement(previousStatement)}
          disabled={!previousStatement}
        >
          Previous Statement
        </Button>
        <Button
          onClick={() => navigateToStatement(nextStatement)}
          disabled={!nextStatement}
        >
          Next Statement
        </Button>
      </Box>
      {onOverrideTransactionCategories && (
        <Button
          onClick={() => onOverrideTransactionCategories(selectedTransactionIds)}
          disabled={selectedTransactionIds.size === 0}
        >
          Override Selected
        </Button>
      )}
      <div className={tableContainerClassName}>
        <div className="grid-table-header">
          {columnHeaders.map((header, index) => (
            <div
              key={index}
              className="grid-table-cell"
              onClick={() => handleSort(columnKeys[index])}
            >
              {header}{sortColumn === columnKeys[index] ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
            </div>
          ))}
        </div>
        <div className="grid-table-body">
          {sortedTransactions.map(transaction => (
            <div
              className="grid-table-row"
              key={getTransactionId(transaction)}
              data-transaction-id={transaction.id}
              ref={el => (transactionRefs.current[transaction.id] = el)} // Store each row ref by transaction ID
            >
              {renderTransactionRow(transaction, selectedTransactionIds, handleTransactionSelectedChanged)}
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default TransactionsTable;
