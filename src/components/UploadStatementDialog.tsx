import React from 'react';
import { connect } from 'react-redux';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Alert, Button, DialogActions, DialogContent } from '@mui/material';
import { getAppInitialized, getCheckingAccountStatements, getCreditCardStatements } from '../selectors';
import { bindActionCreators } from 'redux';
import { loadCategories, loadCheckingAccountStatements, loadCreditCardStatements, loadMinMaxTransactionDates, uploadFile } from '../controllers';
import { TrackerDispatch } from '../types';
import { CheckingAccountStatement, CreditCardStatement } from '../types';

import { useDispatch, useTypedSelector } from '../types';

export interface UploadStatementDialogPropsFromParent {
  open: boolean;
  onClose: () => void;
}

export interface UploadStatementDialogProps extends UploadStatementDialogPropsFromParent {
  appInitialized: boolean;
  checkingAccountStatementState: CheckingAccountStatement[],
  creditCardStatementState: CreditCardStatement[],
  onUploadFile: (data: FormData) => any;
  onLoadCategories: () => any;
  onLoadCreditCardStatements: () => any;
  onLoadCheckingAccountStatements: () => any;
  onLoadMinMaxTransactionDates: () => any;
}

const UploadStatementDialog = (props: UploadStatementDialogProps) => {

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
      if (props.checkingAccountStatementState.some(statement => statement.fileName === selectedFile.name) || props.creditCardStatementState.some(statement => statement.fileName === selectedFile.name)) {
        setUploadStatus(selectedFile.name + ' has already been uploaded. Please select a different statement.');
        return;
      }
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append('files', file);
    });
    props.onUploadFile(formData)
    .then((response: any) => {
      setUploadStatus('success');
      props.onLoadCategories()
        .then(() => {
          return props.onLoadCreditCardStatements();
        })
        .then(() => {
          return props.onLoadCheckingAccountStatements();
        })
        .then(() => {
          return props.onLoadMinMaxTransactionDates();
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

function mapStateToProps(state: any) {
  return {
    appInitialized: getAppInitialized(state),
    checkingAccountStatementState: getCheckingAccountStatements(state),
    creditCardStatementState: getCreditCardStatements(state),
  };
}

const mapDispatchToProps = (dispatch: TrackerDispatch) => {
  return bindActionCreators({
    onUploadFile: uploadFile,
    onLoadCategories: loadCategories,
    onLoadCreditCardStatements: loadCreditCardStatements,
    onLoadCheckingAccountStatements: loadCheckingAccountStatements,
    onLoadMinMaxTransactionDates: loadMinMaxTransactionDates,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(UploadStatementDialog);



