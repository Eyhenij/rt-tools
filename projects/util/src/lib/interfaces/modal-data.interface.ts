import { ComponentType } from '@angular/cdk/overlay';
import { ThemePalette } from '@angular/material/core';

import { Observable } from 'rxjs';

import { Nullable } from './nullable.type';

export interface ModalButton<T> {
    text: string;
    color?: ThemePalette;
    value: Nullable<T>;
    appearance?: 'standard' | 'raised' | 'flat' | 'stroked' | 'fab' | 'mini-fab';
    validateSelect?: boolean;
    assignSelectedValue?: boolean;
    style?: { [className: string]: string };
    className?: string;
}

export interface ModalIcon {
    value: string;
    style?: { [className: string]: string };
}

export interface ModalSelect<T> {
    value: Array<NameValueType<string, T>>;
    label?: string;
    hint?: string;
}

export interface ModalData<T> {
    icon?: ModalIcon;
    title?: string;
    text?: string;
    confirmation?: string;
    component?: ComponentType<any>;
    buttonsAlign: 'start' | 'center' | 'end';
    buttons: Array<ModalButton<T>>;
    input?: {
        label: string;
        placeholder: string;
        sample: string;
    };
    textArea?: {
        value: string;
        placeholder: string;
    };
    select?: ModalSelect<T>;
}

export interface ModalDataAnswer<T> {
    value: T;
    message: string;
}

export interface NameValueType<N = string, V = string> {
    name: N;
    value: V;
}

export type ConfirmResponsePredicate<T> = (answer: Nullable<ModalDataAnswer<T>>) => boolean;

export interface ConfirmResponse<T> {
    on(predicate: ConfirmResponsePredicate<T>): Observable<Nullable<ModalDataAnswer<T>>>;

    onCancel(cancel?: ConfirmResponsePredicate<T>): Observable<Nullable<ModalDataAnswer<T>>>;

    onConfirm(confirm?: ConfirmResponsePredicate<T>): Observable<Nullable<ModalDataAnswer<T>>>;
}
