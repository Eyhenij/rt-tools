import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Observable, ReplaySubject, share } from 'rxjs';
import { filter } from 'rxjs/operators';

import { TNullable } from '@rt-tools/utils';
import { EModalWindowSize } from './modal.types';
import { RtuiModalComponent } from './modal.component';
import { IModal } from './modal.types';

@Injectable()
export class RtModalService {
    readonly #dialogRef: MatDialog = inject(MatDialog);
    readonly #defaultConfig: MatDialogConfig = {
        width: EModalWindowSize.MD,
        autoFocus: false,
        closeOnNavigation: true,
    };

    public confirm<T>(data: IModal.Data<T>, config?: MatDialogConfig): Observable<TNullable<IModal.DataAnswer<T>>> {
        const dialogRef: MatDialogRef<RtuiModalComponent<T>, IModal.DataAnswer<T>> = this.#dialogRef.open<
            RtuiModalComponent<T>,
            IModal.Data<T>,
            IModal.DataAnswer<T>
        >(RtuiModalComponent, {
            ...this.#defaultConfig,
            ...config,
            data,
        });

        return dialogRef.afterClosed();
    }

    public with<T>(data: IModal.Data<T>, config?: MatDialogConfig): IModal.ConfirmResponse<T> {
        /** Replacement for deprecated multicasting operators (https://github.com/ReactiveX/rxjs/issues/6452) */
        const subject$: ReplaySubject<TNullable<IModal.DataAnswer<T>>> = new ReplaySubject<TNullable<IModal.DataAnswer<T>>>(1);
        const result$: Observable<TNullable<IModal.DataAnswer<T>>> = this.confirm(data, config).pipe(
            share({
                connector: () => subject$,
                resetOnError: false,
                resetOnComplete: false,
                resetOnRefCountZero: true,
            })
        );

        const defaultCancel: IModal.ConfirmResponsePredicate<T> = (answer: TNullable<IModal.DataAnswer<T>>) =>
            !(Boolean(answer) && Boolean(answer?.value));

        const defaultConfirm: IModal.ConfirmResponsePredicate<T> = (answer: TNullable<IModal.DataAnswer<T>>) =>
            Boolean(answer) && Boolean(answer?.value);

        return {
            onCancel: (cancel: IModal.ConfirmResponsePredicate<T> = defaultCancel) =>
                result$.pipe(filter((answer: TNullable<IModal.DataAnswer<T>>) => cancel(answer))),
            onConfirm: (confirm: IModal.ConfirmResponsePredicate<T> = defaultConfirm) =>
                result$.pipe(filter((answer: TNullable<IModal.DataAnswer<T>>) => confirm(answer))),
            on: (predicate: IModal.ConfirmResponsePredicate<T>) =>
                result$.pipe(filter((answer: TNullable<IModal.DataAnswer<T>>) => predicate(answer))),
        };
    }
}
