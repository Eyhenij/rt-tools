import { Type } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';

import { TNullable } from '@rt-tools/utils';

// Modal enums
export enum EModalWindowSize {
    SM = '25rem',
    MD = '45rem',
    LG = '65rem',
    FULL = '100%',
}

export type TModalWindowSizeType = EModalWindowSize.SM | EModalWindowSize.MD | EModalWindowSize.LG | EModalWindowSize.FULL;

/** Вид кнопки окна — набор Material, перечисленный один раз. */
export type TModalButtonAppearance = 'standard' | 'raised' | 'flat' | 'stroked' | 'fab' | 'mini-fab';

// Modal data interfaces
export interface IModalIcon {
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
        value: TNullable<T>;
        appearance?: TModalButtonAppearance;
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
        icon?: IModalIcon;
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

    export type ConfirmResponsePredicate<T> = (answer: TNullable<IModal.DataAnswer<T>>) => boolean;

    export interface ConfirmResponse<T> {
        on(predicate: ConfirmResponsePredicate<T>): Observable<TNullable<IModal.DataAnswer<T>>>;

        onCancel(cancel?: ConfirmResponsePredicate<T>): Observable<TNullable<IModal.DataAnswer<T>>>;

        onConfirm(confirm?: ConfirmResponsePredicate<T>): Observable<TNullable<IModal.DataAnswer<T>>>;
    }
}
