import axios from "axios";

import { v4 as uuidv4 } from 'uuid';

import { serverUrl, apiUrlFragment, CategoryAssignmentRule, UploadedCategoryAssignmentRule, TrackerState, Category, TrackerAnyPromiseThunkAction, TrackerDispatch } from "../types";
import { getCategoryAssignmentRules, getCategoryByName, getMissingCategories } from "../selectors";
import { isNil } from "lodash";
import { addCategories } from "./category";
import { addCategoryAssignmentRules, addCategoryAssignmentRuleRedux, replaceCategoryAssignmentRulesRedux, updateCategoryAssignmentRuleRedux, updateCategoryInCategoryAssignmentRuleRedux, deleteCategoryAssignmentRuleByIdRedux, updatePatternInCategoryAssignmentRuleRedux } from "../models";

export const loadCategoryAssignmentRules = (): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'categoryAssignmentRules';

    return axios.get(path)
      .then((response: any) => {
        const categoryAssignmentRules: CategoryAssignmentRule[] = response.data;
        dispatch(addCategoryAssignmentRules(categoryAssignmentRules));
        return Promise.resolve();
      }).catch((error) => {
        console.log('error');
        console.log(error);
        return '';
      });
  };
};

export const canAddCategoryAssignmentRule = (pattern: string): TrackerAnyPromiseThunkAction => {
  return (dispatch: TrackerDispatch, getState: any) => {
    const categoryAssignmentRules: CategoryAssignmentRule[] = getCategoryAssignmentRules(getState());
    const categoryAssignmentRuleExists: boolean = categoryAssignmentRules.some((existingCategoryAssignmentRule) => {
      return existingCategoryAssignmentRule.pattern === pattern;
    });
    return Promise.resolve(!categoryAssignmentRuleExists);
  };
};

export const addCategoryAssignmentRule = (categoryAssignmentRule: CategoryAssignmentRule): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'addCategoryAssignmentRule';

    const addCategoryAssignmentRuleBody = categoryAssignmentRule;

    return axios.post(
      path,
      addCategoryAssignmentRuleBody
    ).then((response) => {
      dispatch(addCategoryAssignmentRuleRedux(categoryAssignmentRule));
      return Promise.resolve();
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
}

const convertUploadedCategoryAssignmentRulesToCategoryAssignmentRules = (state: TrackerState, uploadedCategoryAssignmentRules: UploadedCategoryAssignmentRule[]): CategoryAssignmentRule[] => {
  return uploadedCategoryAssignmentRules.map((uploadedCategoryAssignmentRule) => {
    const category: Category | undefined = getCategoryByName(state, uploadedCategoryAssignmentRule.categoryName);
    if (isNil(category)) {
      debugger;
    }
    return {
      id: uuidv4(),
      pattern: uploadedCategoryAssignmentRule.pattern,
      categoryId: category!.id,
    };
  });
}

const addMissingCategories = (state: TrackerState, uploadedCategoryAssignmentRules: UploadedCategoryAssignmentRule[]): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const missingCategoryNames: string[] = getMissingCategories(getState(), uploadedCategoryAssignmentRules);
    console.log('missingCategoryNames', missingCategoryNames);

    if (missingCategoryNames.length > 0) {
      const categoriesToAdd: Category[] = missingCategoryNames.map((categoryName) => {
        const category: Category = {
          id: uuidv4(),
          name: categoryName,
          parentId: '',
        };
        return category;
      });
      return dispatch(addCategories(categoriesToAdd))
        .then(() => {
          return Promise.resolve();
        });
    }
    return Promise.resolve();
  };
}

export const replaceCategoryAssignmentRules = (uploadedCategoryAssignmentRules: UploadedCategoryAssignmentRule[]): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    return dispatch(addMissingCategories(getState(), uploadedCategoryAssignmentRules))
      .then(() => {

        const categoryAssignmentRules: CategoryAssignmentRule[] = convertUploadedCategoryAssignmentRulesToCategoryAssignmentRules(getState(), uploadedCategoryAssignmentRules);

        const path = serverUrl + apiUrlFragment + 'replaceCategoryAssignmentRules';

        const replaceCategoryAssignmentRulesBody = categoryAssignmentRules;

        return axios.post(
          path,
          replaceCategoryAssignmentRulesBody
        ).then((response) => {
          dispatch(replaceCategoryAssignmentRulesRedux(categoryAssignmentRules));
          return Promise.resolve();
        }).catch((error) => {
          console.log('error');
          console.log(error);
          return '';
        });
      });

  };
}

export const updateCategoryAssignmentRule = (categoryAssignmentRule: CategoryAssignmentRule): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'updateCategoryAssignmentRule';

    const updateCategoryAssignmentRuleBody = categoryAssignmentRule;

    return axios.post(
      path,
      updateCategoryAssignmentRuleBody
    ).then((response) => {
      dispatch(updateCategoryAssignmentRuleRedux(categoryAssignmentRule));
      return Promise.resolve();
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
};

export const updatePatternInCategoryAssignmentRule = (categoryAssignmentRuleId: string, pattern: string): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'updatePatternInCategoryAssignmentRule';

    const updatePatternInCategoryAssignmentRuleBody = { id: categoryAssignmentRuleId, pattern };

    return axios.post(
      path,
      updatePatternInCategoryAssignmentRuleBody
    ).then((response) => {
      dispatch(updatePatternInCategoryAssignmentRuleRedux(updatePatternInCategoryAssignmentRuleBody));
      return Promise.resolve();
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };

};


export const updateCategoryInCategoryAssignmentRule = (categoryAssignmentRuleId: string, categoryId: string): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'updateCategoryInCategoryAssignmentRule';

    const updateCategoryInCategoryAssignmentRuleBody = { id: categoryAssignmentRuleId, categoryId };

    return axios.post(
      path,
      updateCategoryInCategoryAssignmentRuleBody
    ).then((response) => {
      dispatch(updateCategoryInCategoryAssignmentRuleRedux(updateCategoryInCategoryAssignmentRuleBody));
      return Promise.resolve();
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };

};

export const deleteCategoryAssignmentRule = (categoryAssignmentRuleId: string): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'deleteCategoryAssignmentRule';

    const deleteCategoryAssignmentRuleBody = { id: categoryAssignmentRuleId };

    return axios.post(
      path,
      deleteCategoryAssignmentRuleBody
    ).then((response) => {
      dispatch(deleteCategoryAssignmentRuleByIdRedux(categoryAssignmentRuleId));
      return Promise.resolve();
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
};

