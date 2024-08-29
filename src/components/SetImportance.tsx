import React, { useEffect } from 'react';
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, Typography } from '@mui/material';

interface SetImportanceProps {
  initialConsensusImportance?: number;
  initialLoriImportance?: number;
  initialTedImportance?: number;
  onImportanceChange: (importance: {
    consensusImportance?: number;
    loriImportance?: number;
    tedImportance?: number;
  }) => void;
  onError: (error: string | null) => void;
}

const SetImportance: React.FC<SetImportanceProps> = ({
  initialConsensusImportance,
  initialLoriImportance,
  initialTedImportance,
  onImportanceChange,
  onError,
}) => {
  const [consensusImportance, setConsensusImportance] = React.useState<number | undefined>(initialConsensusImportance);
  const [loriImportance, setLoriImportance] = React.useState<number | undefined>(initialLoriImportance);
  const [tedImportance, setTedImportance] = React.useState<number | undefined>(initialTedImportance);
  const [importanceType, setImportanceType] = React.useState<'consensus' | 'individual'>(
    initialConsensusImportance !== undefined ? 'consensus' : 'individual'
  );

  const marks = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Min' },
    { value: 6, label: 'Medium' },
    { value: 10, label: 'Max' },
  ];

  // Effect to handle validation and communicate changes
  useEffect(() => {
    if (importanceType === 'consensus' && consensusImportance !== undefined) {
      onImportanceChange({ consensusImportance });
      onError(null);
    } else if (importanceType === 'individual') {
      const defaultImportance = 5; // Default value to use when switching to individual
      const currentLoriImportance = loriImportance ?? defaultImportance;
      const currentTedImportance = tedImportance ?? defaultImportance;

      setLoriImportance(currentLoriImportance);
      setTedImportance(currentTedImportance);
      
      onImportanceChange({ loriImportance: currentLoriImportance, tedImportance: currentTedImportance });
      onError(null);
    } else {
      onError('Please specify the required Importance values correctly.');
    }
  }, [importanceType, consensusImportance, loriImportance, tedImportance, onImportanceChange, onError]);

  const handleImportanceTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as 'consensus' | 'individual';
    setImportanceType(newType);

    // Assign default values if switching to individual type
    if (newType === 'individual') {
      const defaultImportance = 5;
      if (loriImportance === undefined) {
        setLoriImportance(defaultImportance);
      }
      if (tedImportance === undefined) {
        setTedImportance(defaultImportance);
      }
    }
    
    onError(null); // Reset error on type change
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
    </React.Fragment>
  );
};

export default SetImportance;
