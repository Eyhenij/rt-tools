import { Injector, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { filter, finalize, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';

import { RtAsideUnsavedDialogComponent } from '../aside/unsaved-dialog/rt-aside-unsaved-dialog.component';
import { ERtAsideUnsavedOutcome } from '../aside/unsaved-dialog/rt-aside-unsaved.logic';
import { RtDialogService } from '../dialog/rt-dialog.service';

/** То, что вопрос о правках знает о панели: чем записать и чем узнать исход записи. */
export interface IRtRouteAsideUnsavedDeps {
    save: () => void;
    submitting: Signal<boolean>;
    submitError: Signal<string | null>;
}

/**
 * Вопрос о несохранённых правках, заданный уходу по маршруту.
 *
 * Окно открывается одно на все уходы, пришедшие пока оно висит: второе поставило бы поверх
 * первого наложение, убрать которое было бы некому. Ответ раздаётся всем спросившим, а после
 * закрытия окна следующий уход спрашивает заново.
 */
export class RtRouteAsideUnsavedPrompt {
    readonly #dialog: RtDialogService;
    readonly #injector: Injector;
    readonly #deps: IRtRouteAsideUnsavedDeps;

    /** Вопрос, который сейчас висит. `null` — окна нет, и следующий уход откроет своё. */
    #pendingAsk$: Observable<boolean> | null = null;

    constructor(dialog: RtDialogService, injector: Injector, deps: IRtRouteAsideUnsavedDeps) {
        this.#dialog = dialog;
        this.#injector = injector;
        this.#deps = deps;
    }

    /** Отпускать ли уход. Пока окно висит, все спросившие получают один и тот же ответ. */
    public ask(): Observable<boolean> {
        const pending: Observable<boolean> | null = this.#pendingAsk$;

        if (pending !== null) {
            return pending;
        }

        const ask$: Observable<boolean> = this.#dialog
            .open<RtAsideUnsavedDialogComponent, undefined, ERtAsideUnsavedOutcome>(RtAsideUnsavedDialogComponent)
            .afterClosed()
            .pipe(
                switchMap((outcome: ERtAsideUnsavedOutcome | undefined): Observable<boolean> => this.#deactivateAfter(outcome)),
                finalize((): void => {
                    this.#pendingAsk$ = null;
                }),
                shareReplay({ bufferSize: 1, refCount: false })
            );

        this.#pendingAsk$ = ask$;

        return ask$;
    }

    /**
     * Что делать с уходом после ответа человека. «Закрыть с сохранением» ждёт конца записи:
     * панель уступает место только удачной — иначе правки пропали бы вместе с отказом, о
     * котором человек ещё не знает.
     */
    #deactivateAfter(outcome: ERtAsideUnsavedOutcome | undefined): Observable<boolean> {
        if (outcome === ERtAsideUnsavedOutcome.Discard) {
            return of(true);
        }

        if (outcome !== ERtAsideUnsavedOutcome.Save) {
            return of(false);
        }

        this.#deps.save();

        // Запись могла и не начаться — например, черновик не годится
        if (!this.#deps.submitting()) {
            return of(false);
        }

        return toObservable(this.#deps.submitting, { injector: this.#injector }).pipe(
            filter((submitting: boolean): boolean => !submitting),
            take(1),
            map((): boolean => this.#deps.submitError() === null)
        );
    }
}
