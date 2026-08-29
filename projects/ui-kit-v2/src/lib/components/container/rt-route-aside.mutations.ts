import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, map, mergeMap, Observable, of, Subject } from 'rxjs';

/** Одна запущенная правка: сам поток работы и приёмы её удачи и отказа. */
export interface IRtRouteAsideMutation {
    op$: Observable<unknown>;
    handleSuccess: () => void;
    handleError: (error: unknown) => void;
}

/**
 * Правки, запущенные панелью.
 *
 * Подписка объявлена одна на панель, а не заводится на каждый вызов: каждая правка живёт
 * независимо от соседней, и отказ одной не уносит поток остальных. Приёмы удачи и отказа
 * приезжают вместе с работой — они замыкают доводы своего вызова.
 */
export class RtRouteAsideMutations {
    readonly #mutationSource: Subject<IRtRouteAsideMutation> = new Subject<IRtRouteAsideMutation>();

    constructor(destroyRef: DestroyRef) {
        this.#mutationSource
            .pipe(
                mergeMap((mutation: IRtRouteAsideMutation): Observable<() => void> =>
                    mutation.op$.pipe(
                        map((): (() => void) => mutation.handleSuccess),
                        catchError((error: unknown): Observable<() => void> => of((): void => mutation.handleError(error)))
                    )
                ),
                takeUntilDestroyed(destroyRef)
            )
            .subscribe((handleResult: () => void): void => handleResult());
    }

    /** Пускает правку в объявленный поток. */
    public run(mutation: IRtRouteAsideMutation): void {
        this.#mutationSource.next(mutation);
    }
}
