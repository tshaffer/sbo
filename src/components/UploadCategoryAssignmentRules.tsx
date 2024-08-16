import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Category, CategoryAssignmentRule, UploadedCategoryAssignmentRule } from '../types';
import { TrackerDispatch } from '../types';
import { getCategories, getCategoryAssignmentRules } from '../selectors';
import { replaceCategoryAssignmentRules } from '../controllers';

import { useDispatch, useTypedSelector } from '../types';

// export interface DownloadCategoryAssignmentRulesProps {
//   onReplaceCategoryAssignmentRules: (categoryAssignmentRules: CategoryAssignmentRule[]) => any;
// }

const UploadCategoryAssignmentRules: React.FC = () => {

  const dispatch = useDispatch();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const data: UploadedCategoryAssignmentRule[] = JSON.parse(jsonString);
          console.log('Uploaded data:', data);
          dispatch(replaceCategoryAssignmentRules(data));
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/json"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default UploadCategoryAssignmentRules;

