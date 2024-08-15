import axios from "axios";
import { Category, serverUrl, apiUrlFragment, TrackerAnyPromiseThunkAction, TrackerDispatch } from "../types";
import { addCategoriesRedux, addCategoryRedux, replaceCategoriesRedux } from "../models";

export const loadCategories = (): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'categories';

    return axios.get(path)
      .then((response: any) => {
        const categories: Category[] = response.data;
        dispatch(replaceCategoriesRedux(categories));
        return Promise.resolve();
      }).catch((error) => {
        console.log('error');
        console.log(error);
        return '';
      });
  };
};

export const addCategory = (category: Category): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'addCategory';

    const addCategoryBody = category;

    return axios.post(
      path,
      addCategoryBody
    ).then((response) => {
      console.log('addCategory');
      console.log(response);
      console.log(response.data);
      dispatch(addCategoryRedux(category));
      return Promise.resolve(response.data as Category);
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
};

export const addCategories = (categories: Category[]): TrackerAnyPromiseThunkAction => {

  return (dispatch: TrackerDispatch, getState: any) => {

    const path = serverUrl + apiUrlFragment + 'addCategories';

    const addCategoriesBody = categories;

    return axios.post(
      path,
      addCategoriesBody
    ).then((response) => {
      console.log('addCategories');
      console.log(response);
      console.log(response.data);
      dispatch(addCategoriesRedux(categories));
      return Promise.resolve();
    }).catch((error) => {
      console.log('error');
      console.log(error);
      return '';
    });
  };
};

