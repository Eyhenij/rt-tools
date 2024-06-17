export enum MODAL_WINDOW_WITH_SIZE_ENUM {
    SM = '25rem',
    MD = '45rem',
    LG = '65rem',
    FULL = '100%',
}

export type ModalWindowWithSizeType =
    | MODAL_WINDOW_WITH_SIZE_ENUM.SM
    | MODAL_WINDOW_WITH_SIZE_ENUM.MD
    | MODAL_WINDOW_WITH_SIZE_ENUM.LG
    | MODAL_WINDOW_WITH_SIZE_ENUM.FULL;
