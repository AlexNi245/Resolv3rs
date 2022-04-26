import { ActionMap } from './shared';
import * as Lib from '../../lib';

export enum SelectedRightView {
    Error,
    MainFeed,
    Chat,
    UserInfo,
}

export interface UiState {
    showAddContact: boolean;
    selectedRightView: SelectedRightView;
}

export enum UiStateType {
    SetShowAddContact = 'SET_SHOW_ADD_CONTACT',
    SetSelectedRightView = 'SET_SELECTED_RIGHT_VIEW',
}

export type UiStatePayload = {
    [UiStateType.SetShowAddContact]: boolean;
    [UiStateType.SetSelectedRightView]: SelectedRightView;
};

export type UiStateActions =
    ActionMap<UiStatePayload>[keyof ActionMap<UiStatePayload>];

export function uiStateReducer(
    state: UiState,
    action: UiStateActions,
): UiState {
    switch (action.type) {
        case UiStateType.SetShowAddContact:
            Lib.log(`Set show add contact form ${action.payload}`);
            return {
                ...state,
                showAddContact: action.payload,
            };

        case UiStateType.SetSelectedRightView:
            Lib.log(`Change right view to ${action.payload}`);
            return {
                ...state,
                selectedRightView: action.payload,
            };

        default:
            return state;
    }
}