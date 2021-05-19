import { createAction, props } from '@ngrx/store';

export const RESET_APP_STATE = '[App] Reset State';

export const resetAppState = createAction(
    RESET_APP_STATE
);
