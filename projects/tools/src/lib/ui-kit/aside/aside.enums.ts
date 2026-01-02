export enum ASIDE_BUTTONS_ENUM {
    USER_ACTIVE = 'User active',
    USER_INACTIVE = 'User inactive',
    DELETE = 'Delete',
    RESET = 'Reset',
}

export type AsideButtonsType =
    | ASIDE_BUTTONS_ENUM.USER_ACTIVE
    | ASIDE_BUTTONS_ENUM.USER_INACTIVE
    | ASIDE_BUTTONS_ENUM.DELETE
    | ASIDE_BUTTONS_ENUM.RESET;
