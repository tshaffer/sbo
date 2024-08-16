import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { useDispatch as useReduxDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { TrackerState } from '../types';

export type TrackerDispatch = ThunkDispatch<TrackerState, undefined, AnyAction>;

export const useDispatch = () => useReduxDispatch<TrackerDispatch>();

export const useTypedSelector: TypedUseSelectorHook<TrackerState> = useSelector;

export type TrackerAnyPromiseThunkAction = ThunkAction<Promise<any>, TrackerState, undefined, AnyAction>;
export type TrackerVoidPromiseThunkAction = ThunkAction<Promise<void>, TrackerState, undefined, AnyAction>;
