import { Type } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

import { Observable } from 'rxjs';

import { Icon, Select } from '../../util/interfaces/modal-data.interface';
import { Nullable } from '../../util/interfaces/nullable.type';

export namespace IModal {
    export interface Button<T> {
        text: string;
        color?: ThemePalette;
        value: Nullable<T>;
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
        select?: Select<T>;
    }

    export interface DataAnswer<T> {
        value: T;
        message: string;
    }

    export type ConfirmResponsePredicate<T> = (answer: Nullable<IModal.DataAnswer<T>>) => boolean;

    export interface ConfirmResponse<T> {
        on(predicate: ConfirmResponsePredicate<T>): Observable<Nullable<IModal.DataAnswer<T>>>;

        onCancel(cancel?: ConfirmResponsePredicate<T>): Observable<Nullable<IModal.DataAnswer<T>>>;

        onConfirm(confirm?: ConfirmResponsePredicate<T>): Observable<Nullable<IModal.DataAnswer<T>>>;
    }
}
