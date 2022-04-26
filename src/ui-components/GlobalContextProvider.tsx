import React, { Dispatch } from 'react';
import { ConnectionActions, connectionReducer } from './reducers/Connection';
import { EnsNamesActions, ensNamesReducer } from './reducers/EnsNames';
import { AccountsActions, accountsReducer } from './reducers/Accounts';
import { GlobalState, initialState } from './reducers/shared';
import { UserDbActions, userDbReducer } from './reducers/UserDB';
import { UiStateActions, uiStateReducer } from './reducers/UiState';
import { FeedActions, feedReducer } from './reducers/Feed';

type Actions =
    | ConnectionActions
    | EnsNamesActions
    | AccountsActions
    | UserDbActions
    | UiStateActions
    | FeedActions;

export const GlobalContext = React.createContext<{
    state: GlobalState;
    dispatch: Dispatch<Actions>;
}>({ state: initialState, dispatch: () => null });

interface GlobalContextProviderProps {
    children: JSX.Element;
}

const mainReducer = (state: GlobalState, action: Actions): GlobalState => ({
    connection: connectionReducer(
        state.connection,
        action as ConnectionActions,
    ),
    ensNames: ensNamesReducer(state.ensNames, action as EnsNamesActions),
    accounts: accountsReducer(state.accounts, action as AccountsActions),
    userDb: userDbReducer(state.userDb, action as UserDbActions),
    uiState: uiStateReducer(state.uiState, action as UiStateActions),
    feed: feedReducer(state.feed, action as FeedActions),
});

function GlobalContextProvider(props: GlobalContextProviderProps) {
    const [state, dispatch] = React.useReducer(mainReducer, initialState);

    return (
        <GlobalContext.Provider value={{ state, dispatch }}>
            {props.children}
        </GlobalContext.Provider>
    );
}

export default GlobalContextProvider;