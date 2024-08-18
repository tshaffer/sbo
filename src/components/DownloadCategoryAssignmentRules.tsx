import React from 'react';

import { Category, CategoryAssignmentRule, UploadedCategoryAssignmentRule } from '../types';
import { getCategories, getCategoryAssignmentRules } from '../selectors';

import { useTypedSelector } from '../types';

const DownloadCategoryAssignmentRules: React.FC = () => {

  const categories: Category[] = useTypedSelector(getCategories);
  const categoryAssignmentRules: CategoryAssignmentRule[] = useTypedSelector(getCategoryAssignmentRules);

  const handleDownload = async () => {

    // Transform the data
    const data: UploadedCategoryAssignmentRule[] = categoryAssignmentRules.map(rule => {
      const category = categories.find(cat => cat.id === rule.categoryId);
      return {
        categoryName: category ? category.name : 'Unknown',
        pattern: rule.pattern,
      };
    });

    // Convert to JSON
    const jsonString = JSON.stringify(data, null, 2);

    // Check if the browser supports the File System Access API
    if ('showSaveFilePicker' in window) {
      try {
        // Show save file picker
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: 'categoryAssignmentRules.json',
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });

        // Create a writable stream
        const writableStream = await fileHandle.createWritable();

        // Write the JSON data to the file
        await writableStream.write(jsonString);

        // Close the file
        await writableStream.close();

        console.log('File saved successfully');
      } catch (error) {
        console.error('Error saving file:', error);
      }
    } else {
      console.error('File System Access API is not supported in this browser.');
    }
  };

  return (
    <button onClick={handleDownload}>Download Category Assignment Rules</button>
  );
};

export default DownloadCategoryAssignmentRules;

