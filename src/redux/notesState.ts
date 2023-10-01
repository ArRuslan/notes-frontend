import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import Note from "../types/note";

export interface NotesState {
    by_id: {[key:number]: Note},
    current: number | undefined,
}

export const notesState = createSlice({
    "name": "notes",
    initialState: {
        by_id: {},
        current: undefined,
    } as NotesState,
    reducers: {
        updateNote: (state: NotesState, action: PayloadAction<Note>) => {
            const note = action.payload;
            note.id in state.by_id ? Object.assign(state.by_id[note.id], note) : state.by_id[note.id] = note;
        },
        setCurrent: (state: NotesState, action: PayloadAction<number>) => {
            state.current = action.payload;
        },
    }
});

export const {updateNote, setCurrent} = notesState.actions;