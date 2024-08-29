import React from 'react';

import Box from '@mui/material/Box';
import { FormControlLabel, RadioGroup, FormControl, FormLabel, Radio, Slider, Typography } from '@mui/material';
import { getCategoryById } from '../selectors';
import { Category, useTypedSelector } from '../types';

export interface SetImportanceDialogProps {
  categoryId: string;
}

const SetImportanceDialog: React.FC<SetImportanceDialogProps> = (props: SetImportanceDialogProps) => {

  const category: Category | undefined = useTypedSelector(state => getCategoryById(state, props.categoryId));
  const [consensusImportance, setConsensusImportance] = React.useState<number | undefined>(category ? category.consensusImportance : 5);
  const [loriImportance, setLoriImportance] = React.useState<number | undefined>(category ? category.loriImportance : 6);
  const [tedImportance, setTedImportance] = React.useState<number | undefined>(category ? category.tedImportance : 6);
  const [importanceType, setImportanceType] = React.useState<'consensus' | 'individual'>(category?.consensusImportance !== undefined ? 'consensus' : 'individual');
  const [error, setError] = React.useState<string | null>(null);

  const marks = [
    {
      value: 0,
      label: 'None',
    },
    {
      value: 1,
      label: 'Min',
    },
    {
      value: 6,
      label: 'Medium',
    },
    {
      value: 10,
      label: 'Max',
    },
  ];

  const handleImportanceTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportanceType(event.target.value as 'consensus' | 'individual');
    setError(null);
  };

  return (
    <React.Fragment>
      <FormControl component="fieldset" style={{ marginTop: '16px', marginLeft: '0px' }}>
        <FormLabel component="legend">Importance Type</FormLabel>
        <RadioGroup
          value={importanceType}
          onChange={handleImportanceTypeChange}
          style={{ flexDirection: 'row' }}
        >
          <FormControlLabel value="consensus" control={<Radio />} label="Consensus Importance" />
          <FormControlLabel value="individual" control={<Radio />} label="Individual Importance" />
        </RadioGroup>
      </FormControl>
      {importanceType === 'consensus' && (
        <Box style={{ marginTop: '16px' }}>
          <Typography gutterBottom>Consensus Importance</Typography>
          <Slider
            value={consensusImportance}
            onChange={(event, newValue) => setConsensusImportance(newValue as number)}
            min={0}
            max={10}
            step={1}
            marks={marks}
            valueLabelDisplay="auto"
          />
        </Box>
      )}
      {importanceType === 'individual' && (
        <Box style={{ marginTop: '16px' }}>
          <Typography gutterBottom>Lori Importance</Typography>
          <Slider
            value={loriImportance}
            onChange={(event, newValue) => setLoriImportance(newValue as number)}
            min={0}
            max={10}
            step={1}
            marks={marks}
            valueLabelDisplay="auto"
          />
          <Typography gutterBottom style={{ marginTop: '16px' }}>Ted Importance</Typography>
          <Slider
            value={tedImportance}
            onChange={(event, newValue) => setTedImportance(newValue as number)}
            min={0}
            max={10}
            step={1}
            marks={marks}
            valueLabelDisplay="auto"
          />
        </Box>
      )}
      {error && <div style={{ color: 'red', marginTop: '10px', wordWrap: 'break-word' }}>{error}</div>}
    </React.Fragment>
  );
};

export default SetImportanceDialog;
