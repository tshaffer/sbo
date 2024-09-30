import { Autocomplete, TextField, Tooltip } from '@mui/material';
import React from 'react';
import { CategoryAssignmentRule, StringToCategoryLUT, useTypedSelector } from '../../types';
import { getCategoryAssignmentRules, getCategoryAssignRuleByPattern, getCategoryByCategoryAssignmentRulePatterns } from '../../selectors';
import { isNil, isString } from 'lodash';

interface SplitTransactionDescriptionProps {
  splitIndex: number;
  description: string;
  onDescriptionChange: (splitIndex: number, description: string) => any;
}

interface CategoryAssignmentRuleOption {
  value: CategoryAssignmentRule | null;
  label: string;
}

const SplitTransactionDescription: React.FC<SplitTransactionDescriptionProps> = (props: SplitTransactionDescriptionProps) => {

  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(state => getCategoryAssignmentRules(state));
  const categoryAssignmentRule: CategoryAssignmentRule | undefined = useTypedSelector(state => getCategoryAssignRuleByPattern(state, props.description));
  const patternsToCategory: StringToCategoryLUT = useTypedSelector(state => getCategoryByCategoryAssignmentRulePatterns(state));

  console.log('patternsToCategory');
  console.log(patternsToCategory);

  let categoryAssignmentRuleOptions: CategoryAssignmentRuleOption[] = [];

  categoryAssignmentRuleOptions = categoryAssignmentRules.map((categoryAssignmentRule: CategoryAssignmentRule) => {
    return {
      value: categoryAssignmentRule,
      label: categoryAssignmentRule.pattern,
    };
  });
  categoryAssignmentRuleOptions.sort((a: any, b: any) => {
    const nameA = a.label.toUpperCase(); // ignore upper and lowercase
    const nameB = b.label.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });

  const handleAutoCompleteChange = (
    selectedCategoryAssignmentRuleOption: CategoryAssignmentRuleOption | string | null,
    existingCategoryAssignmentRule: CategoryAssignmentRule | null | undefined,
  ) => {
    console.log('handleAutoCompleteChange');
    console.log(selectedCategoryAssignmentRuleOption);
    console.log(existingCategoryAssignmentRule);

    if (isNil(selectedCategoryAssignmentRuleOption)) {
      console.log('selectedCategoryAssignmentRuleOption is null');
      return;
    }

    if (isString(selectedCategoryAssignmentRuleOption)) {
      props.onDescriptionChange(props.splitIndex, selectedCategoryAssignmentRuleOption);
    } else {
      let newCategoryAssignmentRule: CategoryAssignmentRule | null = null;
      for (const categoryAssignmentRule of categoryAssignmentRules) {
        if (categoryAssignmentRule.id === ((selectedCategoryAssignmentRuleOption as CategoryAssignmentRuleOption).value as CategoryAssignmentRule).id) {
          newCategoryAssignmentRule = categoryAssignmentRule;
          break;
        }
      }
      if (!isNil(newCategoryAssignmentRule)) {
        props.onDescriptionChange(props.splitIndex, newCategoryAssignmentRule.pattern);
      }
    }
  };

  const myIsOptionEqualToValue = (option: any, value: any) => {
    if (isNil(option.value)) {
      return (option.label === value.label);
    }

    if (isNil(option.value.id)) {
      return false;
    }
    if (isNil(value) || isNil(value.value) || isNil(value.value.id)) {
      return false;
    }

    return option.value.id === value.value.id;
  };

  const getTooltip = (option: string | CategoryAssignmentRuleOption) => {
    if (isString(option)) {
      return option;
    }
    return (option as CategoryAssignmentRuleOption).label + ' => ' + patternsToCategory[(option as CategoryAssignmentRuleOption).label].name;
  }

  let categoryAssignmentRuleOption: CategoryAssignmentRuleOption;
  if (!isNil(categoryAssignmentRule)) {
    categoryAssignmentRuleOption = { value: categoryAssignmentRule, label: categoryAssignmentRule.pattern };
  } else if (props.description === '') {
    categoryAssignmentRuleOption = { value: null, label: '' };
  } else {
    categoryAssignmentRuleOption = { value: null, label: props.description };
  };

  return (
    <Autocomplete
      freeSolo
      options={categoryAssignmentRuleOptions}
      value={categoryAssignmentRuleOption}
      autoHighlight={true}
      disablePortal
      id="splitTransactionDescriptionComboBox"
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="CategoryAssignmentRule" />}
      onChange={(event: any, newValue: string | CategoryAssignmentRuleOption | null) => {
        handleAutoCompleteChange(newValue as CategoryAssignmentRuleOption, categoryAssignmentRule);
      }}
      isOptionEqualToValue={myIsOptionEqualToValue}
      getOptionLabel={(option: string | CategoryAssignmentRuleOption) => (
        isString(option) ? option : (option as CategoryAssignmentRuleOption).label
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Tooltip title={getTooltip(option)} arrow>
            <span>{(isString(option) ? option : (option as CategoryAssignmentRuleOption).label)}</span>
          </Tooltip>
        </li>
      )}
    />
  )
};

export default SplitTransactionDescription;
