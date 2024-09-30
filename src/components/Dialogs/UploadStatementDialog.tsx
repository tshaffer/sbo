import React from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Alert, Button, DialogActions, DialogContent } from '@mui/material';
import { getCheckingAccountStatements, getCreditCardStatements } from '../../selectors';
import { loadAllTransactions, loadCategories, loadCheckingAccountStatements, loadCreditCardStatements, loadMinMaxTransactionDates, uploadFile } from '../../controllers';
import { CheckingAccountStatement, CreditCardStatement } from '../../types';

import { useDispatch, useTypedSelector } from '../../types';

export interface UploadStatementDialogProps {
  open: boolean;
  onClose: () => void;
}

const UploadStatementDialog: React.FC<UploadStatementDialogProps> = (props: UploadStatementDialogProps) => {

  const checkingAccountStatementState: CheckingAccountStatement[] = useTypedSelector(getCheckingAccountStatements);
  const creditCardStatementState: CreditCardStatement[] = useTypedSelector(getCreditCardStatements);

  const dispatch = useDispatch();

  const { open, onClose } = props;

  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<any>(null); // null, 'success', or 'failure'

  if (!open) {
    return null;
  }

  const handleClose = () => {
    setUploadStatus(null);
    onClose();
  };

  const handleCloseErrorDialog = () => {
    setUploadStatus(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {

    console.log('selectedFiles:', selectedFiles);

    if (!selectedFiles) return;

    // check to see if any of the files have already been uploaded
    const selectedFilesArray: File[] = Array.from(selectedFiles);
    for (const selectedFile of selectedFilesArray) {
      if (checkingAccountStatementState.some(statement => statement.fileName === selectedFile.name) || creditCardStatementState.some(statement => statement.fileName === selectedFile.name)) {
        setUploadStatus(selectedFile.name + ' has already been uploaded. Please select a different statement.');
        return;
      }
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('files', file);
    });
    dispatch(uploadFile(formData))
    .then((response: any) => {
      setUploadStatus('success');
      dispatch(loadCategories())
        .then(() => {
          return dispatch(loadCreditCardStatements());
        })
        .then(() => {
          return dispatch(loadCheckingAccountStatements());
        })
        .then(() => {
          return dispatch(loadMinMaxTransactionDates());
        })
        .then(() => {
          return dispatch(loadAllTransactions());
        });

    }).catch((err: any) => {
      console.log('uploadFile returned error');
      console.log(err);
      setUploadStatus('Upload Failed: Please try again.');
    });

  };


  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Upload Statement</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <Box
          component="form"
          noValidate
          autoComplete="off"
        >
          <input type="file" multiple name="file" style={{ width: '500px' }} onChange={handleFileChange} />
          <br />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={handleUpload} autoFocus variant="contained" color="primary" >Upload</Button>
      </DialogActions>
      {uploadStatus && (
        <Dialog open={true} onClose={handleCloseErrorDialog}>
          <DialogContent>
            {uploadStatus === 'success' ? (
              <Alert severity="success">Upload Successful</Alert>
            ) : (
              <Alert severity="error">{uploadStatus}</Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseErrorDialog} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Dialog>
  );
};

export default UploadStatementDialog;



