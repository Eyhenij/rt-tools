import { Signal, isSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, PristineChangeEvent } from '@angular/forms';

import { filter, map, Observable, of, startWith, switchMap } from 'rxjs';

/**
 * Признак нетронутой формы.
 *
 * Контрол принимается и сигналом: форма панели собрана директивой формы и до отрисовки
 * шаблона её ещё нет, поэтому запрос вида отдаёт её только сигналом. Нынешнее состояние
 * подставляется первым значением — события прошлого подписка не получит, и без него кнопка
 * записи осталась бы недоступной у формы, испачканной до подписки.
 *
 * Зовётся в контексте внедрения: `toObservable` и `toSignal` требуют его сами.
 */
export function pristineOf(control: AbstractControl | Signal<AbstractControl | undefined>): Signal<boolean> {
    const control$: Observable<AbstractControl | undefined> = isSignal(control) ? toObservable(control) : of(control);

    return toSignal(
        control$.pipe(
            switchMap((current: AbstractControl | undefined): Observable<boolean> => {
                if (current === undefined) {
                    return of(true);
                }

                return current.events.pipe(
                    filter((event: unknown): event is PristineChangeEvent => event instanceof PristineChangeEvent),
                    map((event: PristineChangeEvent): boolean => event.pristine),
                    startWith(current.pristine)
                );
            })
        ),
        { initialValue: true }
    );
}
