import { configureStore } from '@reduxjs/toolkit';
import {AccountState, accountState} from "./accountState";
import {notesState, NotesState} from "./notesState";

export interface RootState {
    account: AccountState,
    notes: NotesState,
}

export default configureStore({
    reducer: {
        account: accountState.reducer,
        notes: notesState.reducer,
    },
})