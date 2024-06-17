import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { Observable, ReplaySubject, share } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ModalComponent } from './modal.component';
import { ModalData, ModalDataAnswer, ConfirmResponse, ConfirmResponsePredicate, Nullable } from '../../../interfaces';
import { MODAL_WINDOW_WITH_SIZE_ENUM } from '../../../enums';

@Injectable()
export class ModalService {
    readonly #dialogRef: MatDialog = inject(MatDialog);
    readonly #defaultConfig: MatDialogConfig = {
        width: MODAL_WINDOW_WITH_SIZE_ENUM.MD,
        autoFocus: false,
        closeOnNavigation: true,
    };

    public confirm<T>(data: ModalData<T>, config?: MatDialogConfig): Observable<Nullable<ModalDataAnswer<T>>> {
        const dialogRef: MatDialogRef<ModalComponent<T>, ModalDataAnswer<T>> = this.#dialogRef.open<
            ModalComponent<T>,
            ModalData<T>,
            ModalDataAnswer<T>
        >(ModalComponent, {
            ...this.#defaultConfig,
            ...config,
            data,
        });

        return dialogRef.afterClosed();
    }

    public with<T>(data: ModalData<T>, config?: MatDialogConfig): ConfirmResponse<T> {
        /** Replacement for deprecated multicasting operators (https://github.com/ReactiveX/rxjs/issues/6452) */
        const subject$: ReplaySubject<Nullable<ModalDataAnswer<T>>> = new ReplaySubject<Nullable<ModalDataAnswer<T>>>(1);
        const result$: Observable<Nullable<ModalDataAnswer<T>>> = this.confirm(data, config).pipe(
            share({
                connector: () => subject$,
                resetOnError: false,
                resetOnComplete: false,
                resetOnRefCountZero: true,
            })
        );

        const defaultCancel: ConfirmResponsePredicate<T> = (answer: Nullable<ModalDataAnswer<T>>) =>
            !(Boolean(answer) && Boolean(answer?.value));

        const defaultConfirm: ConfirmResponsePredicate<T> = (answer: Nullable<ModalDataAnswer<T>>) =>
            Boolean(answer) && Boolean(answer?.value);

        return {
            onCancel: (cancel: ConfirmResponsePredicate<T> = defaultCancel) =>
                result$.pipe(filter((answer: Nullable<ModalDataAnswer<T>>) => cancel(answer))),
            onConfirm: (confirm: ConfirmResponsePredicate<T> = defaultConfirm) =>
                result$.pipe(filter((answer: Nullable<ModalDataAnswer<T>>) => confirm(answer))),
            on: (predicate: ConfirmResponsePredicate<T>) =>
                result$.pipe(filter((answer: Nullable<ModalDataAnswer<T>>) => predicate(answer))),
        };
    }
}
