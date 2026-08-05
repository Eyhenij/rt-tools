import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Observable, map } from 'rxjs';

/** Порог узкого вьюпорта — тот же, что у `$breakpoint-lg` в стилях кита. */
const NARROW_VIEWPORT_QUERY: string = '(max-width: 1080px)';

/**
 * Обёртка над CDK `BreakpointObserver` — публикует reactive signals для
 * mobile/tablet/desktop матчей. `toSignal()` обёртывает CDK Observable в Signal
 * с `initialValue` для CSR-safe рендера.
 */
@Injectable({ providedIn: 'root' })
export class BreakpointsService {
    readonly #observer: BreakpointObserver = inject(BreakpointObserver);

    public readonly mobile: Signal<boolean> = toSignal(this.#match([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape]), {
        initialValue: false,
    });

    public readonly tablet: Signal<boolean> = toSignal(this.#match([Breakpoints.TabletPortrait, Breakpoints.TabletLandscape]), {
        initialValue: false,
    });

    public readonly desktop: Signal<boolean> = toSignal(this.#match([Breakpoints.WebPortrait, Breakpoints.WebLandscape]), {
        initialValue: true,
    });

    /**
     * Узкий вьюпорт (≤1080px, планшет + мобила) — единый порог для компонентов,
     * которые на узком экране подменяют развёрнутый контрол на компактный
     * (напр. `rt-filter-control`: сегменты → `rt-select`). Совпадает с
     * брейкпоинтом 1080px из SCSS-конвенции кита. `initialValue: false` — на
     * SSR/CSR до первого matchMedia рендерим desktop-вариант.
     */
    public readonly narrow: Signal<boolean> = toSignal(this.#match([NARROW_VIEWPORT_QUERY]), {
        initialValue: false,
    });

    #match(queries: string[]): Observable<boolean> {
        return this.#observer.observe(queries).pipe(map((state: BreakpointState): boolean => state.matches));
    }
}
