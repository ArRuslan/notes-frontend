import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import CurrentUser from "../types/current_user";

export interface AccountState {
    token: string | null,
    me: CurrentUser,
}

export const accountState = createSlice({
    "name": "account",
    initialState: {
        token: localStorage.getItem("authtoken"),
        me: {
            id: 0,
            email: "",
            name: "",
        },
    } as AccountState,
    reducers: {
        setAuthToken: (state: AccountState, action: PayloadAction<string|null>) => {
            state.token = action.payload;
            action.payload ? localStorage.setItem("authtoken", action.payload) : localStorage.removeItem("authtoken");
        },
        setUser: (state: AccountState, action: PayloadAction<CurrentUser|null>) => {
            action.payload === null ? state.me = {id: 0, email: "", name: ""} : Object.assign(state.me, action.payload);
        },
    }
});

export const {setAuthToken, setUser} = accountState.actions;