import { Type } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';

import { INullable } from '@rt-tools/utils';

// Modal enums
export enum MODAL_WINDOW_SIZE_ENUM {
    SM = '25rem',
    MD = '45rem',
    LG = '65rem',
    FULL = '100%',
}

export type ModalWindowSizeType =
    | MODAL_WINDOW_SIZE_ENUM.SM
    | MODAL_WINDOW_SIZE_ENUM.MD
    | MODAL_WINDOW_SIZE_ENUM.LG
    | MODAL_WINDOW_SIZE_ENUM.FULL;

// Modal data interfaces
export interface Icon {
    value: string;
    style?: { [className: string]: string };
}

export interface INameValueType<N = string, V = string> {
    name: N;
    value: V;
}

export interface ISelect<T> {
    value: Array<INameValueType<string, T>>;
    label?: string;
    hint?: string;
}

export namespace IModal {
    export interface Button<T> {
        text: string;
        color?: ThemePalette;
        value: INullable<T>;
        appearance?: 'standard' | 'raised' | 'flat' | 'stroked' | 'fab' | 'mini-fab';
        validateSelect?: boolean;
        assignSelectedValue?: boolean;
        style?: { [className: string]: string };
        className?: string;
    }

    export interface Data<T> {
        buttonsAlign: 'start' | 'center' | 'end';
        buttons: Array<Button<T>>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component?: Type<any>;
        icon?: Icon;
        title?: string;
        text?: string;
        confirmation?: string;
        input?: {
            label: string;
            placeholder: string;
            value: string;
            sample?: string;
        };
        textArea?: {
            value: string;
            placeholder: string;
        };
        select?: ISelect<T>;
    }

    export interface DataAnswer<T> {
        value: T;
        message: string;
    }

    export type ConfirmResponsePredicate<T> = (answer: INullable<IModal.DataAnswer<T>>) => boolean;

    export interface ConfirmResponse<T> {
        on(predicate: ConfirmResponsePredicate<T>): Observable<INullable<IModal.DataAnswer<T>>>;

        onCancel(cancel?: ConfirmResponsePredicate<T>): Observable<INullable<IModal.DataAnswer<T>>>;

        onConfirm(confirm?: ConfirmResponsePredicate<T>): Observable<INullable<IModal.DataAnswer<T>>>;
    }
}
