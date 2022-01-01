import { createReducer, on } from '@ngrx/store';
import { resetAppState } from './app.actions';

export const initialState: {} = {};

export const appReducer = createReducer(
    initialState,
    on(resetAppState, state => initialState)
)
