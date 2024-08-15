import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { useDispatch as useReduxDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { TrackerState } from '../types';

export type TrackerDispatch = ThunkDispatch<TrackerState, undefined, AnyAction>;

export const useDispatch = () => useReduxDispatch<TrackerDispatch>();

// If you need to useSelector with typed state
export const useTypedSelector: TypedUseSelectorHook<TrackerState> = useSelector;

// export type TrackerDispatch = ThunkDispatch<TrackerState, undefined, TrackerAction<AnyAction>>;
// export type TrackerVoidPromiseThunkAction = (dispatch: TrackerDispatch, getState: () => TrackerState, extraArgument: undefined) => Promise<void>;
// export type TrackerAnyPromiseThunkAction = (dispatch: TrackerDispatch, getState: () => TrackerState, extraArgument: undefined) => Promise<any>;
// export const initializeServer = (): ThunkAction<Promise<void>, TrackerState, undefined, AnyAction> => {
export type TrackerVoidPromiseThunkAction = ThunkAction<Promise<void>, TrackerState, undefined, AnyAction>;