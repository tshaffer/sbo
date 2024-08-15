import axios from "axios";
import { TrackerAnyPromiseThunkAction, TrackerDispatch, serverUrl, apiUrlFragment, Category, TrackerState } from "../types";
import { replaceCategoriesRedux } from "../models";

export const loadCategories = (): TrackerAnyPromiseThunkAction => {
  return async (dispatch: TrackerDispatch, getState: () => TrackerState) => {
    const path = serverUrl + apiUrlFragment + 'categories';
    const response: any = await axios.get(path);
    const categories: Category[] = response.data;
    dispatch(replaceCategoriesRedux(categories));
  };
}
