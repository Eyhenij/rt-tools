import { Type } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

import { Observable } from 'rxjs';

import { Nullable } from './nullable.type';

export namespace IModal {
    export interface Button<T> {
        text: string;
        color?: ThemePalette;
        value: Nullable<T>;
        appearance?:
            | 'standard'
            | 'raised'
            | 'flat'
            | 'stroked'
            | 'fab'
            | 'mini-fab';
        validateSelect?: boolean;
        assignSelectedValue?: boolean;
        style?: { [className: string]: string };
        className?: string;
    }

    export interface Data<T> {
        buttonsAlign: 'start' | 'center' | 'end';
        buttons: Array<Button<T>>;

        component?: Type<any>;
        icon?: Icon;
        title?: string;
        text?: string;
        confirmation?: string;
        input?: {
            label: string;
            placeholder: string;
            sample: string;
        };
        textArea?: {
            value: string;
            placeholder: string;
        };
        select?: Select<T>;
    }

    export interface DataAnswer<T> {
        value: T;
        message: string;
    }

    export interface Icon {
        value: string;
        style?: { [className: string]: string };
    }

    export interface Select<T> {
        value: Array<NameValueType<string, T>>;
        label?: string;
        hint?: string;
    }

    export interface NameValueType<N = string, V = string> {
        name: N;
        value: V;
    }

    export type ConfirmResponsePredicate<T> = (
        answer: Nullable<IModal.DataAnswer<T>>,
    ) => boolean;

    export interface ConfirmResponse<T> {
        on(
            predicate: ConfirmResponsePredicate<T>,
        ): Observable<Nullable<IModal.DataAnswer<T>>>;

        onCancel(
            cancel?: ConfirmResponsePredicate<T>,
        ): Observable<Nullable<IModal.DataAnswer<T>>>;

        onConfirm(
            confirm?: ConfirmResponsePredicate<T>,
        ): Observable<Nullable<IModal.DataAnswer<T>>>;
    }
}
