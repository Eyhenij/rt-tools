export enum EAsideButtons {
    USER_ACTIVE = 'User active',
    USER_INACTIVE = 'User inactive',
    DELETE = 'Delete',
    RESET = 'Reset',
}

export type TAsideButtonsType = EAsideButtons.USER_ACTIVE | EAsideButtons.USER_INACTIVE | EAsideButtons.DELETE | EAsideButtons.RESET;
